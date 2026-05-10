import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { PermissionService } from "../authz/permission.service";
import { AiAuthoringProviderService } from "../ai-authoring/ai-authoring-provider.service";

type TrendLevel = "normal" | "watch" | "elevated" | "high" | "red";
type SourceType = "live_backend" | "local_cache" | "demo_seed" | "demo_encrypted";
type ProviderType = "gemma_local_cactus" | "backend_cloud" | "template_fallback";

@Injectable()
export class StudentTrendsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authz: PermissionService,
    private readonly aiProvider: AiAuthoringProviderService,
  ) {}

  private mapScoreToLevel(score: number): TrendLevel {
    if (score >= -6) return "normal";
    if (score >= -12) return "watch";
    if (score >= -20) return "elevated";
    if (score >= -30) return "high";
    return "red";
  }

  private parseJson<T>(raw?: string | null, fallback?: T): T {
    if (!raw) return (fallback as T);
    try { return JSON.parse(raw) as T; } catch { return (fallback as T); }
  }

  private decodeDemoEncryptedSignalBundle(payload?: string | null): any[] {
    if (!payload || !payload.startsWith("DEMOENC:")) return [];
    try {
      const decoded = Buffer.from(payload.slice(8), "base64").toString("utf-8");
      const parsed = JSON.parse(decoded);
      return Array.isArray(parsed?.signals) ? parsed.signals : [];
    } catch {
      return [];
    }
  }

  private safeNum(value: unknown) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  private buildLevelSummary(score: number) {
    const level = this.mapScoreToLevel(score);
    const redAlert = level === "red";
    return { level, redAlert };
  }

  private parseRecommendationJson(text: string) {
    try {
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      if (start < 0 || end <= start) return null;
      const parsed = JSON.parse(text.slice(start, end + 1));
      if (!parsed || typeof parsed !== "object") return null;
      return {
        title: String(parsed.title || ""),
        summary: String(parsed.summary || ""),
        keyFactors: Array.isArray(parsed.keyFactors) ? parsed.keyFactors.map((x: any) => String(x)) : [],
        suggestedActions: Array.isArray(parsed.suggestedActions) ? parsed.suggestedActions.map((x: any) => String(x)) : [],
      };
    } catch {
      return null;
    }
  }

  private async generateRecommendation(packet: any): Promise<{ provider: ProviderType; title: string; summary: string; keyFactors: string[]; suggestedActions: string[] }> {
    const prompt = [
      "Return strict JSON only: {title,summary,keyFactors,suggestedActions}.",
      "Use only provided packet, do not invent data, do not include raw private text.",
      JSON.stringify({
        studentId: packet.studentId,
        level: packet.level,
        redAlert: packet.redAlert,
        direction: packet.direction,
        totalDeduction: packet.totalDeduction,
        topContributingFactors: packet.topContributingFactors,
        categoryBreakdown: packet.categoryBreakdown,
      }),
    ].join("\n");

    const cactusUrl = process.env.GEMMA_LOCAL_CACTUS_URL;
    if (cactusUrl) {
      try {
        const resp = await fetch(cactusUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, mode: "parent_trend_recommendation" }),
        });
        const json: any = await resp.json().catch(() => ({}));
        const text = typeof json?.text === "string" ? json.text : JSON.stringify(json);
        const parsed = this.parseRecommendationJson(text);
        if (resp.ok && parsed) return { provider: "gemma_local_cactus", ...parsed };
      } catch {}
    }

    const cloudApiKey = process.env.BACKEND_CLOUD_API_KEY;
    const cloudModel = process.env.BACKEND_CLOUD_MODEL || "gemini-2.5-flash";
    if (cloudApiKey) {
      const ai = await this.aiProvider.generateText({ apiKey: cloudApiKey, modelId: cloudModel, prompt });
      const parsed = this.parseRecommendationJson(ai.text || "");
      if (ai.ok && parsed) return { provider: "backend_cloud", ...parsed };
    }

    return {
      provider: "template_fallback",
      title: packet.redAlert ? "Immediate coordinated support recommended" : "Continue guided support at home",
      summary: packet.redAlert
        ? "Multiple signals are elevated. Review the vault and coordinate with school support in a calm, structured way."
        : "Signals suggest monitoring and steady routines can support wellbeing and learning.",
      keyFactors: (packet.topContributingFactors || []).slice(0, 5),
      suggestedActions: packet.redAlert
        ? ["Open Health & Wellbeing Vault", "Start calm check-in", "Coordinate with teacher/school support"]
        : ["Continue monitoring", "Keep sleep and routine stable", "Review weekly learning focus"],
    };
  }

  async evaluateAndSave(studentId: string, source: SourceType, packetOverride?: any) {
    const now = new Date();
    const from14 = new Date(now.getTime() - 14 * 86400000);
    const [events, alerts, supportRequests, quizzes, assignments, metrics, student] = await Promise.all([
      this.prisma.studentEvent.findMany({ where: { studentId, createdAt: { gte: from14 } }, orderBy: { createdAt: "asc" } }),
      this.prisma.childHealthAlert.findMany({ where: { studentId, createdAt: { gte: from14 } }, orderBy: { createdAt: "asc" } }),
      this.prisma.supportRequest.findMany({ where: { studentId, createdAt: { gte: from14 } }, orderBy: { createdAt: "asc" } }),
      this.prisma.quizResult.findMany({ where: { studentId, createdAt: { gte: from14 } }, orderBy: { createdAt: "asc" } }),
      this.prisma.assignment.findMany({ where: { studentId } }),
      this.prisma.phoneHealthMetric.findMany({ where: { studentId, capturedAt: { gte: from14 } }, orderBy: { capturedAt: "asc" } }),
      this.prisma.student.findUnique({ where: { id: studentId } }),
    ]);

    const eventItems: any[] = [];
    for (const event of events) {
      const meta = this.parseJson<any>(event.metadataJson, {});
      const baseSeverity = event.severity === "high" ? 5 : event.severity === "medium" ? 3 : 2;
      const encryptedSignals = this.decodeDemoEncryptedSignalBundle(meta?.encryptedSignalBundle);
      const eventSource: SourceType = event.source === "demo_encrypted" ? "demo_encrypted" : source;
      if (encryptedSignals.length > 0) {
        for (const signal of encryptedSignals) {
          eventItems.push({
            category: String(signal.category || "conversation"),
            subType: String(signal.type || "encrypted_signal"),
            points: -Math.max(2, this.safeNum(signal.severity)),
            reason: String(signal.safeLabel || "Encrypted demo signal"),
            source: eventSource,
            severity: Math.max(1, Math.min(5, this.safeNum(signal.severity) || 3)),
            createdAt: event.createdAt.toISOString(),
            evidence: [String(signal.safeSummary || signal.safeLabel || "demo encrypted signal")],
          });
        }
      }

      let category = "learning";
      let subType = "learningBehavior";
      if (event.type.includes("wellbeing") || event.type.includes("support")) {
        category = "wellbeing";
        subType = "supportSignal";
      } else if (event.type.includes("conversation") || event.type.includes("distress") || event.type.includes("help_seeking")) {
        category = "conversation";
        subType = "distressSignal";
      } else if (event.type.includes("attendance") || event.type.includes("teacher") || event.type.includes("parent")) {
        category = "teacher_parent";
        subType = "teacherConcernNote";
      }

      eventItems.push({
        category,
        subType,
        points: -baseSeverity,
        reason: event.safeSummary,
        source: eventSource,
        severity: baseSeverity,
        createdAt: event.createdAt.toISOString(),
        evidence: [event.safeSummary],
        metadata: meta,
      });
    }

    alerts.forEach((alert) => {
      eventItems.push({
        category: "physical",
        subType: "fatigue",
        points: alert.level === "high" ? -6 : -4,
        reason: alert.safeSummary,
        source,
        severity: alert.level === "high" ? 5 : 4,
        createdAt: alert.createdAt.toISOString(),
        evidence: [alert.recommendedAction],
      });
    });

    const teacherNotes = events.filter((e) => e.type === "teacher_concern_note").length;
    const parentNotes = events.filter((e) => e.type === "parent_concern_note").length;
    const attendanceFlags = events.filter((e) => e.type === "attendance_flag").length;
    const lateFlags = events.filter((e) => e.type === "late_flag").length;
    const missingAssignments = assignments.filter((a) => a.status === "missing").length;

    if (teacherNotes + parentNotes + attendanceFlags + lateFlags + missingAssignments > 0) {
      eventItems.push({
        category: "teacher_parent",
        subType: "teacherConcernNote",
        points: -(teacherNotes + parentNotes + attendanceFlags + lateFlags + missingAssignments),
        reason: "Teacher/parent concern and attendance/assignment flags recorded.",
        source,
        severity: 3,
        createdAt: now.toISOString(),
        evidence: ["teacher_parent_signals"],
      });
    }

    const totalDeduction = Number(eventItems.reduce((s, i) => s + this.safeNum(i.points), 0).toFixed(2));
    const { level, redAlert } = this.buildLevelSummary(totalDeduction);

    const byCategory = (category: string) => eventItems.filter((i) => i.category === category);
    const catScore = (category: string) => Number(byCategory(category).reduce((s, i) => s + this.safeNum(i.points), 0).toFixed(2));

    const latestMetric = metrics[metrics.length - 1];
    const supportSignalCount = supportRequests.length;
    const wrongAttempts = events.filter((e) => e.type === "repeated_wrong_attempts").length;
    const helpRequests = events.filter((e) => e.type === "repeated_ai_help").length;
    const lowConfidenceEvents = events.filter((e) => e.type === "low_confidence_signal").length;
    const frustrationEvents = events.filter((e) => e.type === "frustration_signal").length;
    const dropOffEvents = events.filter((e) => e.type === "lesson_drop_off").length;

    const latestSummary = {
      id: `nps_${studentId}_${Date.now()}`,
      studentId,
      date: now.toISOString().slice(0, 10),
      windowDays: [1, 3, 7, 14],
      totalDeduction,
      level,
      direction: totalDeduction <= -14 ? "worsening" : "stable",
      confidence: eventItems.length >= 10 ? "high" : eventItems.length >= 4 ? "medium" : "low",
      items: eventItems,
      topReasons: eventItems.slice(0, 5).map((i) => i.reason),
      sourceCounts: eventItems.reduce((acc: Record<string, number>, i) => {
        acc[i.category] = (acc[i.category] || 0) + 1;
        return acc;
      }, {}),
      generatedAt: now.toISOString(),
      source,
    };

    const categoryBreakdown = {
      physical: {
        level: this.mapScoreToLevel(catScore("physical")),
        score: catScore("physical"),
        reasons: byCategory("physical").slice(0, 3).map((i) => i.reason),
        metrics: {
          sleep: latestMetric?.sleepMinutes ? `${(latestMetric.sleepMinutes / 60).toFixed(1)}h` : null,
          fatigue: alerts.length > 0 ? alerts[0].level : null,
          energy: null,
          movement: latestMetric?.activeMinutes ? `${latestMetric.activeMinutes} min` : null,
          restingHeartRate: latestMetric?.restingHeartRate ? `${latestMetric.restingHeartRate} bpm` : null,
          studyMinutes: null,
        },
      },
      wellbeing: {
        level: this.mapScoreToLevel(catScore("wellbeing")),
        score: catScore("wellbeing"),
        reasons: byCategory("wellbeing").slice(0, 3).map((i) => i.reason),
        metrics: {
          mood: null,
          schoolStress: null,
          socialComfort: null,
          supportRequest: supportSignalCount > 0 ? "requested" : "none",
          supportSignalCount,
        },
      },
      learning: {
        level: this.mapScoreToLevel(catScore("learning")),
        score: catScore("learning"),
        reasons: byCategory("learning").slice(0, 3).map((i) => i.reason),
        metrics: {
          quizTrend: quizzes.length >= 2 ? (quizzes[quizzes.length - 1].score - quizzes[0].score < 0 ? "declining" : "stable_or_improving") : "insufficient",
          wrongAttempts,
          helpRequests,
          lowConfidenceEvents,
          frustrationEvents,
          dropOffEvents,
          studyEfficiency: dropOffEvents > 0 ? "low" : "normal",
        },
      },
      conversation: {
        level: this.mapScoreToLevel(catScore("conversation")),
        score: catScore("conversation"),
        reasons: byCategory("conversation").slice(0, 3).map((i) => i.reason),
        metrics: {
          distressSignals: events.filter((e) => e.type === "conversation_distress_signal").length,
          helpSeekingSignals: events.filter((e) => e.type === "conversation_help_seeking_signal").length,
          withdrawalSignals: events.filter((e) => e.type === "conversation_withdrawal_signal").length,
          emotionalLoadSignals: events.filter((e) => e.type === "conversation_emotional_load_signal").length,
          safetyReviewSignals: events.filter((e) => e.type === "conversation_safety_review_signal").length,
        },
      },
      teacherParent: {
        level: this.mapScoreToLevel(catScore("teacher_parent")),
        score: catScore("teacher_parent"),
        reasons: byCategory("teacher_parent").slice(0, 3).map((i) => i.reason),
        metrics: {
          teacherConcernNotes: teacherNotes,
          parentConcernNotes: parentNotes,
          attendanceFlags,
          lateFlags,
          missingAssignments,
        },
      },
    };

    const packet = packetOverride ?? {
      id: `pkt_${studentId}_${Date.now()}`,
      studentId,
      generatedAt: now.toISOString(),
      level,
      redAlert,
      direction: latestSummary.direction,
      confidence: latestSummary.confidence,
      totalDeduction,
      negativeSummary: latestSummary,
      topContributingFactors: latestSummary.topReasons.slice(0, 5),
      categoryBreakdown,
      allowedAudiences: ["parent", "homeroom_teacher", "guardian_teacher", "admin", "school_support"],
      source,
      provider: "template_fallback" as ProviderType,
      rawPrivateTextIncluded: false,
    };

    const snapshot = await this.prisma.studentTrendSnapshot.create({
      data: {
        studentId,
        level: packet.level,
        totalDeduction: packet.totalDeduction,
        direction: packet.direction,
        confidence: packet.confidence,
        redAlert: packet.redAlert,
        packetJson: JSON.stringify(packet),
        source,
        generatedAt: new Date(packet.generatedAt),
      },
    });

    await this.prisma.studentTrendChartPoint.create({
      data: {
        studentId,
        date: new Date(packet.generatedAt),
        totalDeduction: packet.totalDeduction,
        level: packet.level,
        sleepDeduction: categoryBreakdown.physical.score,
        fatigueDeduction: categoryBreakdown.physical.score,
        studyLoadDeduction: categoryBreakdown.learning.score,
        learningBehaviorDeduction: categoryBreakdown.learning.score,
        wellbeingDeduction: categoryBreakdown.wellbeing.score,
        conversationDeduction: categoryBreakdown.conversation.score,
        supportSignalDeduction: categoryBreakdown.teacherParent.score,
      },
    });

    const recommendation = await this.generateRecommendation(packet);
    const title = recommendation.title || (redAlert ? "RED ALERT: wellbeing and learning trend requires attention" : "Wellbeing & Learning trend update");
    const summary = recommendation.summary || (redAlert
      ? "Multiple signals are elevated across at least one category. Please review the vault and coordinate support."
      : "Nightly trend generated from safe school signals across learning, wellbeing, physical, conversation, and teacher/parent categories.");

    const report = await this.prisma.studentTrendReport.create({
      data: {
        studentId,
        packetId: snapshot.id,
        audience: "parent",
        title,
        summary,
        keyFactors: JSON.stringify((recommendation.keyFactors || packet.topContributingFactors || []).slice(0, 5)),
        suggestedActions: JSON.stringify((recommendation.suggestedActions || []).slice(0, 8)),
        redAlert,
        provider: recommendation.provider,
        source,
        generatedAt: new Date(packet.generatedAt),
      },
    });

    return { ok: true, snapshot, report, packet, studentName: student?.fullName || studentId };
  }

  async getLatest(studentId: string) {
    const latest = await this.prisma.studentTrendSnapshot.findFirst({ where: { studentId }, orderBy: { generatedAt: "desc" } });
    return { ok: true, packet: latest?.packetJson ? JSON.parse(latest.packetJson) : null, snapshot: latest ?? null };
  }

  async getParentTrendReport(studentId: string, actor: any) {
    await this.authz.assertCanViewParentChild(actor, studentId);
    const [report, latest, student] = await Promise.all([
      this.prisma.studentTrendReport.findFirst({ where: { studentId, audience: "parent" }, orderBy: { generatedAt: "desc" } }),
      this.prisma.studentTrendSnapshot.findFirst({ where: { studentId }, orderBy: { generatedAt: "desc" } }),
      this.prisma.student.findUnique({ where: { id: studentId } }),
    ]);
    await this.authz.writeAccessAuditLog(actor, "read_parent_trend_report", "student", studentId, "parent_trend_report");
    if (!report || !latest) return { ok: false, error: "report_not_found" };

    const packet = JSON.parse(latest.packetJson || "{}");
    const chartResp = await this.getParentTrendChart(studentId, actor, 14);
    return {
      ok: true,
      studentId,
      childName: student?.fullName || studentId,
      latestPacketId: latest.id,
      level: packet.level || latest.level,
      redAlert: Boolean(packet.redAlert ?? latest.redAlert),
      title: report.title,
      summary: report.summary,
      keyFactors: this.parseJson<string[]>(report.keyFactors, []),
      suggestedActions: this.parseJson<string[]>(report.suggestedActions, []),
      chart: chartResp.points,
      categoryBreakdown: packet.categoryBreakdown || {
        physical: { level: "normal", score: 0, reasons: [], metrics: {} },
        wellbeing: { level: "normal", score: 0, reasons: [], metrics: {} },
        learning: { level: "normal", score: 0, reasons: [], metrics: {} },
        conversation: { level: "normal", score: 0, reasons: [], metrics: {} },
        teacherParent: { level: "normal", score: 0, reasons: [], metrics: {} },
      },
      latestSummary: packet.negativeSummary || { totalDeduction: latest.totalDeduction, level: latest.level, items: [] },
      generatedAt: report.generatedAt.toISOString(),
      provider: (report.provider || "template_fallback") as ProviderType,
      source: (report.source || latest.source || "demo_seed") as SourceType,
      direction: packet.direction || "stable",
      reportId: report.id,
    };
  }

  async getParentTrendChart(studentId: string, actor: any, days = 14) {
    await this.authz.assertCanViewParentChild(actor, studentId);
    const from = new Date(Date.now() - Math.max(1, days) * 86400000);
    const rows = await this.prisma.studentTrendChartPoint.findMany({ where: { studentId, date: { gte: from } }, orderBy: { date: "asc" } });
    return {
      ok: true,
      points: rows.map((row: any) => ({
        date: row.date.toISOString().slice(0, 10),
        totalDeduction: row.totalDeduction,
        level: row.level,
        physicalDeduction: row.sleepDeduction + row.fatigueDeduction,
        wellbeingDeduction: row.wellbeingDeduction,
        learningDeduction: row.learningBehaviorDeduction,
        conversationDeduction: row.conversationDeduction,
        teacherParentDeduction: row.supportSignalDeduction,
        sleepDeduction: row.sleepDeduction,
        fatigueDeduction: row.fatigueDeduction,
        studyLoadDeduction: row.studyLoadDeduction,
        learningBehaviorDeduction: row.learningBehaviorDeduction,
        supportSignalDeduction: row.supportSignalDeduction,
      })),
      source: rows.length > 0 ? "live_backend" : "demo_seed",
    };
  }

  async getTeacherTrendSummary(studentId: string, actor: any) {
    await this.authz.assertCanViewStudent(actor, studentId, "teacher");
    await this.authz.writeAccessAuditLog(actor, "read_teacher_trend_summary", "student", studentId, "teacher_trend_summary");
    const latest = await this.prisma.studentTrendSnapshot.findFirst({ where: { studentId }, orderBy: { generatedAt: "desc" } });
    if (!latest) return { ok: false, error: "summary_not_found" };
    const packet: any = JSON.parse(latest.packetJson || "{}");
    return {
      ok: true,
      studentId,
      level: packet.level,
      totalDeduction: packet.totalDeduction,
      topContributingFactors: packet.topContributingFactors || [],
      summary: packet.redAlert ? "High support priority. Follow school support process." : "Trend available for learning support planning.",
      source: latest.source,
      categoryBreakdown: packet.categoryBreakdown || null,
    };
  }

  async getTeacherSupportQueue(actor: any) {
    this.authz.assertRole(actor, ["subject_teacher", "homeroom_teacher", "education_guardian", "school_admin"]);
    const rows = await this.prisma.studentTrendSnapshot.findMany({ orderBy: [{ redAlert: "desc" }, { totalDeduction: "asc" }, { generatedAt: "desc" }], take: 100 });
    const students = await this.prisma.student.findMany({ where: { id: { in: rows.map((row) => row.studentId) } }, select: { id: true, fullName: true, classId: true } });
    const studentMap = new Map(students.map((s) => [s.id, s]));
    return {
      ok: true,
      queue: rows.map((row: any) => {
        const student = studentMap.get(row.studentId);
        const packet = JSON.parse(row.packetJson || "{}");
        return {
          studentId: row.studentId,
          studentName: student?.fullName || row.studentId,
          className: student?.classId || "unknown",
          level: row.level,
          redAlert: row.redAlert,
          summary: row.redAlert ? "High-priority support trend. Review safe support guidance." : "Trend summary available for proactive support.",
          keyFactors: Array.isArray(packet.topContributingFactors) ? packet.topContributingFactors.slice(0, 3) : [],
          suggestedActions: row.redAlert ? ["Review trend detail", "Coordinate with homeroom/guardian", "Use low-pressure plan"] : ["Continue monitoring", "Keep focused check-ins"],
          source: row.source,
          generatedAt: row.generatedAt,
          totalDeduction: row.totalDeduction,
        };
      }),
      source: rows.length > 0 ? "live_backend" : "demo_seed",
    };
  }

  async getAdminTrendOverview(schoolId: string, actor: any) {
    this.authz.assertRole(actor, ["school_admin"]);
    const students = await this.prisma.student.findMany({ where: { schoolId }, select: { id: true, classId: true } });
    const rows = await this.prisma.studentTrendSnapshot.findMany({ where: { studentId: { in: students.map((s) => s.id) } }, orderBy: { generatedAt: "desc" } });
    const latestByStudent = new Map<string, any>();
    rows.forEach((row: any) => {
      if (!latestByStudent.has(row.studentId)) latestByStudent.set(row.studentId, row);
    });
    const latest = [...latestByStudent.values()];
    const count = (lv: string) => latest.filter((row) => row.level === lv).length;
    return {
      ok: true,
      schoolId,
      generatedAt: new Date().toISOString(),
      countsByLevel: { normal: count("normal"), watch: count("watch"), elevated: count("elevated"), high: count("high"), red: count("red") },
      totalStudents: students.length,
      source: latest.length > 0 ? "live_backend" : "demo_seed",
    };
  }

  async getAdminTrendDetail(studentId: string, actor: any) {
    this.authz.assertRole(actor, ["school_admin"]);
    await this.authz.writeAccessAuditLog(actor, "read_admin_trend_detail", "student", studentId, "admin_trend_detail");
    const latest = await this.prisma.studentTrendSnapshot.findFirst({ where: { studentId }, orderBy: { generatedAt: "desc" } });
    return { ok: !!latest, detail: latest ?? null };
  }

  async runNightlyForAllStudents() {
    const students = await this.prisma.student.findMany({ select: { id: true } });
    let processed = 0;
    let reportsCreated = 0;
    let redAlerts = 0;
    const errors: string[] = [];
    for (const student of students) {
      try {
        const result = await this.evaluateAndSave(student.id, "live_backend");
        processed += 1;
        reportsCreated += result?.report ? 1 : 0;
        if (result?.packet?.redAlert) redAlerts += 1;
      } catch (error: any) {
        errors.push(`${student.id}: ${String(error?.message || error)}`);
      }
    }
    return { ok: true, processed, reportsCreated, redAlerts, errors };
  }
}




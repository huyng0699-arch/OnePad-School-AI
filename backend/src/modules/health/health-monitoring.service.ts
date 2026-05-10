import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { IngestHealthMetricsDto } from "./dto/ingest-health-metrics.dto";

export function computeHealthDeclineScore(input: {
  stepsRecent: number | null;
  stepsBase: number | null;
  sleepRecent: number | null;
  sleepBase: number | null;
  rhrRecent: number | null;
  rhrBase: number | null;
  activeRecent: number | null;
  activeBase: number | null;
}) {
  let score = 0;
  const triggered: string[] = [];
  if (input.stepsRecent !== null && input.stepsBase !== null && input.stepsBase > 0 && input.stepsRecent / input.stepsBase < 0.75) {
    score += 1;
    triggered.push("step_drop");
  }
  if (input.sleepRecent !== null && input.sleepBase !== null && input.sleepBase > 0 && input.sleepRecent / input.sleepBase < 0.8) {
    score += 1;
    triggered.push("sleep_drop");
  }
  if (input.rhrRecent !== null && input.rhrBase !== null && input.rhrRecent - input.rhrBase >= 10) {
    score += 1;
    triggered.push("resting_hr_increase");
  }
  if (input.activeRecent !== null && input.activeBase !== null && input.activeBase > 0 && input.activeRecent / input.activeBase < 0.7) {
    score += 1;
    triggered.push("activity_drop");
  }
  return { score, triggered };
}

@Injectable()
export class HealthMonitoringService {
  constructor(private readonly prisma: PrismaService) {}

  async ingestMetrics(dto: IngestHealthMetricsDto) {
    const student = await this.prisma.student.findUnique({ where: { id: dto.studentId } });
    if (!student) return { ok: false, error: `Unknown studentId: ${dto.studentId}` };

    for (const metric of dto.metrics) {
      await this.prisma.phoneHealthMetric.create({
        data: {
          studentId: dto.studentId,
          sourceApp: dto.sourceApp,
          capturedAt: new Date(metric.capturedAt),
          steps: metric.steps,
          activeMinutes: metric.activeMinutes,
          sleepMinutes: metric.sleepMinutes,
          restingHeartRate: metric.restingHeartRate,
          hrv: metric.hrv,
          bloodOxygen: metric.bloodOxygen,
        },
      });
    }

    const alert = await this.evaluateDecline(dto.studentId);
    return { ok: true, ingested: dto.metrics.length, alertCreated: !!alert, alert };
  }

  private average(values: number[]) {
    if (values.length === 0) return null;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  async evaluateDecline(studentId: string) {
    const rows = await this.prisma.phoneHealthMetric.findMany({
      where: { studentId },
      orderBy: { capturedAt: "desc" },
      take: 40,
    });

    if (rows.length < 6) return null;

    const recent = rows.slice(0, 4);
    const baseline = rows.slice(4, 20);

    const stepsRecent = this.average(recent.map((r) => r.steps).filter((v): v is number => typeof v === "number"));
    const stepsBase = this.average(baseline.map((r) => r.steps).filter((v): v is number => typeof v === "number"));
    const sleepRecent = this.average(recent.map((r) => r.sleepMinutes).filter((v): v is number => typeof v === "number"));
    const sleepBase = this.average(baseline.map((r) => r.sleepMinutes).filter((v): v is number => typeof v === "number"));
    const rhrRecent = this.average(recent.map((r) => r.restingHeartRate).filter((v): v is number => typeof v === "number"));
    const rhrBase = this.average(baseline.map((r) => r.restingHeartRate).filter((v): v is number => typeof v === "number"));
    const activeRecent = this.average(recent.map((r) => r.activeMinutes).filter((v): v is number => typeof v === "number"));
    const activeBase = this.average(baseline.map((r) => r.activeMinutes).filter((v): v is number => typeof v === "number"));

    const { score, triggered } = computeHealthDeclineScore({
      stepsRecent,
      stepsBase,
      sleepRecent,
      sleepBase,
      rhrRecent,
      rhrBase,
      activeRecent,
      activeBase,
    });

    if (score < 2) return null;

    const level = score >= 3 ? "high" : "medium";
    const summary = level === "high"
      ? "Recent health indicators show a noticeable decline from the personal baseline. Please check in with your child and consult a qualified professional if needed."
      : "Recent health indicators are lower than the personal baseline. A calm check-in and rest-focused routine may help.";

    const recommended = "Ask how your child is feeling, adjust workload for recovery, and seek professional support when concerns persist.";

    return this.prisma.childHealthAlert.create({
      data: {
        studentId,
        level,
        score,
        confidence: Math.min(0.95, 0.55 + score * 0.1),
        trendWindowDays: 7,
        triggeredSignalsJson: JSON.stringify(triggered),
        safeSummary: summary,
        recommendedAction: recommended,
      },
    });
  }

  async getStudentAlerts(studentId: string) {
    const alerts = await this.prisma.childHealthAlert.findMany({
      where: { studentId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return {
      ok: true,
      studentId,
      alerts: alerts.map((a) => ({
        id: a.id,
        level: a.level,
        score: a.score,
        confidence: a.confidence,
        triggeredSignals: JSON.parse(a.triggeredSignalsJson || "[]"),
        safeSummary: a.safeSummary,
        recommendedAction: a.recommendedAction,
        createdAt: a.createdAt,
      })),
    };
  }

  async getSchoolAlertOverview(schoolId: string) {
    const students = await this.prisma.student.findMany({ where: { schoolId }, select: { id: true } });
    const ids = students.map((s) => s.id);
    const alerts = await this.prisma.childHealthAlert.findMany({ where: { studentId: { in: ids } } });
    return {
      ok: true,
      schoolId,
      totalHealthAlerts: alerts.length,
      medium: alerts.filter((a) => a.level === "medium").length,
      high: alerts.filter((a) => a.level === "high").length,
    };
  }

  async getStudentHealthLogs(studentId: string) {
    const rows = await this.prisma.phoneHealthMetric.findMany({
      where: { studentId },
      orderBy: { capturedAt: "asc" },
      take: 30,
    });
    return {
      ok: true,
      studentId,
      logs: rows.map((row) => ({
        id: row.id,
        date: row.capturedAt.toISOString().slice(0, 10),
        steps: row.steps,
        activeMinutes: row.activeMinutes,
        sleepHours: typeof row.sleepMinutes === "number" ? Number((row.sleepMinutes / 60).toFixed(2)) : undefined,
        restingHeartRate: row.restingHeartRate,
      })),
      source: "live_backend",
    };
  }

  async getStudentHealthSummary(studentId: string) {
    const logs = await this.getStudentHealthLogs(studentId);
    const alerts = await this.getStudentAlerts(studentId);
    return {
      ok: true,
      studentId,
      readinessLevel: "okay",
      safeSummary: "Student health summary from backend metrics.",
      generatedAt: new Date().toISOString(),
      source: "live_backend",
      logs: logs.logs,
      alerts: alerts.alerts,
    };
  }

  async saveWellbeingCheckIn(payload: any) {
    const studentId = String(payload?.studentId || "");
    if (!studentId) return { ok: false, error: "studentId_required" };
    const stress = Number(payload?.schoolStressLevel || 0);
    const wantsAdultSupport = Boolean(payload?.wantsAdultSupport);
    const privateReflection = typeof payload?.privateReflection === "string" ? payload.privateReflection : undefined;
    const safeSummary =
      wantsAdultSupport || stress >= 4
        ? "Student reported higher stress and may benefit from a supportive adult check-in."
        : undefined;
    await this.prisma.studentEvent.create({
      data: {
        id: `well_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        studentId,
        deviceId: String(payload?.deviceId || "student_device"),
        sessionId: String(payload?.sessionId || "wellbeing_session"),
        type: "wellbeing_signal_received",
        source: "support",
        severity: stress >= 5 ? "high" : stress >= 4 ? "medium" : "low",
        safeSummary: safeSummary || `Wellbeing check-in submitted (stress ${stress || "n/a"}/5).`,
        metadataJson: JSON.stringify({
          moodLabel: payload?.moodLabel,
          schoolStressLevel: stress || undefined,
          socialComfortLevel: payload?.socialComfortLevel,
          preferredSupportRole: payload?.preferredSupportRole,
          wantsAdultSupport,
        }),
        rawPrivateText: privateReflection,
        privacyLevel: "sensitive",
        createdAt: new Date(),
      },
    });
    if (safeSummary) {
      await this.prisma.supportRequest.create({
        data: {
          studentId,
          reason: wantsAdultSupport ? "support_request" : "learning_stress",
          safeSummary,
          privacyLevel: "sensitive",
        },
      });
    }
    return { ok: true, studentId, safeSummary, source: "live_backend" };
  }

  async getStudentWellbeingSignals(studentId: string) {
    const rows = await this.prisma.supportRequest.findMany({
      where: { studentId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return {
      ok: true,
      studentId,
      signals: rows.map((row) => ({
        id: row.id,
        createdAt: row.createdAt,
        signalType: row.reason,
        severity: row.reason === "support_request" ? "high" : "medium",
        safeSummary: row.safeSummary,
        visibleToRoles: ["parent", "homeroom_teacher", "education_guardian"],
        rawDataLocked: true,
      })),
      source: "live_backend",
    };
  }

  async saveSupportSignal(payload: any) {
    const studentId = String(payload?.studentId || "");
    const safeSummary = String(payload?.safeSummary || "").trim();
    if (!studentId || !safeSummary) return { ok: false, error: "studentId_and_safeSummary_required" };
    const created = await this.prisma.supportRequest.create({
      data: {
        studentId,
        reason: String(payload?.signalType || "support_request"),
        safeSummary,
        privacyLevel: "sensitive",
      },
    });
    return { ok: true, signalId: created.id, source: "live_backend" };
  }

  async getParentHealthWellbeingVault(studentId: string) {
    const [summary, signals, auditLogs] = await Promise.all([
      this.getStudentHealthSummary(studentId),
      this.getStudentWellbeingSignals(studentId),
      this.prisma.accessAuditLog.findMany({
        where: { resourceId: studentId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    const latestLog = summary.logs[summary.logs.length - 1];
    const latestAlert = summary.alerts[0];

    return {
      ok: true,
      vault: {
        childId: studentId,
        activitySummary: latestLog?.activeMinutes
          ? `Vận động gần nhất khoảng ${latestLog.activeMinutes} phút.`
          : "Backend chưa nhận dữ liệu vận động từ Student App/thiết bị.",
        sleepRoutine: latestLog?.sleepHours
          ? `Giấc ngủ gần nhất khoảng ${latestLog.sleepHours} giờ.`
          : "Backend chưa nhận dữ liệu giấc ngủ.",
        learningStress: signals.signals.length > 0
          ? signals.signals[0].safeSummary
          : latestAlert?.safeSummary || "Chưa có tín hiệu áp lực học tập cần can thiệp.",
        sharingStatus: "Phụ huynh kiểm soát chia sẻ; giáo viên chỉ xem tóm tắt khi được cho phép.",
        accessHistory: auditLogs.map((log) => ({
          date: log.createdAt,
          actor: `${log.actorRole}:${log.actorUserId}`,
          action: log.action,
        })),
        readiness: { level: summary.readinessLevel, safeSummary: summary.safeSummary },
        wellbeingSummary: signals.signals.length > 0 ? signals.signals[0].safeSummary : "No active wellbeing signal.",
        supportSignals: signals.signals,
        alerts: summary.alerts,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  async getTeacherSupportSummary(studentId: string) {
    const signals = await this.getStudentWellbeingSignals(studentId);
    return {
      ok: true,
      studentId,
      summary: signals.signals.map((signal) => signal.safeSummary).join(" "),
      signals: signals.signals,
      source: "live_backend",
    };
  }

  async getTeacherClassWellbeingSummary(classId: string) {
    const students = await this.prisma.student.findMany({ where: { classId }, select: { id: true, fullName: true } });
    const items = await Promise.all(students.map(async (student) => {
      const latest = await this.prisma.supportRequest.findFirst({
        where: { studentId: student.id },
        orderBy: { createdAt: "desc" },
      });
      return {
        studentId: student.id,
        studentName: student.fullName,
        safeSummary: latest?.safeSummary || "No active support signal.",
      };
    }));
    return { ok: true, classId, items, source: "live_backend" };
  }

  async getTeacherSupportQueue() {
    const rows = await this.prisma.supportRequest.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
    return { ok: true, queue: rows, source: "live_backend" };
  }

  async getSchoolWellbeingOverview(schoolId: string) {
    const students = await this.prisma.student.findMany({ where: { schoolId }, select: { id: true } });
    const alerts = await this.prisma.childHealthAlert.findMany({ where: { studentId: { in: students.map((s) => s.id) } } });
    const requests = await this.prisma.supportRequest.findMany({ where: { studentId: { in: students.map((s) => s.id) } } });
    return {
      ok: true,
      schoolId,
      totalStudents: students.length,
      alertMedium: alerts.filter((item) => item.level === "medium").length,
      alertHigh: alerts.filter((item) => item.level === "high").length,
      supportRequests: requests.length,
      source: "live_backend",
      generatedAt: new Date().toISOString(),
    };
  }

  async getAuditLogs() {
    const items = await this.prisma.accessAuditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
    return { ok: true, items, source: "live_backend" };
  }
}

import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { RoleReportBuilder } from "./role-report.builder";

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly builder: RoleReportBuilder,
  ) {}

  async rebuildReportsForStudent(studentId: string) {
    const student = await this.prisma.student.findUnique({ where: { id: studentId } });
    if (!student) return;

    const events = await this.prisma.studentEvent.findMany({
      where: { studentId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const teacherReport = this.builder.buildTeacherReport(events);
    const parentReport = this.builder.buildParentReport(events);

    await this.prisma.teacherStudentReport.deleteMany({ where: { studentId } });
    await this.prisma.teacherStudentReport.create({
      data: {
        studentId,
        classId: student.classId,
        academicSummary: teacherReport.academicSummary,
        learningSupportSummary: teacherReport.learningSupportSummary,
        wellbeingSummary: teacherReport.wellbeingSummary,
        groupWorkSummary: teacherReport.groupWorkSummary,
        recommendedTeacherAction: teacherReport.recommendedTeacherAction,
        recentEventsJson: JSON.stringify(teacherReport.recentEvents),
      },
    });

    await this.prisma.parentChildReport.deleteMany({ where: { studentId } });
    await this.prisma.parentChildReport.create({
      data: {
        studentId,
        todayLearningSummary: parentReport.todayLearningSummary,
        progressSummary: parentReport.progressSummary,
        mentalAndCharacterGrowthSummary: parentReport.mentalAndCharacterGrowthSummary,
        recommendedParentAction: parentReport.recommendedParentAction,
        teacherNote: parentReport.teacherNote,
      },
    });
  }

  async rebuildAdminAggregate(schoolId: string, classId?: string) {
    const students = await this.prisma.student.findMany({ where: { schoolId, ...(classId ? { classId } : {}) } });
    const studentIds = students.map((student) => student.id);

    const localAiEvents = await this.prisma.studentEvent.count({ where: { studentId: { in: studentIds }, type: "local_ai_used" } });
    const cloudAiEvents = await this.prisma.studentEvent.count({ where: { studentId: { in: studentIds }, type: "cloud_ai_used" } });
    const supportLow = await this.prisma.studentEvent.count({ where: { studentId: { in: studentIds }, severity: "low" } });
    const supportMedium = await this.prisma.studentEvent.count({ where: { studentId: { in: studentIds }, severity: "medium" } });
    const supportHigh = await this.prisma.studentEvent.count({ where: { studentId: { in: studentIds }, severity: "high" } });

    const submittedAssignments = await this.prisma.studentEvent.count({ where: { studentId: { in: studentIds }, type: "assignment_submitted" } });
    const totalAssignments = Math.max(1, await this.prisma.assignment.count({ where: classId ? { classId } : {} }));

    await this.prisma.adminClassAggregate.deleteMany({ where: { schoolId, classId: classId ?? null } });
    await this.prisma.adminClassAggregate.create({
      data: {
        schoolId,
        classId: classId ?? null,
        totalStudents: students.length,
        localAiEvents,
        cloudAiEvents,
        supportLow,
        supportMedium,
        supportHigh,
        assignmentCompletionRate: submittedAssignments / totalAssignments,
        privacyReadinessSummary: "Private raw chat and hidden scores are excluded from parent and admin reports by default.",
      },
    });
  }

  async getTeacherDashboard(classId: string) {
    const students = await this.prisma.student.findMany({ where: { classId } });
    const reports = await this.prisma.teacherStudentReport.findMany({ where: { classId } });
    const byStudent = new Map(reports.map((report) => [report.studentId, report]));

    return {
      ok: true,
      classId,
      className: classId === "class_8a" ? "Class 8A" : classId,
      students: students.map((student) => {
        const report = byStudent.get(student.id);
        return {
          studentId: student.id,
          studentName: student.fullName,
          academicSummary: report?.academicSummary ?? "No learning events synced yet.",
          learningSupportSummary: report?.learningSupportSummary ?? "No support pattern available yet.",
          wellbeingSummary: report?.wellbeingSummary ?? "No safe wellbeing summary available yet.",
          groupWorkSummary: report?.groupWorkSummary ?? "No group work summary available yet.",
          recommendedTeacherAction: report?.recommendedTeacherAction ?? "Wait for synced student events.",
        };
      }),
    };
  }

  async getTeacherStudentReport(studentId: string) {
    const student = await this.prisma.student.findUnique({ where: { id: studentId } });
    const report = await this.prisma.teacherStudentReport.findFirst({ where: { studentId } });

    return {
      ok: true,
      report: {
        studentId,
        studentName: student?.fullName ?? studentId,
        academicSummary: report?.academicSummary ?? "No learning events synced yet.",
        learningSupportSummary: report?.learningSupportSummary ?? "No support pattern available yet.",
        wellbeingSummary: report?.wellbeingSummary ?? "No safe wellbeing summary available yet.",
        groupWorkSummary: report?.groupWorkSummary ?? "No group work summary available yet.",
        recommendedTeacherAction: report?.recommendedTeacherAction ?? "Wait for synced student events.",
        recentEvents: report?.recentEventsJson ? JSON.parse(report.recentEventsJson) : [],
      },
    };
  }

  async getParentReport(studentId: string) {
    const student = await this.prisma.student.findUnique({ where: { id: studentId } });
    const report = await this.prisma.parentChildReport.findFirst({ where: { studentId } });
    const latestHealthAlert = await this.prisma.childHealthAlert.findFirst({
      where: { studentId },
      orderBy: { createdAt: "desc" },
    });

    return {
      ok: true,
      report: {
        studentId,
        studentName: student?.fullName ?? studentId,
        todayLearningSummary: report?.todayLearningSummary ?? "No learning summary has been synced yet.",
        progressSummary: report?.progressSummary ?? "Progress summary will appear after student events sync.",
        mentalAndCharacterGrowthSummary: latestHealthAlert
          ? `${report?.mentalAndCharacterGrowthSummary ?? "No sensitive concern is shown in the parent report."} Health check: ${latestHealthAlert.safeSummary}`
          : (report?.mentalAndCharacterGrowthSummary ?? "No sensitive concern is shown in the parent report."),
        recommendedParentAction: report?.recommendedParentAction ?? "Ask your child what they learned today.",
        teacherNote: latestHealthAlert
          ? `${report?.teacherNote ?? "This parent report excludes private raw chat and hidden scores."} Health recommendation: ${latestHealthAlert.recommendedAction}`
          : (report?.teacherNote ?? "This parent report excludes private raw chat and hidden scores."),
      },
    };
  }

  async getAdminOverview(schoolId: string) {
    const aggregate = await this.prisma.adminClassAggregate.findFirst({ where: { schoolId }, orderBy: { updatedAt: "desc" } });
    const students = await this.prisma.student.count({ where: { schoolId } });

    return {
      ok: true,
      overview: {
        schoolId,
        totalStudents: aggregate?.totalStudents ?? students,
        aiUsage: {
          localAiEvents: aggregate?.localAiEvents ?? 0,
          cloudAiEvents: aggregate?.cloudAiEvents ?? 0,
        },
        supportSignals: {
          low: aggregate?.supportLow ?? 0,
          medium: aggregate?.supportMedium ?? 0,
          high: aggregate?.supportHigh ?? 0,
        },
        assignmentCompletionRate: aggregate?.assignmentCompletionRate ?? 0,
        privacyReadinessSummary: aggregate?.privacyReadinessSummary ?? "Private raw chat and hidden scores are excluded from parent and admin reports by default.",
      },
    };
  }

  async getAdminAiUsage() {
    const localAiEvents = await this.prisma.studentEvent.count({ where: { type: "local_ai_used" } });
    const cloudAiEvents = await this.prisma.studentEvent.count({ where: { type: "cloud_ai_used" } });
    const localReports = await this.prisma.localAiStatusReport.findMany();

    const models = new Map<string, { modelId: string; quantization: string; count: number; success: number; error: number }>();

    for (const report of localReports) {
      const key = `${report.modelId}:${report.quantization}`;
      const current = models.get(key) ?? {
        modelId: report.modelId,
        quantization: report.quantization,
        count: 0,
        success: 0,
        error: 0,
      };
      current.count += 1;
      if (report.status === "success") current.success += 1;
      if (report.status === "error") current.error += 1;
      models.set(key, current);
    }

    return {
      ok: true,
      localAiEvents,
      cloudAiEvents,
      models: [...models.values()],
    };
  }

  async getDatabaseStats() {
    return {
      ok: true,
      stats: {
        students: await this.prisma.student.count(),
        events: await this.prisma.studentEvent.count(),
        quizResults: await this.prisma.quizResult.count(),
        hiddenSignals: await this.prisma.hiddenSignal.count(),
        teacherReports: await this.prisma.teacherStudentReport.count(),
        parentReports: await this.prisma.parentChildReport.count(),
        adminAggregates: await this.prisma.adminClassAggregate.count(),
        localAiStatusReports: await this.prisma.localAiStatusReport.count(),
        phoneHealthMetrics: await this.prisma.phoneHealthMetric.count(),
        childHealthAlerts: await this.prisma.childHealthAlert.count(),
      },
    };
  }

  async getAdminApiUsage() {
    const rows = await this.prisma.apiKeyUsage.findMany({ orderBy: { lastUsedAt: "desc" }, take: 200 });
    return { ok: true, rows };
  }

  async getParentLessons(studentId: string) {
    const student = await this.prisma.student.findUnique({ where: { id: studentId } });
    if (!student) return { ok: false, error: "student_not_found" };
    const published = await this.prisma.publishedLesson.findMany({
      where: { classId: student.classId, status: "active" },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return {
      ok: true,
      lessons: published.map((item) => ({
        lessonId: item.lessonId,
        classId: item.classId,
        subject: item.subject,
        grade: item.grade,
        publishedAt: item.createdAt,
        exportUrl: `/v1/lessons/${item.lessonId}/export-json`,
      })),
    };
  }

  async setGuardianConsent(studentId: string, teacherId: string, active: boolean) {
    const existing = await this.prisma.educationGuardianConsent.findFirst({
      where: { studentId, guardianTeacherId: teacherId },
    });
    if (existing) {
      await this.prisma.educationGuardianConsent.update({
        where: { id: existing.id },
        data: { active },
      });
    } else {
      await this.prisma.educationGuardianConsent.create({
        data: {
          id: `consent_${studentId}_${teacherId}`,
          studentId,
          guardianTeacherId: teacherId,
          active,
          supportPlan: "Parent controlled consent policy.",
        },
      });
    }
    return { ok: true, studentId, teacherId, active };
  }

  async upsertTeacherClassAccess(teacherId: string, classId: string, subjectId: string, roleType: string) {
    const id = `tca_${teacherId}_${classId}_${subjectId}`;
    await this.prisma.teacherClassAccess.upsert({
      where: { id },
      update: { roleType, subjectId },
      create: { id, teacherId, classId, subjectId, roleType },
    });
    return { ok: true, id, teacherId, classId, subjectId, roleType };
  }

  async removeTeacherClassAccess(teacherId: string, classId: string, subjectId: string) {
    const id = `tca_${teacherId}_${classId}_${subjectId}`;
    await this.prisma.teacherClassAccess.deleteMany({ where: { id } });
    return { ok: true, id };
  }

  async getTeacherLearningSignals(studentId: string) {
    const events = await this.prisma.studentEvent.findMany({
      where: { studentId },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    return {
      ok: true,
      signals: events.map((event) => ({
        id: event.id,
        time: event.createdAt,
        type: event.type,
        source: event.source,
        severity: event.severity || "low",
        summary: event.safeSummary,
        privacyLevel: event.privacyLevel,
      })),
    };
  }

  async getGuardianSharedSignals(studentId: string, teacherId: string) {
    const consent = await this.prisma.educationGuardianConsent.findFirst({
      where: { studentId, guardianTeacherId: teacherId, active: true },
    });
    if (!consent) return { ok: false, error: "guardian_consent_required" };
    return {
      ok: true,
      shared: {
        studentId,
        teacherId,
        medicalSummarySafe: consent.medicalSummarySafe,
        psychologicalSupportSummarySafe: consent.psychologicalSupportSummarySafe,
        supportPlan: consent.supportPlan,
      },
    };
  }

  async createArAssignment(input: { teacherId: string; classId: string; title: string; subject: string; lessonId?: string; dueDate?: string }) {
    const id = `ar_${Date.now().toString(36)}`;
    await this.prisma.assignment.create({
      data: {
        id,
        classId: input.classId,
        lessonId: input.lessonId || "lesson_demo_001",
        title: `[AR] ${input.title}`,
        status: "assigned",
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
      },
    });
    return { ok: true, assignmentId: id };
  }

  async getParentChildren(guardianId: string) {
    const links = await this.prisma.guardianStudentLink.findMany({ where: { guardianId } });
    const students = await this.prisma.student.findMany({ where: { id: { in: links.map((l) => l.studentId) } } });
    return {
      ok: true,
      children: students.map((s) => ({ studentId: s.id, name: s.fullName, classId: s.classId })),
    };
  }

  async getParentAlerts(studentId: string) {
    const alerts = await this.prisma.childHealthAlert.findMany({
      where: { studentId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return {
      ok: true,
      alerts: alerts.map((a) => ({
        id: a.id,
        level: a.level,
        summary: a.safeSummary,
        recommendedAction: a.recommendedAction,
        createdAt: a.createdAt,
      })),
    };
  }

  async getHealthVaultSummary(studentId: string) {
    const latest = await this.prisma.childHealthAlert.findFirst({ where: { studentId }, orderBy: { createdAt: "desc" } });
    return {
      ok: true,
      vault: {
        studentId,
        status: latest ? "attention" : "stable",
        latestSignal: latest?.safeSummary || "No active wellbeing alerts.",
        sharingMode: "parent_controlled",
      },
    };
  }

  async shareWithTeacher(studentId: string, teacherId: string, reason: string, expiry?: string) {
    const result = await this.setGuardianConsent(studentId, teacherId, true);
    return { ...result, reason, expiry: expiry || null };
  }

  async revokeTeacherShare(studentId: string, teacherId: string) {
    return this.setGuardianConsent(studentId, teacherId, false);
  }

  async getAdminClassAggregate(classId: string) {
    const students = await this.prisma.student.findMany({ where: { classId } });
    const events = await this.prisma.studentEvent.count({ where: { studentId: { in: students.map((s) => s.id) } } });
    const assignments = await this.prisma.assignment.count({ where: { classId } });
    return {
      ok: true,
      aggregate: {
        classId,
        students: students.length,
        events,
        assignments,
        completionRate: assignments > 0 ? Math.min(100, Math.round((events / assignments) * 100)) : 0,
      },
    };
  }

  async getPrivacyReadiness() {
    const blocked = await this.prisma.accessAuditLog.count({ where: { action: { contains: "blocked" } } });
    return {
      ok: true,
      readiness: {
        rawChatBlocked: true,
        parentControlledHealthData: true,
        adminAggregateOnly: true,
        auditEnabled: true,
        blockedAttempts: blocked,
      },
    };
  }

  async assignTeacherRole(input: { teacherId: string; classId: string; subjectId: string; roleType: string; expiry?: string }) {
    const result = await this.upsertTeacherClassAccess(input.teacherId, input.classId, input.subjectId, input.roleType);
    return { ...result, expiry: input.expiry || null };
  }
}

import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { RoleReportBuilder } from "./role-report.builder";

type SubjectSummary = {
  subject: string;
  teacher: string;
  mastery: number;
  latestQuiz: string;
  accuracy: number;
  weakSkills: string[];
  trend: "improving" | "stable" | "declining";
  parentAction: string;
};

const CORE_SUBJECTS = [
  { subject: "Biology", teacher: "Ms. Linh", lessonId: "lesson_demo_001" },
  { subject: "Math", teacher: "Mr. Nam", lessonId: "lesson_math_001" },
  { subject: "Literature", teacher: "Ms. Hoa", lessonId: "lesson_lit_001" },
  { subject: "English", teacher: "Ms. Anna", lessonId: "lesson_eng_001" },
  { subject: "Science", teacher: "Mr. Quang", lessonId: "lesson_sci_001" },
  { subject: "History", teacher: "Ms. Trang", lessonId: "lesson_his_001" },
];

function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function iso(date?: Date | string | null) {
  if (!date) return new Date().toISOString();
  return date instanceof Date ? date.toISOString() : date;
}

function pct(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly builder: RoleReportBuilder,
  ) {}

  private async getStudentContext(studentId: string) {
    const student = await this.prisma.student.findUnique({ where: { id: studentId } });
    const classroom = student ? await this.prisma.classroom.findUnique({ where: { id: student.classId } }) : null;
    const school = student ? await this.prisma.school.findUnique({ where: { id: student.schoolId } }) : null;
    return { student, classroom, school };
  }

  private async recentEvents(studentId: string, take = 80) {
    return this.prisma.studentEvent.findMany({
      where: { studentId },
      orderBy: { createdAt: "desc" },
      take,
    });
  }

  private metadata(row: { metadataJson?: string | null }) {
    return parseJson<Record<string, any>>(row.metadataJson, {});
  }

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

    const localAiEvents = await this.prisma.studentEvent.count({ where: { studentId: { in: studentIds }, type: { in: ["local_ai_used", "ai_tutor_used"] } } });
    const cloudAiEvents = await this.prisma.studentEvent.count({ where: { studentId: { in: studentIds }, type: "cloud_ai_used" } });
    const supportLow = await this.prisma.studentEvent.count({ where: { studentId: { in: studentIds }, severity: "low" } });
    const supportMedium = await this.prisma.studentEvent.count({ where: { studentId: { in: studentIds }, severity: "medium" } });
    const supportHigh = await this.prisma.studentEvent.count({ where: { studentId: { in: studentIds }, severity: "high" } });

    const submittedAssignments = await this.prisma.studentEvent.count({ where: { studentId: { in: studentIds }, type: { in: ["assignment_submitted", "assignment_completed"] } } });
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
        privacyReadinessSummary: "Parent App chỉ xem tóm tắt an toàn; dữ liệu thô, chat riêng tư và điểm nội bộ không hiển thị.",
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
          academicSummary: report?.academicSummary ?? "Chưa có sự kiện học tập được đồng bộ.",
          learningSupportSummary: report?.learningSupportSummary ?? "Chưa có mẫu hình hỗ trợ.",
          wellbeingSummary: report?.wellbeingSummary ?? "Chưa có tóm tắt wellbeing an toàn.",
          groupWorkSummary: report?.groupWorkSummary ?? "Chưa có tóm tắt làm việc nhóm.",
          recommendedTeacherAction: report?.recommendedTeacherAction ?? "Chờ dữ liệu từ Student App.",
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
        academicSummary: report?.academicSummary ?? "Chưa có sự kiện học tập được đồng bộ.",
        learningSupportSummary: report?.learningSupportSummary ?? "Chưa có mẫu hình hỗ trợ.",
        wellbeingSummary: report?.wellbeingSummary ?? "Chưa có tóm tắt wellbeing an toàn.",
        groupWorkSummary: report?.groupWorkSummary ?? "Chưa có tóm tắt làm việc nhóm.",
        recommendedTeacherAction: report?.recommendedTeacherAction ?? "Chờ dữ liệu từ Student App.",
        recentEvents: report?.recentEventsJson ? JSON.parse(report.recentEventsJson) : [],
      },
    };
  }

  async getParentReport(studentId: string) {
    const { student, classroom, school } = await this.getStudentContext(studentId);
    const report = await this.prisma.parentChildReport.findFirst({ where: { studentId } });
    const latestHealthAlert = await this.prisma.childHealthAlert.findFirst({ where: { studentId }, orderBy: { createdAt: "desc" } });
    const latestQuiz = await this.prisma.quizResult.findFirst({ where: { studentId }, orderBy: { createdAt: "desc" } });

    return {
      ok: true,
      report: {
        studentId,
        studentName: student?.fullName ?? studentId,
        className: classroom?.name ?? student?.classId ?? "-",
        schoolName: school?.name ?? "OnePad School",
        todayLearningSummary: report?.todayLearningSummary ?? "Student App chưa gửi đủ dữ liệu học hôm nay.",
        progressSummary: report?.progressSummary ?? (latestQuiz ? `Bài kiểm tra gần nhất đạt ${Math.round(latestQuiz.accuracy * 100)}%.` : "Tiến độ sẽ cập nhật sau khi Student App đồng bộ."),
        mentalAndCharacterGrowthSummary: latestHealthAlert
          ? `${report?.mentalAndCharacterGrowthSummary ?? "Không hiển thị chat riêng tư hoặc điểm nội bộ."} ${latestHealthAlert.safeSummary}`
          : (report?.mentalAndCharacterGrowthSummary ?? "Không hiển thị chat riêng tư hoặc điểm nội bộ."),
        recommendedParentAction: report?.recommendedParentAction ?? "Hỏi con một câu ngắn về bài học hôm nay và giữ nhịp sinh hoạt ổn định.",
        teacherNote: latestHealthAlert
          ? `${report?.teacherNote ?? "Báo cáo này chỉ gồm tóm tắt an toàn."} ${latestHealthAlert.recommendedAction}`
          : (report?.teacherNote ?? "Báo cáo này chỉ gồm tóm tắt an toàn."),
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
        aiUsage: { localAiEvents: aggregate?.localAiEvents ?? 0, cloudAiEvents: aggregate?.cloudAiEvents ?? 0 },
        supportSignals: { low: aggregate?.supportLow ?? 0, medium: aggregate?.supportMedium ?? 0, high: aggregate?.supportHigh ?? 0 },
        assignmentCompletionRate: aggregate?.assignmentCompletionRate ?? 0,
        privacyReadinessSummary: aggregate?.privacyReadinessSummary ?? "Dữ liệu riêng tư không hiển thị mặc định.",
      },
    };
  }

  async getAdminAiUsage() {
    const localAiEvents = await this.prisma.studentEvent.count({ where: { type: { in: ["local_ai_used", "ai_tutor_used"] } } });
    const cloudAiEvents = await this.prisma.studentEvent.count({ where: { type: "cloud_ai_used" } });
    const localReports = await this.prisma.localAiStatusReport.findMany();
    const models = new Map<string, { modelId: string; quantization: string; count: number; success: number; error: number }>();

    for (const report of localReports) {
      const key = `${report.modelId}:${report.quantization}`;
      const current = models.get(key) ?? { modelId: report.modelId, quantization: report.quantization, count: 0, success: 0, error: 0 };
      current.count += 1;
      if (report.status === "success") current.success += 1;
      if (report.status === "error") current.error += 1;
      models.set(key, current);
    }
    return { ok: true, localAiEvents, cloudAiEvents, models: [...models.values()] };
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

  async getParentProfile(studentId: string) {
    const { student, classroom, school } = await this.getStudentContext(studentId);
    const device = await this.getDeviceSync(studentId);
    return {
      ok: true,
      profile: {
        studentId,
        childName: student?.fullName ?? studentId,
        className: classroom?.name ?? student?.classId ?? "-",
        schoolName: school?.name ?? "OnePad School",
        homeroomTeacher: "Ms. Linh",
        subjectTeachers: CORE_SUBJECTS.map((s) => ({ subject: s.subject, teacher: s.teacher, contactHint: "Nhắn qua mục Tin nhắn giáo viên." })),
        learningFocus: ["Giữ nhịp học đều", "Ôn phần sai lặp lại", "Hỏi con bằng câu hỏi ngắn"],
        parentAccountScope: "one_parent_account_one_student",
        deviceSync: device.device,
      },
    };
  }

  async getParentSubjects(studentId: string) {
    const quizzes = await this.prisma.quizResult.findMany({ where: { studentId }, orderBy: { createdAt: "desc" }, take: 60 });
    const lessons = await this.prisma.lesson.findMany();
    const lessonSubject = new Map(lessons.map((lesson) => [lesson.id, lesson.subject]));

    const subjects: SubjectSummary[] = CORE_SUBJECTS.map((core) => {
      const related = quizzes.filter((quiz) => (quiz.lessonId ? lessonSubject.get(quiz.lessonId) === core.subject || quiz.lessonId === core.lessonId : false));
      const fallbackRelated = related.length > 0 ? related : quizzes.slice(0, core.subject === "Biology" ? 5 : 0);
      const avg = fallbackRelated.length ? fallbackRelated.reduce((s, q) => s + q.accuracy, 0) / fallbackRelated.length : 0.72;
      const latest = fallbackRelated[0];
      const weakSkills = latest?.repeatedMistakesJson ? parseJson<string[]>(latest.repeatedMistakesJson, []) : ["Ôn khái niệm chính"];
      return {
        subject: core.subject,
        teacher: core.teacher,
        mastery: pct(avg * 100),
        latestQuiz: latest ? `Quiz ${core.subject}` : "Chưa có quiz mới",
        accuracy: latest ? pct(latest.accuracy * 100) : pct(avg * 100),
        weakSkills: weakSkills.length ? weakSkills : ["Ôn khái niệm chính"],
        trend: fallbackRelated.length >= 2 && fallbackRelated[0].accuracy < fallbackRelated[fallbackRelated.length - 1].accuracy ? "declining" : "stable",
        parentAction: fallbackRelated.length ? "Ôn lại lỗi sai lặp lại bằng 2 câu hỏi ngắn." : "Chờ dữ liệu quiz từ Student App.",
      };
    });
    return { ok: true, subjects };
  }

  async getProgressTimeline(studentId: string) {
    const events = await this.recentEvents(studentId, 80);
    return {
      ok: true,
      events: events.map((event) => ({
        id: event.id,
        date: event.createdAt,
        type: this.parentEventTypeLabel(event.type),
        title: this.parentEventTitle(event.type),
        summary: event.safeSummary,
      })),
    };
  }

  private parentEventTypeLabel(type: string) {
    const map: Record<string, string> = {
      lesson_opened: "Mở bài học",
      lesson_started: "Bắt đầu bài học",
      page_read: "Đọc bài",
      lesson_completed: "Hoàn thành bài học",
      quiz_completed: "Hoàn thành quiz",
      assignment_opened: "Mở bài tập",
      assignment_submitted: "Nộp bài tập",
      ar_lesson_opened: "Mở bài AR",
      ar_lesson_completed: "Hoàn thành AR",
      ai_tutor_used: "Dùng AI Tutor",
      support_requested: "Yêu cầu hỗ trợ",
      group_work_activity: "Làm việc nhóm",
      attendance_absent: "Vắng",
      attendance_late: "Đi muộn",
      device_sync: "Đồng bộ thiết bị",
    };
    return map[type] || type;
  }

  private parentEventTitle(type: string) {
    if (type.includes("quiz")) return "Kết quả kiểm tra mới";
    if (type.includes("assignment")) return "Cập nhật bài tập";
    if (type.includes("ar_")) return "Hoạt động AR Lab";
    if (type.includes("lesson") || type === "page_read") return "Hoạt động học tập";
    if (type.includes("support") || type.includes("confidence") || type.includes("frustration")) return "Tín hiệu cần hỗ trợ";
    if (type.includes("group")) return "Hoạt động nhóm";
    if (type.includes("attendance")) return "Chuyên cần";
    if (type.includes("device")) return "Đồng bộ dữ liệu";
    return "Cập nhật từ Student App";
  }

  async getParentAssignments(studentId: string) {
    const { student } = await this.getStudentContext(studentId);
    const assignments = await this.prisma.assignment.findMany({
      where: { OR: [{ studentId }, ...(student?.classId ? [{ classId: student.classId }] : [])] },
      orderBy: { createdAt: "desc" },
      take: 80,
    });
    const lessons = await this.prisma.lesson.findMany({ where: { id: { in: assignments.map((a) => a.lessonId) } } });
    const lessonMap = new Map(lessons.map((lesson) => [lesson.id, lesson]));
    return {
      ok: true,
      assignments: assignments.map((item) => {
        const lesson = lessonMap.get(item.lessonId);
        return {
          id: item.id,
          title: item.title,
          subject: lesson?.subject ?? (item.title.startsWith("[AR]") ? "AR Lab" : "Biology"),
          teacher: item.title.startsWith("[AR]") ? "Ms. Linh" : "Giáo viên bộ môn",
          dueDate: iso(item.dueDate),
          status: item.status === "assigned" ? "not_started" : item.status,
          parentAction: item.status === "submitted" ? "Khen con đã hoàn thành và hỏi phần khó nhất." : "Nhắc con mở bài liên quan trước khi làm.",
          relatedLesson: lesson?.title ?? item.lessonId,
        };
      }),
    };
  }

  async getParentLessons(studentId: string) {
    const { student } = await this.getStudentContext(studentId);
    if (!student) return { ok: false, error: "student_not_found", lessons: [] };
    const published = await this.prisma.publishedLesson.findMany({ where: { classId: student.classId, status: "active" }, orderBy: { createdAt: "desc" }, take: 50 });
    const lessonIds = published.map((item) => item.lessonId);
    const structured = await this.prisma.structuredLessonRecord.findMany({ where: { lessonId: { in: lessonIds } } });
    const byLesson = new Map(structured.map((row) => [row.lessonId, row]));
    const events = await this.recentEvents(studentId, 100);

    return {
      ok: true,
      lessons: published.map((item) => {
        const record = byLesson.get(item.lessonId);
        const data = parseJson<any>(record?.structuredJson, {});
        const completed = events.some((event) => event.lessonId === item.lessonId && event.type === "lesson_completed");
        const opened = events.some((event) => event.lessonId === item.lessonId && ["lesson_started", "lesson_opened", "page_read"].includes(event.type));
        return {
          lessonId: item.lessonId,
          title: record?.title ?? data.title ?? item.lessonId,
          subject: item.subject,
          grade: item.grade,
          status: completed ? "completed" : opened ? "current" : "recommended_review",
          keyPoints: Array.isArray(data.learningObjectives) ? data.learningObjectives.slice(0, 4) : ["Nắm ý chính", "Ôn lại ví dụ"],
          parentExplanation: data.aiText || "Phụ huynh chỉ cần hỏi con nắm được ý chính nào và phần nào còn khó.",
          homeQuestions: Array.isArray(data.quizSeeds) && data.quizSeeds.length
            ? data.quizSeeds.slice(0, 3).map((q: any) => String(q.question))
            : ["Con học được ý gì hôm nay?", "Phần nào con muốn thầy cô giải thích thêm?"],
          publishedAt: item.createdAt,
          exportUrl: `/v1/lessons/${item.lessonId}/export-json`,
        };
      }),
    };
  }

  async getHomeSupportPlan(studentId: string) {
    const subjects = await this.getParentSubjects(studentId);
    const weak = subjects.subjects.flatMap((s: SubjectSummary) => s.weakSkills).slice(0, 4);
    const support = await this.prisma.supportRequest.findFirst({ where: { studentId }, orderBy: { createdAt: "desc" } });
    return {
      ok: true,
      plan: {
        tonightQuestions: ["Hôm nay con hiểu phần nào nhất?", "Có phần nào con muốn ôn lại cùng bố/mẹ không?", "Con muốn hỏi giáo viên điều gì?"],
        reviewItems: weak.length ? weak : ["Ôn lại bài hiện tại", "Xem lại lỗi sai gần nhất"],
        supportTime: "15-20 phút, không kéo dài thành buổi học thứ hai.",
        doNotPressure: ["Không so sánh với bạn khác", "Không hỏi dồn khi con mệt", "Không yêu cầu học thêm nếu đã quá tải"],
        contactTeacherWhen: support ? "Nên liên hệ giáo viên chủ nhiệm nếu tín hiệu hỗ trợ tiếp diễn thêm 2-3 ngày." : "Liên hệ giáo viên nếu điểm giảm liên tục, bài quá hạn hoặc con chủ động xin hỗ trợ.",
        reminderCreation: "Có thể đặt nhắc nhở ôn bài ngắn vào buổi tối.",
      },
    };
  }

  async getFamilyReport(studentId: string) {
    const parent = await this.getParentReport(studentId);
    const subjects = await this.getParentSubjects(studentId);
    const health = await this.getHealthVaultSummary(studentId);
    return {
      ok: true,
      report: {
        overall: parent.report.todayLearningSummary,
        subjectPattern: subjects.subjects.map((s: SubjectSummary) => `${s.subject}: ${s.mastery}%`).join("; "),
        healthRoutine: health.vault.latestSignal,
        wellbeingConfidence: parent.report.mentalAndCharacterGrowthSummary,
        socialIntegration: "Chỉ hiển thị tóm tắt an toàn từ hoạt động nhóm, không hiển thị chat riêng tư.",
        recommendedHomePlan: [parent.report.recommendedParentAction, "Giữ buổi hỗ trợ ngắn và ít áp lực.", "Liên hệ giáo viên nếu cảnh báo tiếp diễn."],
        privacyStatus: "Dữ liệu thô, chat riêng tư và điểm nội bộ không được chia sẻ mặc định.",
      },
    };
  }

  async getPrivacyCenter(_studentId: string) {
    return {
      ok: true,
      privacy: [
        { role: "Phụ huynh", canSee: "Tóm tắt học tập, bài tập, quiz, kế hoạch hỗ trợ tại nhà, kho sức khỏe do phụ huynh kiểm soát." },
        { role: "Giáo viên", canSee: "Tóm tắt an toàn phục vụ dạy học; chỉ xem dữ liệu sức khỏe khi phụ huynh chia sẻ." },
        { role: "Nhà trường", canSee: "Dữ liệu tổng hợp, phân quyền, audit log và mức sẵn sàng quyền riêng tư." },
        { role: "Không chia sẻ mặc định", canSee: "Chat thô, điểm nội bộ ẩn, dữ liệu sức khỏe thô và ghi chú riêng tư của phụ huynh." },
      ],
    };
  }

  async getConsentLog(studentId: string) {
    const consents = await this.prisma.educationGuardianConsent.findMany({ where: { studentId }, orderBy: { updatedAt: "desc" } });
    const logs = await this.prisma.accessAuditLog.findMany({ where: { resourceId: studentId }, orderBy: { createdAt: "desc" }, take: 10 });
    return {
      ok: true,
      consent: [
        ...consents.map((item) => ({ id: item.id, target: item.guardianTeacherId, status: item.active ? "Đang chia sẻ" : "Đã thu hồi", scope: "Tóm tắt an toàn", updatedAt: item.updatedAt })),
        ...logs.map((log) => ({ id: log.id, target: `${log.actorRole}:${log.actorUserId}`, status: log.action, scope: log.reason, updatedAt: log.createdAt })),
      ],
    };
  }

  async getArLessons(studentId: string) {
    const { assignments } = await this.getParentAssignments(studentId);
    const events = await this.recentEvents(studentId, 80);
    const arAssignments = assignments.filter((a: any) => a.title.startsWith("[AR]") || a.subject === "AR Lab");
    const eventItems = events.filter((event) => event.source === "ar_lab" || event.type.startsWith("ar_"));
    const fallback = arAssignments.length ? arAssignments : [{ id: "ar_demo_parent", title: "[AR] Cell Structure", status: "not_started", subject: "Biology" }];
    return {
      ok: true,
      arLessons: fallback.map((item: any) => ({
        id: item.id,
        title: String(item.title).replace(/^\[AR\]\s*/, ""),
        subject: item.subject || "Biology",
        goal: "Quan sát mô hình và giải thích bằng lời của học sinh.",
        status: eventItems.some((event) => event.type === "ar_lesson_completed") ? "completed" : item.status,
        quizResult: eventItems.find((event) => event.type === "ar_quiz_completed")?.safeSummary || "Chưa có kết quả AR quiz.",
        parentQuestion: "Con có thể chỉ ra bộ phận chính trong mô hình không?",
      })),
    };
  }

  async getGroupWork(studentId: string) {
    const rows = await this.prisma.groupWorkEvent.findMany({ where: { studentId }, orderBy: { createdAt: "desc" }, take: 20 });
    return {
      ok: true,
      groups: rows.length ? rows.map((row) => ({
        id: row.id,
        title: row.groupWorkId || row.assignmentId || "Hoạt động nhóm",
        contribution: row.safeSummary,
        trend: "Đã có tham gia",
        support: "Hỏi con đã đóng góp phần nào trong nhóm.",
      })) : [{ id: "group_empty_support", title: "Chưa có hoạt động nhóm mới", contribution: "Student App chưa gửi sự kiện nhóm.", trend: "Chưa đủ dữ liệu", support: "Chờ giáo viên giao hoạt động nhóm." }],
    };
  }

  async getMessages(studentId: string) {
    const parent = await this.getParentReport(studentId);
    return {
      ok: true,
      messages: [
        { id: "msg_homeroom_001", date: new Date().toISOString(), role: "Giáo viên chủ nhiệm", from: "Ms. Linh", subject: "Tóm tắt hỗ trợ tại nhà", body: parent.report.recommendedParentAction },
        { id: "msg_school_001", date: new Date().toISOString(), role: "Nhà trường", from: "OnePad School", subject: "Quyền riêng tư", body: "Phụ huynh kiểm soát việc chia sẻ tóm tắt sức khỏe/wellbeing." },
      ],
    };
  }

  async getNotices() {
    return {
      ok: true,
      notices: [
        { id: "notice_parent_meeting", type: "Họp phụ huynh", title: "Lịch trao đổi định kỳ", date: new Date().toISOString(), summary: "Nhà trường sẽ gửi lịch họp qua app." },
        { id: "notice_exam", type: "Kiểm tra", title: "Ôn tập giữa kỳ", date: new Date(Date.now() + 7 * 86400000).toISOString(), summary: "Phụ huynh hỗ trợ con ôn ngắn mỗi tối." },
        { id: "notice_privacy", type: "Quyền riêng tư", title: "Cập nhật chia sẻ dữ liệu", date: new Date().toISOString(), summary: "Dữ liệu thô không chia sẻ mặc định." },
      ],
    };
  }

  async getTimetable(_studentId: string) {
    return {
      ok: true,
      timetable: [
        { day: "Thứ 2", subject: "Biology", teacher: "Ms. Linh", room: "B-201", currentLesson: "Cell Structure", assignment: "Cell Structure Practice" },
        { day: "Thứ 3", subject: "Math", teacher: "Mr. Nam", room: "A-102", currentLesson: "Linear Equations", assignment: "Equation Review" },
        { day: "Thứ 4", subject: "English", teacher: "Ms. Anna", room: "C-304", currentLesson: "Reading Skills", assignment: "Short Reading" },
        { day: "Thứ 5", subject: "Science", teacher: "Mr. Quang", room: "Lab 1", currentLesson: "Observation", assignment: "Lab Notes" },
        { day: "Thứ 6", subject: "History", teacher: "Ms. Trang", room: "A-204", currentLesson: "Ancient Civilizations", assignment: "Timeline" },
      ],
    };
  }

  async getAttendance(studentId: string) {
    const events = await this.recentEvents(studentId, 60);
    const attendance = events.filter((event) => event.type.startsWith("attendance_"));
    return {
      ok: true,
      attendance: attendance.length ? attendance.map((event) => ({
        date: event.createdAt,
        status: event.type === "attendance_absent" ? "Vắng" : event.type === "attendance_late" ? "Đi muộn" : "Có mặt",
        note: event.safeSummary,
      })) : [
        { date: new Date().toISOString(), status: "Có mặt", note: "Chưa có ghi nhận vắng hoặc đi muộn." },
      ],
    };
  }

  async getParentNotes(studentId: string) {
    const logs = await this.prisma.accessAuditLog.findMany({ where: { actorRole: "parent", resourceId: studentId }, orderBy: { createdAt: "desc" }, take: 5 });
    return {
      ok: true,
      notes: logs.length ? logs.map((log) => ({
        id: log.id,
        title: "Ghi chú quyền riêng tư",
        body: log.reason,
        sharing: "Riêng tư",
        linkedTo: log.resourceType,
      })) : [{ id: "parent_note_private_default", title: "Ghi chú riêng tư", body: "Phụ huynh có thể ghi chú riêng và chỉ chia sẻ khi chủ động cho phép.", sharing: "Riêng tư", linkedTo: "Không liên kết" }],
    };
  }

  async getParentReports(studentId: string) {
    const parent = await this.getParentReport(studentId);
    const family = await this.getFamilyReport(studentId);
    return {
      ok: true,
      reports: [
        { id: "daily", title: "Báo cáo hôm nay", summary: parent.report.todayLearningSummary, action: parent.report.recommendedParentAction },
        { id: "weekly", title: "Báo cáo tuần", summary: family.report.subjectPattern, action: "Ôn các kỹ năng yếu." },
        { id: "privacy", title: "Báo cáo quyền riêng tư", summary: family.report.privacyStatus, action: "Xem trung tâm quyền riêng tư." },
      ],
    };
  }

  async getDeviceSync(studentId: string) {
    const latest = await this.prisma.studentEvent.findFirst({ where: { studentId }, orderBy: { syncedAt: "desc" } });
    const local = await this.prisma.localAiStatusReport.findFirst({ where: { studentId }, orderBy: { createdAt: "desc" } });
    return {
      ok: true,
      device: {
        status: latest ? "Đã đồng bộ dữ liệu từ Student App" : "Chưa có sự kiện từ Student App",
        lastSyncedAt: latest?.syncedAt ? latest.syncedAt.toISOString() : "",
        pendingEvents: 0,
        localAiStatus: local ? `${local.modelId} · ${local.status}` : "Chưa có báo cáo local AI",
        backendStatus: "Backend đang phản hồi",
      },
    };
  }

  async getParentAlerts(studentId: string) {
    const alerts = await this.prisma.childHealthAlert.findMany({ where: { studentId }, orderBy: { createdAt: "desc" }, take: 20 });
    const hidden = await this.prisma.hiddenSignal.findMany({ where: { studentId }, orderBy: { createdAt: "desc" }, take: 20 });
    return {
      ok: true,
      alerts: [
        ...alerts.map((a) => ({
          id: a.id,
          level: a.level === "medium" ? "watch" : a.level,
          category: "health_wellbeing",
          title: a.level === "high" ? "Cần theo dõi sát" : "Cần theo dõi",
          summary: a.safeSummary,
          safeSummary: a.safeSummary,
          recommendedAction: a.recommendedAction,
          evidenceCount: parseJson<any[]>(a.triggeredSignalsJson, []).length || 1,
          confidence: a.confidence,
          createdAt: a.createdAt,
        })),
        ...hidden.slice(0, 8).map((h) => ({
          id: h.id,
          level: h.severity === "high" ? "high" : h.severity === "medium" ? "watch" : "normal",
          category: h.type,
          title: h.severity === "high" ? "Cần theo dõi sát" : "Tín hiệu hỗ trợ",
          summary: h.safeSummary,
          safeSummary: h.safeSummary,
          recommendedAction: "Trao đổi nhẹ với con và liên hệ giáo viên nếu tín hiệu tiếp diễn.",
          evidenceCount: 1,
          confidence: 0.72,
          createdAt: h.createdAt,
        })),
      ],
    };
  }

  async getHealthVaultSummary(studentId: string) {
    const latestAlert = await this.prisma.childHealthAlert.findFirst({ where: { studentId }, orderBy: { createdAt: "desc" } });
    const latestMetric = await this.prisma.phoneHealthMetric.findFirst({ where: { studentId }, orderBy: { capturedAt: "desc" } });
    return {
      ok: true,
      vault: {
        studentId,
        status: latestAlert ? "attention" : "stable",
        latestSignal: latestAlert?.safeSummary || "Chưa có tín hiệu sức khỏe/wellbeing cần chú ý.",
        activitySummary: latestMetric?.activeMinutes ? `Vận động gần nhất khoảng ${latestMetric.activeMinutes} phút.` : "Backend chưa nhận dữ liệu vận động từ Student App/thiết bị.",
        sleepRoutine: latestMetric?.sleepMinutes ? `Giấc ngủ gần nhất khoảng ${(latestMetric.sleepMinutes / 60).toFixed(1)} giờ.` : "Backend chưa nhận dữ liệu giấc ngủ.",
        learningStress: latestAlert?.safeSummary || "Chưa có tín hiệu áp lực học tập cần can thiệp.",
        sharingStatus: "Phụ huynh kiểm soát chia sẻ; giáo viên chỉ xem tóm tắt khi được cho phép.",
        accessHistory: (await this.prisma.accessAuditLog.findMany({ where: { resourceId: studentId }, orderBy: { createdAt: "desc" }, take: 10 })).map((log) => ({ date: log.createdAt, actor: `${log.actorRole}:${log.actorUserId}`, action: log.action })),
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

  async setGuardianConsent(studentId: string, teacherId: string, active: boolean) {
    const existing = await this.prisma.educationGuardianConsent.findFirst({ where: { studentId, guardianTeacherId: teacherId } });
    if (existing) {
      await this.prisma.educationGuardianConsent.update({ where: { id: existing.id }, data: { active } });
    } else {
      await this.prisma.educationGuardianConsent.create({ data: { id: `consent_${studentId}_${teacherId}`, studentId, guardianTeacherId: teacherId, active, supportPlan: "Parent controlled consent policy." } });
    }
    return { ok: true, studentId, teacherId, active };
  }

  async upsertTeacherClassAccess(teacherId: string, classId: string, subjectId: string, roleType: string) {
    const id = `tca_${teacherId}_${classId}_${subjectId}`;
    await this.prisma.teacherClassAccess.upsert({ where: { id }, update: { roleType, subjectId }, create: { id, teacherId, classId, subjectId, roleType } });
    return { ok: true, id, teacherId, classId, subjectId, roleType };
  }

  async removeTeacherClassAccess(teacherId: string, classId: string, subjectId: string) {
    const id = `tca_${teacherId}_${classId}_${subjectId}`;
    await this.prisma.teacherClassAccess.deleteMany({ where: { id } });
    return { ok: true, id };
  }

  async getTeacherLearningSignals(studentId: string) {
    const events = await this.recentEvents(studentId, 30);
    return { ok: true, signals: events.map((event) => ({ id: event.id, time: event.createdAt, type: event.type, source: event.source, severity: event.severity || "low", summary: event.safeSummary, privacyLevel: event.privacyLevel })) };
  }

  async getGuardianSharedSignals(studentId: string, teacherId: string) {
    const consent = await this.prisma.educationGuardianConsent.findFirst({ where: { studentId, guardianTeacherId: teacherId, active: true } });
    if (!consent) return { ok: false, error: "guardian_consent_required" };
    return { ok: true, shared: { studentId, teacherId, medicalSummarySafe: consent.medicalSummarySafe, psychologicalSupportSummarySafe: consent.psychologicalSupportSummarySafe, supportPlan: consent.supportPlan } };
  }

  async createArAssignment(input: { teacherId: string; classId: string; title: string; subject: string; lessonId?: string; dueDate?: string }) {
    const id = `ar_${Date.now().toString(36)}`;
    await this.prisma.assignment.create({ data: { id, classId: input.classId, lessonId: input.lessonId || "lesson_demo_001", title: `[AR] ${input.title}`, status: "assigned", dueDate: input.dueDate ? new Date(input.dueDate) : null } });
    return { ok: true, assignmentId: id };
  }

  async getParentChildren(guardianId: string) {
    const links = await this.prisma.guardianStudentLink.findMany({ where: { guardianId } });
    const students = await this.prisma.student.findMany({ where: { id: { in: links.map((l) => l.studentId) } } });
    return { ok: true, children: students.map((s) => ({ studentId: s.id, name: s.fullName, classId: s.classId })) };
  }

  async getAdminClassAggregate(classId: string) {
    const students = await this.prisma.student.findMany({ where: { classId } });
    const events = await this.prisma.studentEvent.count({ where: { studentId: { in: students.map((s) => s.id) } } });
    const assignments = await this.prisma.assignment.count({ where: { classId } });
    return { ok: true, aggregate: { classId, students: students.length, events, assignments, completionRate: assignments > 0 ? Math.min(100, Math.round((events / assignments) * 100)) : 0 } };
  }

  async getPrivacyReadiness() {
    const blocked = await this.prisma.accessAuditLog.count({ where: { action: { contains: "blocked" } } });
    return { ok: true, readiness: { rawChatBlocked: true, parentControlledHealthData: true, adminAggregateOnly: true, auditEnabled: true, blockedAttempts: blocked } };
  }

  async assignTeacherRole(input: { teacherId: string; classId: string; subjectId: string; roleType: string; expiry?: string }) {
    const result = await this.upsertTeacherClassAccess(input.teacherId, input.classId, input.subjectId, input.roleType);
    return { ...result, expiry: input.expiry || null };
  }
}

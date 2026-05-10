import { Controller, Post } from "@nestjs/common";
import { StudentEventsService } from "../student-events/student-events.service";

function makeId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

@Controller("v1/demo")
export class DemoController {
  constructor(private readonly events: StudentEventsService) {}

  @Post("seed-events")
  async seedEvents() {
    const now = new Date();
    const iso = (offsetHours = 0) => new Date(now.getTime() + offsetHours * 3600000).toISOString();
    return this.events.acceptBatch({
      deviceId: "student_phone_demo",
      sessionId: `demo_session_${Date.now()}`,
      events: [
        {
          id: makeId("evt_device_sync"),
          studentId: "stu_001",
          deviceId: "student_phone_demo",
          sessionId: "demo_session",
          type: "device_sync",
          source: "device",
          safeSummary: "Student App vừa đồng bộ dữ liệu học tập lên backend.",
          metadata: { pendingEvents: 0, appVersion: "parent-demo" },
          privacyLevel: "normal",
          createdAt: iso(-5),
        },
        {
          id: makeId("evt_lesson_opened"),
          studentId: "stu_001",
          deviceId: "student_phone_demo",
          sessionId: "demo_session",
          type: "lesson_opened",
          source: "lesson",
          lessonId: "lesson_demo_001",
          safeSummary: "Học sinh mở bài Cell Structure và đọc phần giới thiệu.",
          metadata: { subject: "Biology", minutes: 12 },
          privacyLevel: "normal",
          createdAt: iso(-4),
        },
        {
          id: makeId("evt_ai_tutor"),
          studentId: "stu_001",
          deviceId: "student_phone_demo",
          sessionId: "demo_session",
          type: "ai_tutor_used",
          source: "ai_tutor",
          lessonId: "lesson_demo_001",
          safeSummary: "Học sinh dùng AI Tutor để hỏi lại chức năng của nucleus và ribosome.",
          metadata: { modelId: "gemma-4-e2b-it", quantization: "int4", action: "explain", status: "success", latencyMs: 2800 },
          privacyLevel: "normal",
          createdAt: iso(-3),
        },
        {
          id: makeId("evt_assignment_opened"),
          studentId: "stu_001",
          deviceId: "student_phone_demo",
          sessionId: "demo_session",
          type: "assignment_opened",
          source: "assignment",
          lessonId: "lesson_demo_001",
          assignmentId: "assignment_demo_001",
          safeSummary: "Học sinh đã mở bài tập Cell Structure Practice.",
          metadata: { subject: "Biology" },
          privacyLevel: "normal",
          createdAt: iso(-2),
        },
        {
          id: makeId("evt_quiz"),
          studentId: "stu_001",
          deviceId: "student_phone_demo",
          sessionId: "demo_session",
          type: "quiz_completed",
          source: "quiz",
          severity: "medium",
          lessonId: "lesson_demo_001",
          quizId: "quiz_cell_001",
          safeSummary: "Học sinh hoàn thành quiz Sinh học và cần ôn lại chức năng bào quan.",
          metadata: { score: 7, total: 10, accuracy: 0.7, repeatedMistakes: ["chức năng bào quan", "so sánh tế bào thực vật và động vật"] },
          privacyLevel: "normal",
          createdAt: iso(-1),
        },
        {
          id: makeId("evt_ar"),
          studentId: "stu_001",
          deviceId: "student_phone_demo",
          sessionId: "demo_session",
          type: "ar_lesson_completed",
          source: "ar_lab",
          lessonId: "lesson_demo_001",
          safeSummary: "Học sinh hoàn thành hoạt động AR quan sát cấu trúc tế bào.",
          metadata: { subject: "Biology", arModel: "cell_model" },
          privacyLevel: "normal",
          createdAt: iso(-0.8),
        },
        {
          id: makeId("evt_group"),
          studentId: "stu_001",
          deviceId: "student_phone_demo",
          sessionId: "demo_session",
          type: "group_work_activity",
          source: "group_work",
          groupWorkId: "group_cell_001",
          assignmentId: "assignment_demo_001",
          safeSummary: "Học sinh đã đóng góp phần mô tả nucleus trong hoạt động nhóm.",
          metadata: { contribution: "nucleus explanation" },
          privacyLevel: "normal",
          createdAt: iso(-0.5),
        },
        {
          id: makeId("evt_support"),
          studentId: "stu_001",
          deviceId: "student_phone_demo",
          sessionId: "demo_session",
          type: "support_requested",
          source: "support",
          severity: "low",
          safeSummary: "Học sinh muốn giáo viên giải thích thêm phần khác nhau giữa các bào quan.",
          metadata: { reason: "lesson_help" },
          privacyLevel: "sensitive",
          createdAt: iso(-0.25),
        },
      ],
    });
  }
}

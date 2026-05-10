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
    const now = new Date().toISOString();
    return this.events.acceptBatch({
      deviceId: "demo_device",
      sessionId: "demo_session",
      events: [
        {
          id: makeId("evt_local_ai"),
          studentId: "stu_001",
          deviceId: "demo_device",
          sessionId: "demo_session",
          type: "local_ai_used",
          source: "local_ai",
          safeSummary: "Student used local AI to explain a biology lesson.",
          metadata: {
            modelId: "gemma-4-e2b-it",
            quantization: "int4",
            action: "explain",
            status: "success",
            latencyMs: 3200,
          },
          privacyLevel: "normal",
          createdAt: now,
        },
        {
          id: makeId("evt_quiz"),
          studentId: "stu_001",
          deviceId: "demo_device",
          sessionId: "demo_session",
          type: "quiz_completed",
          source: "quiz",
          severity: "medium",
          lessonId: "lesson_cell_001",
          quizId: "quiz_cell_001",
          safeSummary: "Student completed a biology quiz and needs review on cell functions.",
          metadata: {
            score: 5,
            total: 10,
            accuracy: 0.5,
            repeatedMistakes: ["cell function", "organelle role"],
          },
          privacyLevel: "normal",
          createdAt: now,
        },
        {
          id: makeId("evt_support"),
          studentId: "stu_001",
          deviceId: "demo_device",
          sessionId: "demo_session",
          type: "support_requested",
          source: "support",
          severity: "low",
          safeSummary: "Student requested teacher help with the current lesson.",
          metadata: {
            reason: "lesson_help",
          },
          privacyLevel: "sensitive",
          createdAt: now,
        },
      ],
    });
  }
}

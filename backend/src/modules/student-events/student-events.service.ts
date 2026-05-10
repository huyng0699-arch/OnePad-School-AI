import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ReportsService } from "../reports/reports.service";
import {
  BatchStudentEventsDto,
  STUDENT_EVENT_SOURCES,
  STUDENT_EVENT_TYPES,
  StudentEventDto,
} from "./dto/batch-student-events.dto";

type RejectedEvent = {
  id: string;
  reason: string;
};

function asNumber(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeSeverity(value?: string) {
  if (value === "urgent") return "high";
  if (value === "high" || value === "medium" || value === "low") return value;
  return "low";
}

@Injectable()
export class StudentEventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reports: ReportsService,
  ) {}

  async acceptBatch(body: BatchStudentEventsDto) {
    const accepted: string[] = [];
    const rejected: RejectedEvent[] = [];

    for (const event of body.events) {
      const validationError = await this.validateEvent(event);
      if (validationError) {
        rejected.push({ id: event.id, reason: validationError });
        continue;
      }

      const existing = await this.prisma.studentEvent.findUnique({ where: { id: event.id } });
      if (existing) {
        accepted.push(event.id);
        continue;
      }

      await this.prisma.studentEvent.create({
        data: {
          id: event.id,
          studentId: event.studentId,
          deviceId: event.deviceId || body.deviceId,
          sessionId: event.sessionId || body.sessionId,
          type: event.type,
          source: event.source,
          severity: normalizeSeverity(event.severity),
          lessonId: event.lessonId,
          pageNumber: event.pageNumber,
          assignmentId: event.assignmentId,
          quizId: event.quizId,
          groupWorkId: event.groupWorkId,
          safeSummary: event.safeSummary,
          metadataJson: event.metadata ? JSON.stringify(event.metadata) : null,
          rawPrivateText: event.rawPrivateText ?? null,
          privacyLevel: event.privacyLevel,
          createdAt: new Date(event.createdAt),
        },
      });

      await this.materializeEvent(event);
      accepted.push(event.id);
    }

    const studentIds = [...new Set(body.events.map((event) => event.studentId))];
    for (const studentId of studentIds) {
      await this.reports.rebuildReportsForStudent(studentId);
    }

    await this.rebuildAggregatesForStudents(studentIds);

    return {
      ok: rejected.length === 0,
      accepted,
      rejected,
    };
  }

  private async rebuildAggregatesForStudents(studentIds: string[]) {
    const students = await this.prisma.student.findMany({ where: { id: { in: studentIds } } });
    const classIds = [...new Set(students.map((student) => student.classId))];
    const schoolIds = [...new Set(students.map((student) => student.schoolId))];

    for (const schoolId of schoolIds) {
      await this.reports.rebuildAdminAggregate(schoolId);
    }

    for (const classId of classIds) {
      const schoolId = students.find((student) => student.classId === classId)?.schoolId || "school_001";
      await this.reports.rebuildAdminAggregate(schoolId, classId);
    }
  }

  private async validateEvent(event: StudentEventDto): Promise<string | null> {
    if (!event.id || event.id.trim().length < 3) return "id is required";
    if (!event.safeSummary || event.safeSummary.trim().length < 3) return "safeSummary is required";

    if (event.rawPrivateText && event.privacyLevel !== "private") {
      return "rawPrivateText requires privacyLevel=private";
    }

    if (!STUDENT_EVENT_TYPES.includes(event.type as (typeof STUDENT_EVENT_TYPES)[number])) {
      return `invalid event type: ${event.type}`;
    }

    if (!STUDENT_EVENT_SOURCES.includes(event.source as (typeof STUDENT_EVENT_SOURCES)[number])) {
      return `invalid event source: ${event.source}`;
    }

    const student = await this.prisma.student.findUnique({ where: { id: event.studentId } });
    if (!student) return `Unknown studentId: ${event.studentId}`;

    const createdAt = new Date(event.createdAt);
    if (Number.isNaN(createdAt.getTime())) return "createdAt must be a valid ISO date";

    return null;
  }

  private async upsertSafeSummary(studentId: string, summaryType: string, content: string) {
    const existing = await this.prisma.safeSummary.findFirst({ where: { studentId, summaryType } });
    if (existing) {
      await this.prisma.safeSummary.update({ where: { id: existing.id }, data: { content } });
      return;
    }
    await this.prisma.safeSummary.create({ data: { studentId, summaryType, content } });
  }

  private async updateAssignmentStatus(event: StudentEventDto, status: string) {
    if (!event.assignmentId) return;
    await this.prisma.assignment.updateMany({
      where: { id: event.assignmentId },
      data: { status },
    });
  }

  private async materializeEvent(event: StudentEventDto) {
    const metadata = event.metadata ?? {};

    if (event.type === "quiz_completed" || event.type === "ar_quiz_completed") {
      const score = asNumber(metadata["score"], 0);
      const total = Math.max(1, asNumber(metadata["total"], 1));
      const accuracy = asNumber(metadata["accuracy"], total > 0 ? score / total : 0);
      await this.prisma.quizResult.create({
        data: {
          studentId: event.studentId,
          lessonId: event.lessonId,
          score,
          total: Math.round(total),
          accuracy,
          repeatedMistakesJson: metadata["repeatedMistakes"] ? JSON.stringify(metadata["repeatedMistakes"]) : null,
        },
      });

      if (accuracy < 0.6) {
        await this.prisma.hiddenSignal.create({
          data: {
            studentId: event.studentId,
            type: "learning_support",
            source: "quiz",
            severity: "medium",
            safeSummary: "Kết quả gần đây cho thấy học sinh nên ôn lại khái niệm trước khi học tiếp.",
          },
        });
      }

      await this.upsertSafeSummary(
        event.studentId,
        "latest_quiz",
        `Bài kiểm tra gần nhất đạt ${Math.round(accuracy * 100)}%. ${event.safeSummary}`,
      );
    }

    if (event.type === "local_ai_used" || event.type === "cloud_ai_used" || event.type === "ai_tutor_used") {
      await this.prisma.localAiStatusReport.create({
        data: {
          studentId: event.studentId,
          modelId: String(metadata["modelId"] ?? (event.type === "cloud_ai_used" ? "cloud_model" : "gemma-4-e2b-it")),
          quantization: String(metadata["quantization"] ?? "int4"),
          status: String(metadata["status"] ?? "success"),
          action: metadata["action"] ? String(metadata["action"]) : event.type,
          latencyMs: metadata["latencyMs"] ? Number(metadata["latencyMs"]) : null,
        },
      });
    }

    if (event.type === "support_requested" || event.type === "teacher_help_requested") {
      await this.prisma.supportRequest.create({
        data: {
          studentId: event.studentId,
          reason: String(metadata["reason"] ?? event.type),
          safeSummary: event.safeSummary,
          privacyLevel: event.privacyLevel,
        },
      });
    }

    if (["group_work_activity", "collaboration_activity", "assignment_submitted", "assignment_completed"].includes(event.type)) {
      await this.prisma.groupWorkEvent.create({
        data: {
          studentId: event.studentId,
          groupWorkId: event.groupWorkId,
          assignmentId: event.assignmentId,
          activityType: event.type,
          safeSummary: event.safeSummary,
        },
      });
    }

    if (event.type === "assignment_opened" || event.type === "assignment_started") {
      await this.updateAssignmentStatus(event, "in_progress");
    }
    if (event.type === "assignment_submitted" || event.type === "assignment_completed") {
      await this.updateAssignmentStatus(event, "submitted");
    }
    if (event.type === "assignment_overdue") {
      await this.updateAssignmentStatus(event, "overdue");
    }

    if (["lesson_completed", "lesson_opened", "page_read", "ar_lesson_opened", "ar_lesson_completed"].includes(event.type)) {
      await this.upsertSafeSummary(event.studentId, "latest_learning_activity", event.safeSummary);
    }

    if (["device_sync"].includes(event.type)) {
      await this.upsertSafeSummary(event.studentId, "latest_device_sync", event.safeSummary);
    }

    if (["support_requested", "teacher_help_requested", "low_confidence_signal", "frustration_signal", "wellbeing_check_in", "wellbeing_signal_received", "attendance_absent", "attendance_late", "assignment_overdue"].includes(event.type)) {
      await this.prisma.hiddenSignal.create({
        data: {
          studentId: event.studentId,
          type: event.type,
          source: event.source,
          severity: normalizeSeverity(event.severity),
          safeSummary: event.safeSummary,
        },
      });
    }
  }
}

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
          severity: event.severity,
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

    await this.reports.rebuildAdminAggregate("school_001", "class_8a");

    return {
      ok: rejected.length === 0,
      accepted,
      rejected,
    };
  }

  private async validateEvent(event: StudentEventDto): Promise<string | null> {
    if (!event.safeSummary || event.safeSummary.trim().length < 3) {
      return "safeSummary is required";
    }

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
    if (!student) {
      return `Unknown studentId: ${event.studentId}`;
    }

    return null;
  }

  private async materializeEvent(event: StudentEventDto) {
    const metadata = event.metadata ?? {};

    if (event.type === "quiz_completed") {
      const score = Number(metadata["score"] ?? 0);
      const total = Math.max(1, Number(metadata["total"] ?? 1));
      const accuracy = Number(metadata["accuracy"] ?? (total > 0 ? score / total : 0));
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
            safeSummary: "Recent quiz accuracy suggests the student may need concept review.",
          },
        });
      }
    }

    if (event.type === "local_ai_used") {
      await this.prisma.localAiStatusReport.create({
        data: {
          studentId: event.studentId,
          modelId: String(metadata["modelId"] ?? "gemma-4-e2b-it"),
          quantization: String(metadata["quantization"] ?? "int4"),
          status: String(metadata["status"] ?? "success"),
          action: metadata["action"] ? String(metadata["action"]) : null,
          latencyMs: metadata["latencyMs"] ? Number(metadata["latencyMs"]) : null,
        },
      });
    }

    if (event.type === "support_requested") {
      await this.prisma.supportRequest.create({
        data: {
          studentId: event.studentId,
          reason: String(metadata["reason"] ?? event.safeSummary),
          safeSummary: event.safeSummary,
          privacyLevel: event.privacyLevel,
        },
      });
    }

    if (event.type === "group_work_activity" || event.type === "assignment_submitted" || event.type === "collaboration_activity") {
      await this.prisma.groupWorkEvent.create({
        data: {
          studentId: event.studentId,
          groupWorkId: event.groupWorkId,
          assignmentId: event.assignmentId,
          activityType: event.type,
          safeSummary: event.safeSummary,
        },
      });

      if (event.type === "assignment_submitted" && event.assignmentId) {
        await this.prisma.assignment.updateMany({
          where: { id: event.assignmentId },
          data: { status: "submitted" },
        });
      }
    }

    if (["support_requested", "teacher_help_requested", "low_confidence_signal", "frustration_signal"].includes(event.type)) {
      await this.prisma.hiddenSignal.create({
        data: {
          studentId: event.studentId,
          type: event.type,
          source: event.source,
          severity: event.severity ?? "low",
          safeSummary: event.safeSummary,
        },
      });
    }
  }
}

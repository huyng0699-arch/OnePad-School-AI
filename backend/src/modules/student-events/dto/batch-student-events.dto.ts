import { IsArray, IsIn, IsInt, IsObject, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export const STUDENT_EVENT_TYPES = [
  "lesson_started",
  "lesson_completed",
  "ai_tutor_used",
  "quiz_started",
  "quiz_completed",
  "short_answer_submitted",
  "adaptive_level_changed",
  "group_work_activity",
  "collaboration_activity",
  "assignment_submitted",
  "support_requested",
  "teacher_help_requested",
  "wellbeing_check_in",
  "low_confidence_signal",
  "frustration_signal",
  "local_ai_used",
  "cloud_ai_used",
] as const;

export const STUDENT_EVENT_SOURCES = [
  "lesson",
  "ai_tutor",
  "quiz",
  "progress",
  "support",
  "group_work",
  "voice_command",
  "local_ai",
  "cloud_ai",
  "lecture_recorder",
  "ar_lab",
] as const;

export class StudentEventDto {
  @IsString()
  id!: string;

  @IsString()
  studentId!: string;

  @IsOptional()
  @IsString()
  deviceId!: string;

  @IsOptional()
  @IsString()
  sessionId!: string;

  @IsIn(STUDENT_EVENT_TYPES)
  type!: string;

  @IsIn(STUDENT_EVENT_SOURCES)
  source!: string;

  @IsOptional()
  @IsIn(["low", "medium", "high"])
  severity?: string;

  @IsOptional()
  @IsString()
  lessonId?: string;

  @IsOptional()
  @IsInt()
  pageNumber?: number;

  @IsOptional()
  @IsString()
  assignmentId?: string;

  @IsOptional()
  @IsString()
  quizId?: string;

  @IsOptional()
  @IsString()
  groupWorkId?: string;

  @IsString()
  safeSummary!: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  rawPrivateText?: string;

  @IsIn(["normal", "sensitive", "private", "parent_controlled", "emergency_only"])
  privacyLevel!: string;

  @IsString()
  createdAt!: string;
}

export class BatchStudentEventsDto {
  @IsString()
  deviceId!: string;

  @IsString()
  sessionId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentEventDto)
  events!: StudentEventDto[];
}

import { IsOptional, IsString } from "class-validator";

export class StandardizeLessonDto {
  @IsOptional()
  @IsString()
  teacherInstructions?: string;

  @IsOptional()
  @IsString()
  modelId?: string;

  @IsOptional()
  structuredLessonOverride?: unknown;
}

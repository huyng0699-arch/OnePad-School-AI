import { IsOptional, IsString } from "class-validator";

export class PublishLessonDto {
  @IsOptional()
  @IsString()
  classId?: string;

  @IsOptional()
  @IsString()
  publishDate?: string;

  @IsOptional()
  @IsString()
  dueDate?: string;

  @IsOptional()
  requireQuiz?: boolean;

  @IsOptional()
  allowLocalAiHelp?: boolean;

  @IsOptional()
  groupWorkEnabled?: boolean;
}

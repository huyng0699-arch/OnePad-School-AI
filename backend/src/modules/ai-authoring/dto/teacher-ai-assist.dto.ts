import { IsIn, IsOptional, IsString } from "class-validator";

export class TeacherAiAssistDto {
  @IsString()
  teacherId!: string;

  @IsString()
  schoolId!: string;

  @IsString()
  action!: string;

  @IsString()
  prompt!: string;

  @IsOptional()
  @IsString()
  modelId?: string;

  @IsOptional()
  @IsIn(["school_default", "personal_gemini", "local_cactus"])
  aiProvider?: "school_default" | "personal_gemini" | "local_cactus";
}

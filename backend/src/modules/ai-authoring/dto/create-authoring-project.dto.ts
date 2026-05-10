import { IsIn, IsOptional, IsString, MinLength } from "class-validator";

export class CreateAuthoringProjectDto {
  @IsString()
  teacherId!: string;

  @IsString()
  schoolId!: string;

  @IsString()
  @MinLength(3)
  title!: string;

  @IsString()
  subject!: string;

  @IsString()
  grade!: string;

  @IsIn(["en", "vi", "bilingual"])
  language!: "en" | "vi" | "bilingual";

  @IsString()
  @MinLength(10)
  rawInput!: string;

  @IsIn(["school_key", "personal_key", "disabled"])
  aiKeyScope!: "school_key" | "personal_key" | "disabled";

  @IsOptional()
  @IsString()
  teacherInstructions?: string;
}

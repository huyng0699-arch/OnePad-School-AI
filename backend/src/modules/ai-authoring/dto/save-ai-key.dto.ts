import { IsIn, IsString } from "class-validator";

export class SaveAiKeyDto {
  @IsString()
  schoolId?: string;

  @IsString()
  teacherId?: string;

  @IsString()
  apiKey!: string;

  @IsIn(["gemini"])
  provider!: "gemini";
}

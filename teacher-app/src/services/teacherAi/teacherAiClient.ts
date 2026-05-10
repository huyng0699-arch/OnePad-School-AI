import { onepadApi } from "../../../lib/api";
import { buildTeacherAiPrompt, type TeacherAiAction } from "./teacherAiPromptBuilder";
import { teacherAiSettingsService } from "./teacherAiSettingsService";
import type { LessonStudioDraft } from "../../types/lessonStudio";

export type TeacherAiResult =
  | { ok: true; text: string; raw: unknown }
  | { ok: false; error: string };

export async function runTeacherAiAction(args: {
  action: TeacherAiAction;
  draft: LessonStudioDraft;
  pageIndex?: number;
  customInstruction?: string;
}): Promise<TeacherAiResult> {
  const settings = teacherAiSettingsService.load();
  const prompt = buildTeacherAiPrompt(args);

  const res = await onepadApi.teacherAiAssist({
    teacherId: "teacher_001",
    schoolId: "school_001",
    action: args.action,
    modelId: settings.modelId,
    aiProvider: settings.provider,
    prompt,
  });

  if (!res?.ok) return { ok: false, error: res?.error || "AI request failed." };
  return { ok: true, text: String(res.text || ""), raw: res };
}

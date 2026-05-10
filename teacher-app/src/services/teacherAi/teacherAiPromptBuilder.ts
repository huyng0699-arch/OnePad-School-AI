import type { LessonStudioDraft } from "../../types/lessonStudio";

export type TeacherAiAction =
  | "lesson_outline"
  | "improve_explanation"
  | "simplify_content"
  | "create_examples"
  | "create_practice_questions"
  | "create_quiz"
  | "teaching_script"
  | "ar_lab_idea"
  | "generate_page_ai_text"
  | "check_lesson_clarity";

export function buildTeacherAiPrompt(args: {
  action: TeacherAiAction;
  draft: LessonStudioDraft;
  pageIndex?: number;
  customInstruction?: string;
}) {
  const page = typeof args.pageIndex === "number" ? args.draft.pages[args.pageIndex] : undefined;
  const base = [
    "You are OnePad Teacher AI assistant.",
    "You support teachers but never auto-publish lessons.",
    "If context is missing, say what is missing.",
    "Do not invent factual claims outside provided content.",
    "Keep output ready to paste into lesson blocks.",
    `Action: ${args.action}`,
    `Title: ${args.draft.title}`,
    `Subject: ${args.draft.subject}`,
    `Grade: ${args.draft.grade}`,
    `Objectives: ${args.draft.objectives.filter(Boolean).join(" | ")}`,
    `Teacher notes: ${args.draft.teacherNotes || "N/A"}`,
  ];

  if (page) {
    base.push(`Target page title: ${page.title}`);
    base.push(`Target page objective: ${page.learningObjective || "N/A"}`);
    base.push(
      `Target page blocks: ${page.blocks
        .map((b) => `${b.type}:${(b.text || b.description || b.title || "").slice(0, 180)}`)
        .join(" || ")}`,
    );
  }

  if (args.customInstruction?.trim()) {
    base.push(`Custom instruction: ${args.customInstruction.trim()}`);
  }

  if (args.action === "create_quiz") {
    base.push(
      "Return valid JSON array only. Each item fields: type,question,options?,correctAnswer?,expectedAnswer?,explanation,difficulty,skillTag",
    );
  }

  return base.join("\n");
}

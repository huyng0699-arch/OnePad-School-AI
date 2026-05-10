import { getPublishedLessonDetail, getPublishedLessons } from "./lessonApiClient";
import { getLesson, saveLesson } from "./lessonCacheService";
import type { Lesson, LessonBlock } from "../../types";

export async function fetchLessonInbox(classId: string) {
  const fromApi = await getPublishedLessons(classId);
  if (fromApi?.ok) return fromApi.lessons || [];
  return [];
}

export async function resolveLesson(lessonId: string, fallbackLesson?: any) {
  const fromApi = await getPublishedLessonDetail(lessonId);
  if (fromApi?.ok && fromApi.lesson) {
    await saveLesson(fromApi.lesson);
    return fromApi.lesson;
  }

  const cached = await getLesson(lessonId);
  if (cached) return cached;
  return fallbackLesson || null;
}

function mapBlockType(block: any): LessonBlock {
  const type = block?.type;
  if (type === "heading") return { type: "heading", text: String(block.text || "") };
  if (type === "paragraph" || type === "summary" || type === "key_concept") return { type: "paragraph", text: String(block.text || "") };
  if (type === "example") return { type: "example", text: String(block.text || "") };
  if (type === "check_your_understanding" || type === "quiz_seed") {
    return {
      type: "question",
      question: String(block.text || "Quick check"),
      options: [],
      correctAnswer: "",
      explanation: "Review the page context and answer in your own words.",
    };
  }
  if (type === "ar_model") {
    return {
      type: "ar_model",
      label: String(block.title || "AR Model"),
      modelUrl: String(block.modelUrl || "local://ar-model"),
      description: String(block.description || block.text || "Open AR preview for guided exploration."),
    };
  }
  if (type === "image_prompt") return { type: "image", imageUrl: "local://image", caption: "Image prompt", aiDescription: String(block.text || "") };
  return { type: "key_point", text: String(block?.text || "") };
}

export function toStudentLesson(structured: any): Lesson {
  return {
    id: String(structured?.id || "published_lesson"),
    title: String(structured?.title || "Published Lesson"),
    subject: String(structured?.subject || "General"),
    grade: String(structured?.grade || "8"),
    pages: Array.isArray(structured?.pages)
      ? structured.pages.map((page: any, idx: number) => ({
          pageNumber: Number(page?.pageNumber || idx + 1),
          title: String(page?.title || `Page ${idx + 1}`),
          aiText: String(page?.aiText || ""),
          blocks: Array.isArray(page?.blocks) ? page.blocks.map(mapBlockType) : [],
        }))
      : [],
  };
}

import type { LessonStudioBlock, LessonStudioDraft, LessonStudioPage, StructuredLesson, StructuredLessonBlock } from "../../types/lessonStudio";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 64);
}

function randId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function generateLessonId(title: string): string {
  const slug = slugify(title) || "lesson";
  return `${slug}-${Date.now().toString(36)}`;
}

function blockToStructured(block: LessonStudioBlock): StructuredLessonBlock {
  const safeText = (block.text || block.description || block.title || "").trim();

  if (block.type === "heading") return { id: block.id, type: "heading", text: safeText || "Heading" };
  if (block.type === "paragraph") return { id: block.id, type: "paragraph", text: safeText || "Paragraph" };
  if (block.type === "key_concept") return { id: block.id, type: "key_concept", text: safeText || "Key concept" };
  if (block.type === "example") return { id: block.id, type: "example", text: safeText || "Example" };
  if (block.type === "callout") return { id: block.id, type: "summary", text: safeText || "Callout" };
  if (block.type === "question") return { id: block.id, type: "check_your_understanding", text: safeText || "Question" };
  if (block.type === "teacher_note") return { id: block.id, type: "summary", text: safeText || "Teacher note" };
  if (block.type === "bullet_list") {
    const list = (block.items || []).filter(Boolean).map((x) => `- ${x}`).join("\n");
    return { id: block.id, type: "paragraph", text: list || safeText || "- Bullet item" };
  }
  if (block.type === "image") {
    const alt = (block.imageAlt || "Learning image").trim();
    const src = (block.imageUrl || "").trim();
    return {
      id: block.id,
      type: "image_prompt",
      text: src ? `Image URL: ${src}\nAlt text: ${alt}` : `Image alt text: ${alt}`,
    };
  }

  const modelUrl = (block.modelUrl || "").trim();
  const description = (block.description || block.text || "AR object").trim();
  return {
    id: block.id,
    type: "ar_model",
    title: (block.title || "AR model").trim(),
    text: description,
    modelUrl,
    thumbnailUrl: (block.thumbnailUrl || "").trim() || undefined,
    description,
    interactionPrompt: (block.interactionPrompt || "").trim() || undefined,
    scale: block.scale,
    rotation: block.rotation,
    alt: (block.imageAlt || "").trim() || undefined,
  };
}

export function buildPageAiText(page: LessonStudioPage): string {
  const lines: string[] = [];
  if (page.title.trim()) lines.push(`Page title: ${page.title.trim()}`);
  if ((page.learningObjective || "").trim()) lines.push(`Learning objective: ${(page.learningObjective || "").trim()}`);

  for (const block of page.blocks) {
    if (block.type === "image") {
      const alt = (block.imageAlt || "Learning image").trim();
      lines.push(`Image: ${alt}`);
      continue;
    }
    if (block.type === "ar_model") {
      if ((block.description || "").trim()) lines.push(`AR description: ${(block.description || "").trim()}`);
      if ((block.interactionPrompt || "").trim()) lines.push(`AR interaction: ${(block.interactionPrompt || "").trim()}`);
      continue;
    }
    if (block.type === "bullet_list") {
      const merged = (block.items || []).filter(Boolean).map((x) => `- ${x}`).join("\n");
      if (merged) lines.push(merged);
      continue;
    }

    const txt = (block.text || block.title || "").trim();
    if (txt) lines.push(txt);
  }

  return lines.join("\n").trim();
}

export function buildStructuredLessonFromTeacherInput(input: LessonStudioDraft): StructuredLesson {
  const lessonId = input.lessonId || generateLessonId(input.title);
  return {
    id: lessonId,
    title: input.title.trim(),
    subject: input.subject.trim(),
    grade: input.grade.trim(),
    language: input.language,
    estimatedMinutes: input.estimatedMinutes,
    learningObjectives: input.objectives.filter((x) => x.trim().length > 0),
    pages: input.pages.map((page, idx) => ({
      pageNumber: idx + 1,
      title: page.title.trim() || `Page ${idx + 1}`,
      blocks: page.blocks.map(blockToStructured),
      aiText: (page.aiText || buildPageAiText(page)).trim(),
    })),
    quizSeeds: input.quizSeeds,
    teacherGuide: {
      lessonOverview: input.teacherNotes || `${input.title} lesson guide for ${input.grade}.`,
      keyMisconceptions: ["Students may memorize terms without understanding relationships."],
      teachingSteps: ["Introduce concept", "Model an example", "Check understanding", "Assign follow-up"],
      discussionPrompts: ["What idea was easiest?", "Which part needs review?"],
      differentiationTips: {
        foundation: "Use short guided prompts and visual cues.",
        standard: "Keep grade-level explanation with examples.",
        advanced: "Ask students to connect concepts to new contexts.",
      },
      assessmentRubric: [
        {
          criterion: "Concept understanding",
          excellent: "Clear and accurate explanation with examples.",
          developing: "Basic explanation with minor gaps.",
          needsSupport: "Needs guided support to explain core concept.",
        },
      ],
    },
    adaptiveVersions: {
      foundation: "Reduce cognitive load and use chunked explanations.",
      standard: "Balance explanation and student practice.",
      advanced: "Add extension challenge questions.",
    },
  };
}

export function validateLessonDraft(lesson: LessonStudioDraft): string[] {
  const errors: string[] = [];
  if (!lesson.title.trim()) errors.push("Lesson title is required.");
  if (!lesson.subject.trim()) errors.push("Subject is required.");
  if (!lesson.grade.trim()) errors.push("Grade is required.");
  if (lesson.classIds.length === 0) errors.push("At least one class is required.");
  if (lesson.pages.length === 0) errors.push("At least one page is required.");

  lesson.pages.forEach((p, index) => {
    if (!p.title.trim()) errors.push(`Page ${index + 1} title is required.`);
    if (p.blocks.length === 0) errors.push(`Page ${index + 1} must have at least one block.`);
    const aiText = (p.aiText || buildPageAiText(p)).trim();
    if (!aiText) errors.push(`Page ${index + 1} aiText is empty.`);

    p.blocks.forEach((b) => {
      if (b.type === "ar_model") {
        const hasModel = (b.modelUrl || "").trim().length > 0;
        const hasFallback = (b.thumbnailUrl || "").trim().length > 0 || (b.description || "").trim().length > 0;
        if (!hasModel && !hasFallback) errors.push(`AR block ${b.id} must include modelUrl or fallback content.`);
      }
    });
  });

  return errors;
}

export function normalizeLessonForPublish(lesson: StructuredLesson): StructuredLesson {
  return {
    ...lesson,
    title: lesson.title.trim(),
    subject: lesson.subject.trim(),
    grade: lesson.grade.trim(),
    learningObjectives: lesson.learningObjectives.map((x) => x.trim()).filter(Boolean),
    pages: lesson.pages.map((p, idx) => ({
      ...p,
      pageNumber: idx + 1,
      title: p.title.trim() || `Page ${idx + 1}`,
      aiText: p.aiText.trim(),
    })),
  };
}

export function createLessonManifestItem(lesson: StructuredLesson) {
  return {
    lessonId: lesson.id,
    title: lesson.title,
    subject: lesson.subject,
    grade: lesson.grade,
    language: lesson.language,
    pageCount: lesson.pages.length,
    estimatedMinutes: lesson.estimatedMinutes,
    updatedAt: new Date().toISOString(),
  };
}

export function createEmptyDraft(): LessonStudioDraft {
  return {
    title: "",
    subject: "",
    grade: "",
    language: "en",
    classIds: ["class_8a"],
    objectives: [""],
    estimatedMinutes: 35,
    difficulty: "standard",
    tags: [],
    teacherNotes: "",
    pages: [
      {
        id: randId("page"),
        pageNumber: 1,
        title: "",
        learningObjective: "",
        blocks: [{ id: randId("block"), type: "heading", text: "" }],
      },
    ],
    quizSeeds: [],
  };
}

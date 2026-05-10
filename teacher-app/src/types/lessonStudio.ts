export type LessonStudioBlockType =
  | "heading"
  | "paragraph"
  | "bullet_list"
  | "example"
  | "callout"
  | "key_concept"
  | "question"
  | "image"
  | "ar_model"
  | "teacher_note";

export type LessonStudioBlock = {
  id: string;
  type: LessonStudioBlockType;
  text?: string;
  items?: string[];
  imageUrl?: string;
  imageAlt?: string;
  modelUrl?: string;
  thumbnailUrl?: string;
  interactionPrompt?: string;
  title?: string;
  description?: string;
  scale?: number;
  rotation?: { x: number; y: number; z: number };
};

export type LessonStudioPage = {
  id: string;
  pageNumber: number;
  title: string;
  learningObjective?: string;
  blocks: LessonStudioBlock[];
  aiText?: string;
};

export type LessonStudioDraft = {
  lessonId?: string;
  title: string;
  subject: string;
  grade: string;
  language: "en" | "vi" | "bilingual";
  classIds: string[];
  objectives: string[];
  estimatedMinutes: number;
  difficulty: "foundation" | "standard" | "advanced" | "adaptive";
  tags: string[];
  teacherNotes: string;
  pages: LessonStudioPage[];
  quizSeeds: {
    id: string;
    type: "multiple_choice" | "short_answer" | "spoken_answer";
    question: string;
    options?: string[];
    correctAnswer?: string;
    expectedAnswer?: string;
    explanation: string;
    difficulty: "foundation" | "standard" | "advanced";
    skillTag: string;
  }[];
};

export type StructuredLessonBlock =
  | { id: string; type: "heading" | "paragraph" | "key_concept" | "example" | "check_your_understanding" | "summary" | "image_prompt" | "quiz_seed"; text: string; aiText?: string }
  | {
      id: string;
      type: "ar_model";
      title: string;
      text: string;
      modelUrl: string;
      thumbnailUrl?: string;
      description: string;
      interactionPrompt?: string;
      scale?: number;
      rotation?: { x: number; y: number; z: number };
      alt?: string;
      aiText?: string;
    };

export type StructuredLesson = {
  id: string;
  title: string;
  subject: string;
  grade: string;
  language: "en" | "vi" | "bilingual";
  estimatedMinutes: number;
  learningObjectives: string[];
  pages: {
    pageNumber: number;
    title: string;
    blocks: StructuredLessonBlock[];
    aiText: string;
  }[];
  quizSeeds: LessonStudioDraft["quizSeeds"];
  teacherGuide: {
    lessonOverview: string;
    keyMisconceptions: string[];
    teachingSteps: string[];
    discussionPrompts: string[];
    differentiationTips: {
      foundation: string;
      standard: string;
      advanced: string;
    };
    assessmentRubric: {
      criterion: string;
      excellent: string;
      developing: string;
      needsSupport: string;
    }[];
  };
  adaptiveVersions: {
    foundation: string;
    standard: string;
    advanced: string;
  };
};

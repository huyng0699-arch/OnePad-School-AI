import type { Lesson, LessonPage } from '../types';
import type { AiAction, AiContextMode } from './ai/aiTypes';

type HistoryMessage = {
  role: 'user' | 'assistant' | 'system';
  text: string;
};

type BuildAiContextInput = {
  action: AiAction;
  contextMode?: AiContextMode;
  userText?: string;
  currentPage?: LessonPage | null;
  lesson?: Lesson | null;
  selectedText?: string;
  transcript?: string;
  modelMetadata?: {
    label?: string;
    description?: string;
  };
  chatHistory?: HistoryMessage[];
};

export type BuiltAiContext = {
  contextText: string;
  trimmedUserText: string;
  trimmedHistory: HistoryMessage[];
  metadata: Record<string, unknown>;
};

const CONTEXT_LIMITS: Record<AiContextMode, number> = {
  general: 0,
  intent: 900,
  lesson: 2800,
  quiz: 4000,
  assessment: 2600,
  ar: 1800,
  transcript: 4000,
  schedule: 1600,
  grades: 1600,
  support: 1200,
  report: 2200,
  group_work: 2600
};

export function buildAiContext(input: BuildAiContextInput): BuiltAiContext {
  const contextMode = input.contextMode ?? inferModeFromAction(input.action);
  const trimmedUserText = (input.userText ?? '').trim().slice(0, 1200);
  const trimmedHistory = (input.chatHistory ?? [])
    .filter((item) => item.text.trim().length > 0)
    .slice(-6)
    .map((item) => ({ ...item, text: item.text.trim().slice(0, 500) }));

  let contextText = '';
  if (contextMode === 'lesson') {
    contextText = (input.selectedText?.trim() || input.currentPage?.aiText?.trim() || '').slice(0, CONTEXT_LIMITS.lesson);
  } else if (contextMode === 'quiz') {
    contextText = (input.selectedText?.trim() || input.currentPage?.aiText?.trim() || '').slice(0, CONTEXT_LIMITS.quiz);
  } else if (contextMode === 'assessment') {
    contextText = (input.selectedText?.trim() || input.currentPage?.aiText?.trim() || '').slice(0, CONTEXT_LIMITS.assessment);
  } else if (contextMode === 'ar') {
    const lessonTitle = input.lesson ? `${input.lesson.subject} - ${input.lesson.title}` : '';
    const label = input.modelMetadata?.label ?? '';
    const description = input.modelMetadata?.description ?? '';
    const pageText = input.currentPage?.aiText ?? '';
    contextText = [lessonTitle, label, description, pageText].filter(Boolean).join('\n').slice(0, CONTEXT_LIMITS.ar);
  } else if (contextMode === 'transcript') {
    contextText = (input.transcript ?? '').trim().slice(0, CONTEXT_LIMITS.transcript);
  } else if (contextMode === 'intent' || contextMode === 'schedule' || contextMode === 'grades' || contextMode === 'support' || contextMode === 'report' || contextMode === 'group_work') {
    contextText = (input.selectedText?.trim() || input.currentPage?.aiText?.trim() || '').slice(0, CONTEXT_LIMITS[contextMode]);
  }

  return {
    contextText,
    trimmedUserText,
    trimmedHistory,
    metadata: {
      contextMode,
      lessonId: input.lesson?.id,
      pageNumber: input.currentPage?.pageNumber,
      modelLabel: input.modelMetadata?.label
    }
  };
}

function inferModeFromAction(action: AiAction): AiContextMode {
  if (action === 'ar_explain') {
    return 'ar';
  }
  if (action === 'transcript_summary') {
    return 'transcript';
  }
  if (action === 'quiz') {
    return 'quiz';
  }
  if (action === 'grade_answer' || action === 'grade_answer_batch') {
    return 'assessment';
  }
  if (action === 'chat') {
    return 'general';
  }
  if (action === 'voice_command') {
    return 'intent';
  }
  return 'lesson';
}

import type { Lesson, LessonPage } from '../types';

export type ReaderAction = 'tomTat' | 'giaiThich' | 'taoQuiz' | '';

export function getLessonReaderActionText(
  currentPage: LessonPage,
  selectedAction: ReaderAction
): string {
  if (selectedAction === 'tomTat') {
    return `Summary: ${currentPage.aiText}`;
  }
  if (selectedAction === 'giaiThich') {
    return `Explanation: ${currentPage.aiText}`;
  }
  if (selectedAction === 'taoQuiz') {
    return `Quiz prompt: ${currentPage.aiText}`;
  }
  return 'Choose Summarize, Explain, or Create Quiz for the current page.';
}

export function getAdvancedModes(lesson: Lesson): string[] {
  return ['Advanced Practice', 'Speed Review', `Comprehensive ${lesson.title}`];
}

export function getAdvancedChallengeStatus(lesson: Lesson, mode: string): string {
  return `Advanced challenge is ready for "${lesson.title}" in mode: ${mode}`;
}

import type { Lesson } from '../types';

export function getQuestionSuggestions(lesson: Lesson): string[] {
  return lesson.pages.flatMap((page) =>
    page.blocks
      .filter((block) => block.type === 'question')
      .map((block) =>
        block.type === 'question' ? `Page ${page.pageNumber}: ${block.question}` : ''
      )
  );
}

export function getMockAiResponse(lesson: Lesson, selectedQuestion: string): string {
  if (!selectedQuestion) {
    return '';
  }

  const matchedPage = lesson.pages.find((page) =>
    selectedQuestion.includes(`Trang ${page.pageNumber}:`)
  );

  return matchedPage?.aiText ?? lesson.pages[0]?.aiText ?? '';
}

export function getMockStudyHint(): string {
  return 'Study hint: break each question into smaller steps before answering.';
}

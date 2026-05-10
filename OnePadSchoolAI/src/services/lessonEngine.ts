import type { Lesson, LessonBlock, LessonPage } from '../types';

export type LessonAction = 'tomTat' | 'giaiThich' | 'taoQuiz' | '';

export type ArModelItem = {
  label: string;
  modelUrl: string;
  description: string;
  aiText: string;
  pageNumber: number;
};

export function getCurrentLesson(lesson: Lesson): Lesson {
  return lesson;
}

export function getCurrentPage(lesson: Lesson, currentPageIndex: number): LessonPage {
  const safeIndex = Math.min(Math.max(currentPageIndex, 0), lesson.pages.length - 1);
  return lesson.pages[safeIndex];
}

export function getCurrentBlock(page: LessonPage, currentBlockIndex: number): LessonBlock | null {
  if (page.blocks.length === 0) {
    return null;
  }
  const safeIndex = Math.min(Math.max(currentBlockIndex, 0), page.blocks.length - 1);
  return page.blocks[safeIndex];
}

export function getCurrentTextForAI(page: LessonPage): string {
  return page.aiText;
}

export function summarizeCurrentPage(page: LessonPage): string {
  const brief = page.aiText.split('.').filter(Boolean)[0] ?? page.aiText;
  return `Summary: ${brief.trim()}.`;
}

export function explainCurrentPage(page: LessonPage): string {
  return `Explanation: ${page.aiText}`;
}

function extractQuestionBlocks(page: LessonPage): string[] {
  return page.blocks
    .filter((block) => block.type === 'question')
    .map((block) => (block.type === 'question' ? block.question : ''));
}

export function createQuizPromptForPage(page: LessonPage): string {
  const questions = extractQuestionBlocks(page);
  if (questions.length > 0) {
    return `Create quiz from question blocks: ${questions.join(' | ')}`;
  }
  return `Create a basic quiz from page text: ${page.aiText}`;
}

export function getLessonReaderActionText(page: LessonPage, action: LessonAction): string {
  if (action === 'tomTat') {
    return summarizeCurrentPage(page);
  }
  if (action === 'giaiThich') {
    return explainCurrentPage(page);
  }
  if (action === 'taoQuiz') {
    return createQuizPromptForPage(page);
  }
  return 'Choose Summarize, Explain, or Create Quiz for the current page.';
}

export function getArModelsFromLesson(lesson: Lesson): ArModelItem[] {
  return lesson.pages.flatMap((page) =>
    page.blocks
      .filter((block) => block.type === 'ar_model')
      .map((block) =>
        block.type === 'ar_model'
          ? {
              label: block.label,
              modelUrl: block.modelUrl,
              description: block.description,
              aiText: page.aiText,
              pageNumber: page.pageNumber
            }
          : null
      )
      .filter((item): item is ArModelItem => item !== null)
  );
}

export function getArModelExplanation(model: ArModelItem | null): string {
  if (!model) {
    return 'No AR model is available for the current lesson.';
  }
  return `AI explanation: ${model.description}. Lesson context: ${model.aiText}`;
}

export function getQuestionBlocksFromLesson(lesson: Lesson): Array<{ page: LessonPage; block: LessonBlock }> {
  return lesson.pages.flatMap((page) =>
    page.blocks
      .filter((block) => block.type === 'question')
      .map((block) => ({ page, block }))
  );
}

export function buildLessonContextSlice(
  lesson: Lesson,
  startPageIndex: number,
  maxChars = 4200,
  maxPages = 3
): { text: string; pageNumbers: number[]; isPartial: boolean } {
  const pages = lesson.pages.slice(Math.max(0, startPageIndex), Math.max(0, startPageIndex) + maxPages);
  const chunks: string[] = [];
  const pageNumbers: number[] = [];
  let used = 0;

  for (const page of pages) {
    const entry = `Page ${page.pageNumber} - ${page.title}\n${page.aiText}`;
    const remaining = maxChars - used;
    if (remaining <= 0) {
      break;
    }
    chunks.push(entry.slice(0, remaining));
    pageNumbers.push(page.pageNumber);
    used += entry.length + 2;
    if (used >= maxChars) {
      break;
    }
  }

  return {
    text: chunks.join('\n\n'),
    pageNumbers,
    isPartial: pageNumbers.length < lesson.pages.length
  };
}

export function buildFullLessonContext(lesson: Lesson, maxChars = 9000): string {
  return lesson.pages
    .map((page) => `Page ${page.pageNumber} - ${page.title}\n${page.aiText}`)
    .join('\n\n')
    .slice(0, maxChars);
}

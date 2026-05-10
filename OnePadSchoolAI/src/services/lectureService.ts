import type { Lesson } from '../types';

export function getSampleTranscript(): string {
  return [
    'Hom nay chung ta hoc ve cau truc te bao.',
    'Te bao gom mang sinh chat, te bao chat va nhan.',
    'Moi thanh phan co vai tro rieng trong hoat dong song cua te bao.'
  ].join(' ');
}

export function getMockLectureSummary(lesson: Lesson): string {
  return `Tom tat mock: Bai ${lesson.title} nhan manh 3 phan chinh cua te bao va vai tro cua tung phan.`;
}

export function getMockQuizFromTranscript(): string {
  return 'Quiz mock: 1) Ke ten 3 thanh phan chinh cua te bao. 2) Nhan te bao co vai tro gi?';
}

export function getMockAttachStatus(lesson: Lesson): string {
  return `Da gan transcript mock vao bai hoc hien tai: ${lesson.subject} - ${lesson.title}`;
}


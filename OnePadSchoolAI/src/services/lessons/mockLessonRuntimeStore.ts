import { mockLessons, todayLessons } from '../../data/mockData';
import type { Lesson } from '../../types';

let activeMockLessonId = todayLessons[0]?.id ?? mockLessons[0]?.id ?? '';

export function setActiveMockLessonId(lessonId: string): void {
  activeMockLessonId = lessonId;
}

export function getActiveMockLessonId(): string {
  return activeMockLessonId;
}

export function getActiveMockLesson(fallback: Lesson): Lesson {
  return mockLessons.find((item) => item.id === activeMockLessonId) ?? fallback;
}

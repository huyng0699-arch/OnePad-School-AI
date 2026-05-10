let activePublishedLessonId: string | null = null;

export function setActivePublishedLessonId(lessonId: string | null) {
  activePublishedLessonId = lessonId;
}

export function getActivePublishedLessonId() {
  return activePublishedLessonId;
}


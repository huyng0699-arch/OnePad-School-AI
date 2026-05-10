import type { DemoQuizQuestion } from './quizEngine';

export type QuizSessionSource = 'local' | 'ai' | 'transcript';

export type PendingQuizSession = {
  source: QuizSessionSource;
  lessonId?: string;
  pageNumber?: number;
  questions: DemoQuizQuestion[];
};

let pendingSession: PendingQuizSession | null = null;
let currentSession: PendingQuizSession | null = null;

export function setPendingQuizSession(session: PendingQuizSession): void {
  pendingSession = session;
}

export function consumePendingQuizSession(): PendingQuizSession | null {
  const current = pendingSession;
  pendingSession = null;
  currentSession = current;
  return current;
}

export function peekPendingQuizSession(): PendingQuizSession | null {
  return pendingSession;
}

export function getCurrentQuizSession(): PendingQuizSession | null {
  return currentSession;
}

export function resetQuizSession(): void {
  pendingSession = null;
  currentSession = null;
}

export type PendingLessonCommand =
  | 'next_page'
  | 'previous_page'
  | 'summarize_current_page'
  | 'explain_current_page'
  | 'create_quiz_from_current_page';

let pendingLessonCommand: PendingLessonCommand | null = null;

export function setPendingLessonCommand(command: PendingLessonCommand): void {
  pendingLessonCommand = command;
}

export function consumePendingLessonCommand(): PendingLessonCommand | null {
  const current = pendingLessonCommand;
  pendingLessonCommand = null;
  return current;
}


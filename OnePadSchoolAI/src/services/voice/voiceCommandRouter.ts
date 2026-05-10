import type { VoiceCommandIntent, VoiceCommandResult } from './voiceTypes';
import { interpretTranscript } from '../voiceCommandService';
import type { VoiceCommandResult as LegacyVoiceCommandResult } from '../voiceLocalCommandMatcher';

export function mapIntentToLegacyAction(intent: VoiceCommandIntent): LegacyVoiceCommandResult['action'] {
  switch (intent) {
    case 'open_lesson':
      return 'open_lesson_reader';
    case 'summarize_current_page':
      return 'summarize_current_page';
    case 'explain_current_page':
      return 'explain_current_page';
    case 'create_quiz':
      return 'open_quiz';
    case 'open_ai_tutor':
      return 'open_ai_tutor';
    case 'open_ar_lab':
      return 'open_ar_lab';
    case 'open_progress':
      return 'open_progress';
    case 'open_support':
      return 'open_support';
    case 'open_home':
      return 'open_home';
    default:
      return 'unknown';
  }
}

export function toLegacyCommand(command: VoiceCommandResult): LegacyVoiceCommandResult {
  return {
    action: mapIntentToLegacyAction(command.intent),
    confidence: command.confidence,
    spokenText: command.transcript,
    target: command.lessonId ?? null,
    params: command.raw && typeof command.raw === 'object' ? command.raw as Record<string, unknown> : {},
    confirmation: command.actionText ?? 'I could not understand the command. Please try again.',
    source: 'ai'
  };
}

export async function inferIntentFromTranscript(transcript: string, currentScreen: string, currentLessonTitle?: string, currentPageNumber?: number): Promise<VoiceCommandResult> {
  const parsed = await interpretTranscript({ transcript, currentScreen, currentLessonTitle, currentPageNumber });
  const mappedIntent: VoiceCommandIntent = parsed.action === 'open_lesson_reader'
    ? 'open_lesson'
    : parsed.action === 'summarize_current_page'
      ? 'summarize_current_page'
      : parsed.action === 'explain_current_page'
        ? 'explain_current_page'
        : parsed.action === 'open_quiz' || parsed.action === 'create_quiz_from_current_page'
          ? 'create_quiz'
          : parsed.action === 'open_ai_tutor'
            ? 'open_ai_tutor'
            : parsed.action === 'open_ar_lab'
              ? 'open_ar_lab'
              : parsed.action === 'open_progress'
                ? 'open_progress'
                : parsed.action === 'open_support'
                  ? 'open_support'
                  : parsed.action === 'open_home'
                    ? 'open_home'
                    : 'unknown';

  return {
    transcript,
    intent: mappedIntent,
    confidence: parsed.confidence,
    actionText: parsed.confirmation,
    raw: parsed
  };
}

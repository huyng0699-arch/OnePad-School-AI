import { executeVoiceCommand } from './appActionExecutor';
import { normalizeAiOutputForSpeech } from './aiOutputNormalizer';
import { interpretTranscript } from './voiceCommandService';
import { listenWithWhisperOnce, speakWithAndroidTts } from './whisperVoiceService';
import type { HomeRouteTarget } from '../screens/HomeScreen';

type StudentHubSectionTarget = 'schedule' | 'grades' | 'assignments' | 'reports' | 'tools' | 'settings';

export type HandsFreeVoiceInput = {
  currentScreen: string;
  currentLessonTitle?: string;
  currentPageNumber?: number;
  navigate: (target: HomeRouteTarget) => void;
  openStudentHub: () => void;
  openStudentHubSection: (section: StudentHubSectionTarget) => void;
  setStatus?: (status: string) => void;
};

export type HandsFreeVoiceResult = {
  ok: boolean;
  transcript?: string;
  message: string;
};

export async function runHandsFreeVoiceCommand(input: HandsFreeVoiceInput): Promise<HandsFreeVoiceResult> {
  input.setStatus?.('Recording with Whisper, then processing on device...');
  const listenResult = await listenWithWhisperOnce(9000);
  if (!listenResult.ok || !listenResult.transcript?.trim()) {
    const message = listenResult.message ?? 'I did not catch that. Please try again in English.';
    input.setStatus?.(message);
    await speakWithAndroidTts(message);
    return { ok: false, message };
  }

  const transcript = listenResult.transcript.trim();
  input.setStatus?.(`Heard: ${transcript}`);
  const command = await interpretTranscript({
    transcript,
    currentScreen: input.currentScreen,
    currentLessonTitle: input.currentLessonTitle,
    currentPageNumber: input.currentPageNumber
  });

  const outcome = executeVoiceCommand(command, {
    navigate: input.navigate,
    openStudentHub: input.openStudentHub,
    openStudentHubSection: input.openStudentHubSection,
    currentScreen: input.currentScreen
  });

  const message = normalizeAiOutputForSpeech(outcome.message || command.confirmation);
  input.setStatus?.(`${transcript} -> ${outcome.message}`);
  await speakWithAndroidTts(message);
  return { ok: outcome.executed, transcript, message: outcome.message };
}

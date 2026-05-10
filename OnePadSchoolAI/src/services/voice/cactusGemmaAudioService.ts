import type { AudioSegment, GemmaAudioStatus, VoiceCommandResult } from './voiceTypes';

const GEMMA_AUDIO_AVAILABLE = false;

export function getGemmaAudioStatus(): GemmaAudioStatus {
  return GEMMA_AUDIO_AVAILABLE ? 'ready' : 'not_available';
}

export async function processAudioSegment(_segment: AudioSegment): Promise<VoiceCommandResult> {
  if (!GEMMA_AUDIO_AVAILABLE) {
    throw new Error('Gemma audio input is not available in this build.');
  }

  return {
    transcript: '',
    intent: 'unknown',
    confidence: 0,
    actionText: 'No command detected.'
  };
}

export const gemmaAudioInstruction = `You are the local voice command interpreter for OnePad School AI.\nListen to the provided audio segment and return JSON only.\n\nReturn this JSON shape:\n{\n  "transcript": "...",\n  "intent": "open_lesson | summarize_current_page | explain_current_page | create_quiz | open_ai_tutor | open_ar_lab | open_progress | open_support | open_home | unknown",\n  "confidence": 0.0,\n  "lessonId": null,\n  "actionText": "short user-facing description"\n}\n\nRules:\n- Do not invent lessons.\n- If the command is unclear, return intent = "unknown".\n- If the user asks to open a known lesson, include lessonId if matched.\n- Return JSON only.`;

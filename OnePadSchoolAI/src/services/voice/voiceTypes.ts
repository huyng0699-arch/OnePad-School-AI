export type VoiceEngine = 'gemma_audio' | 'whisper_transcription';

export type VoiceState = 'idle' | 'listening' | 'hearing_speech' | 'processing' | 'ready' | 'error';

export type VoiceCommandIntent =
  | 'open_lesson'
  | 'summarize_current_page'
  | 'explain_current_page'
  | 'create_quiz'
  | 'open_ai_tutor'
  | 'open_ar_lab'
  | 'open_progress'
  | 'open_support'
  | 'open_home'
  | 'unknown';

export type VoiceCommandResult = {
  transcript: string;
  intent: VoiceCommandIntent;
  confidence: number;
  lessonId?: string;
  actionText?: string;
  raw?: unknown;
};

export type AudioSegment = {
  id: string;
  pcmPath?: string;
  wavPath?: string;
  durationMs: number;
  sampleRate: number;
  channels: number;
  createdAt: string;
};

export type WhisperModelStatus = 'not_downloaded' | 'downloading' | 'ready' | 'error';

export type GemmaAudioStatus = 'ready' | 'not_available' | 'error';

export type VoiceControllerSnapshot = {
  state: VoiceState;
  engine: VoiceEngine;
  engineStatus: WhisperModelStatus | GemmaAudioStatus;
  lastTranscript: string;
  lastDetectedAction: string;
  lastConfidence: number;
  lastLatencyMs: number;
  lastError?: string;
};

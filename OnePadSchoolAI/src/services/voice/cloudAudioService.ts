import type { AudioSegment, CloudAudioStatus, VoiceUnderstandingResult } from './voiceTypes';

const CLOUD_AUDIO_CONFIGURED = false;

export function getCloudAudioStatus(): CloudAudioStatus {
  return CLOUD_AUDIO_CONFIGURED ? 'ready' : 'not_configured';
}

export async function processCloudAudioSegment(_segment: AudioSegment): Promise<VoiceUnderstandingResult> {
  if (!CLOUD_AUDIO_CONFIGURED) {
    throw new Error('Cloud audio understanding is not configured in this build.');
  }

  return {
    transcript: '',
    source: 'cloud_audio',
    confidence: 0,
    latencyMs: 0
  };
}

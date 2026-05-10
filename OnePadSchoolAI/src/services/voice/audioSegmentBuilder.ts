import type { AudioSegment } from './voiceTypes';

export function buildAudioSegment(input: {
  uri?: string;
  durationMs: number;
  sampleRate?: number;
  channels?: number;
}): AudioSegment | null {
  if (!input.uri) return null;
  if (input.durationMs < 400) return null;
  return {
    id: `segment_${Date.now()}`,
    wavPath: input.uri,
    durationMs: input.durationMs,
    sampleRate: input.sampleRate ?? 16000,
    channels: input.channels ?? 1,
    createdAt: new Date().toISOString()
  };
}

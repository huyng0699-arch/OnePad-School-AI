import type { AudioFrame } from './audioCaptureService';

type VadEventType = 'speech_started' | 'speech_stopped' | 'silence' | 'max_utterance_reached';

type VadEvent = {
  type: VadEventType;
  timestampMs: number;
};

type VadListener = (event: VadEvent) => void;

export class VadTurnDetector {
  private listeners = new Set<VadListener>();
  private speaking = false;
  private speechStartMs = 0;
  private lastSpeechMs = 0;

  private readonly minSpeechMs = 500;
  private readonly silenceToStopMs = 800;
  private readonly maxUtteranceMs = 10000;

  subscribe(listener: VadListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  onFrame(frame: AudioFrame): void {
    if (frame.isSpeechLikely) {
      this.lastSpeechMs = frame.timestampMs;
      if (!this.speaking) {
        this.speaking = true;
        this.speechStartMs = frame.timestampMs;
        this.emit({ type: 'speech_started', timestampMs: frame.timestampMs });
      }
      if (frame.timestampMs - this.speechStartMs >= this.maxUtteranceMs) {
        this.emit({ type: 'max_utterance_reached', timestampMs: frame.timestampMs });
      }
      return;
    }

    if (!this.speaking) {
      this.emit({ type: 'silence', timestampMs: frame.timestampMs });
      return;
    }

    const speechDuration = this.lastSpeechMs - this.speechStartMs;
    const silenceDuration = frame.timestampMs - this.lastSpeechMs;
    if (speechDuration >= this.minSpeechMs && silenceDuration >= this.silenceToStopMs) {
      this.speaking = false;
      this.emit({ type: 'speech_stopped', timestampMs: frame.timestampMs });
      return;
    }

    if (speechDuration < this.minSpeechMs && silenceDuration >= this.silenceToStopMs) {
      this.speaking = false;
      this.emit({ type: 'silence', timestampMs: frame.timestampMs });
    }
  }

  reset(): void {
    this.speaking = false;
    this.speechStartMs = 0;
    this.lastSpeechMs = 0;
  }

  private emit(event: VadEvent): void {
    this.listeners.forEach((listener) => listener(event));
  }
}

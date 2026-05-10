import { PermissionsAndroid, Platform } from 'react-native';

type AudioFrame = {
  timestampMs: number;
  levelDb: number;
  isSpeechLikely: boolean;
};

type FrameListener = (frame: AudioFrame) => void;

class AudioCaptureService {
  private listeners = new Set<FrameListener>();
  private running = false;
  private timer: ReturnType<typeof setInterval> | null = null;
  private startedAt = 0;

  subscribeFrame(listener: FrameListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async start(): Promise<void> {
    if (this.running) return;
    if (Platform.OS === 'android') {
      const permission = PermissionsAndroid.PERMISSIONS.RECORD_AUDIO;
      const granted = await PermissionsAndroid.check(permission) ||
        (await PermissionsAndroid.request(permission)) === PermissionsAndroid.RESULTS.GRANTED;
      if (!granted) {
        throw new Error('Microphone permission is required for voice commands.');
      }
    }
    this.running = true;
    this.startedAt = Date.now();
    this.timer = setInterval(() => {
      const frame: AudioFrame = {
        timestampMs: Date.now(),
        levelDb: -60,
        isSpeechLikely: false
      };
      this.listeners.forEach((listener) => listener(frame));
    }, 30);
  }

  async stop(): Promise<{ uri?: string; durationMs: number } | null> {
    if (!this.running) return null;
    this.running = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    return { durationMs: Date.now() - this.startedAt };
  }
}

export type { AudioFrame };
export const audioCaptureService = new AudioCaptureService();

import { audioCaptureService } from './audioCaptureService';
import { buildAudioSegment } from './audioSegmentBuilder';
import { getGemmaAudioStatus, processAudioSegment } from './cactusGemmaAudioService';
import { getSelectedVoiceEngine, setSelectedVoiceEngine } from './voiceEngineSettings';
import { inferIntentFromTranscript } from './voiceCommandRouter';
import type { VoiceControllerSnapshot, VoiceEngine } from './voiceTypes';
import { checkModelStatus } from './whisperModelDownloadService';
import { transcribeAudioSegment } from './whisperTranscriptionService';
import { VadTurnDetector } from './vadTurnDetector';
import { listenWithWhisperOnce } from '../whisperVoiceService';

type Listener = (snapshot: VoiceControllerSnapshot) => void;

class VoiceCommandController {
  private snapshot: VoiceControllerSnapshot = {
    state: 'idle',
    engine: 'gemma_audio',
    engineStatus: 'not_available',
    lastTranscript: '',
    lastDetectedAction: '',
    lastConfidence: 0,
    lastLatencyMs: 0
  };
  private listeners = new Set<Listener>();
  private vad = new VadTurnDetector();
  private unsubFrame: (() => void) | null = null;
  private listeningStartedAt = 0;

  constructor() {
    void this.init();
    this.vad.subscribe((event) => {
      if (event.type === 'speech_started') {
        this.patch({ state: 'hearing_speech' });
      }
      if (event.type === 'speech_stopped') {
        void this.stopListening();
      }
    });
  }

  private async init(): Promise<void> {
    const engine = await getSelectedVoiceEngine();
    const whisper = await checkModelStatus();
    this.snapshot.engine = engine;
    this.snapshot.engineStatus = engine === 'gemma_audio' ? getGemmaAudioStatus() : whisper;
    this.emit();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.snapshot);
    return () => this.listeners.delete(listener);
  }

  getState(): VoiceControllerSnapshot {
    return this.snapshot;
  }

  async setVoiceEngine(engine: VoiceEngine): Promise<void> {
    await setSelectedVoiceEngine(engine);
    const whisper = await checkModelStatus();
    this.patch({
      engine,
      engineStatus: engine === 'gemma_audio' ? getGemmaAudioStatus() : whisper
    });
  }

  getVoiceEngine(): VoiceEngine {
    return this.snapshot.engine;
  }

  async startListening(): Promise<void> {
    this.listeningStartedAt = Date.now();
    this.patch({ state: 'listening', lastError: undefined });
    this.vad.reset();
    this.unsubFrame?.();
    this.unsubFrame = audioCaptureService.subscribeFrame((frame) => this.vad.onFrame(frame));
    await audioCaptureService.start();
  }

  async stopListening(context?: { currentScreen: string; currentLessonTitle?: string; currentPageNumber?: number }): Promise<void> {
    const stopped = await audioCaptureService.stop();
    this.unsubFrame?.();
    this.unsubFrame = null;
    const segment = buildAudioSegment({ uri: stopped?.uri, durationMs: stopped?.durationMs ?? 0 });
    if (!segment) {
      this.patch({ state: 'listening' });
      return;
    }

    const processStartedAt = Date.now();
    this.patch({ state: 'processing' });

    try {
      if (this.snapshot.engine === 'gemma_audio') {
        const result = await processAudioSegment(segment);
        this.patch({
          state: 'ready',
          engineStatus: getGemmaAudioStatus(),
          lastTranscript: result.transcript,
          lastDetectedAction: result.intent,
          lastConfidence: result.confidence,
          lastLatencyMs: Date.now() - this.listeningStartedAt
        });
        return;
      }

      const listen = await listenWithWhisperOnce(9000);
      if (!listen.ok || !listen.transcript?.trim()) {
        this.patch({ state: 'listening' });
        return;
      }
      const transcription = { transcript: listen.transcript };

      const result = await inferIntentFromTranscript(
        transcription.transcript,
        context?.currentScreen ?? 'home',
        context?.currentLessonTitle,
        context?.currentPageNumber
      );

      this.patch({
        state: 'ready',
        engineStatus: await checkModelStatus(),
        lastTranscript: result.transcript,
        lastDetectedAction: result.intent,
        lastConfidence: result.confidence,
        lastLatencyMs: Date.now() - this.listeningStartedAt
      });

      void processStartedAt;
    } catch (error) {
      this.patch({
        state: 'error',
        lastError: error instanceof Error ? error.message : 'Voice processing failed.',
        lastLatencyMs: Date.now() - this.listeningStartedAt
      });
    }
  }

  async cancel(): Promise<void> {
    await audioCaptureService.stop();
    this.unsubFrame?.();
    this.unsubFrame = null;
    this.patch({ state: 'idle' });
  }

  private patch(next: Partial<VoiceControllerSnapshot>): void {
    this.snapshot = { ...this.snapshot, ...next };
    this.emit();
  }

  private emit(): void {
    this.listeners.forEach((listener) => listener(this.snapshot));
  }
}

export const voiceCommandController = new VoiceCommandController();

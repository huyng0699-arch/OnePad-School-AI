import { audioCaptureService } from './audioCaptureService';
import { buildAudioSegment } from './audioSegmentBuilder';
import { getCloudAudioStatus } from './cloudAudioService';
import { getGemmaAudioStatus } from './cactusGemmaAudioService';
import { getSelectedVoiceEngine, setSelectedVoiceEngine } from './voiceEngineSettings';
import type { VoiceControllerSnapshot, VoiceEngine, VoiceTurnContext } from './voiceTypes';
import { checkModelStatus } from './whisperModelDownloadService';
import { VadTurnDetector } from './vadTurnDetector';
import { resolveVoiceCommand, understandVoiceTurn } from './voiceUnderstandingPipeline';

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
  private activeRunId = 0;

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
    this.snapshot.engineStatus = this.getEngineStatus(engine, whisper);
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
      engineStatus: this.getEngineStatus(engine, whisper)
    });
  }

  getVoiceEngine(): VoiceEngine {
    return this.snapshot.engine;
  }

  async startListening(context?: Partial<VoiceTurnContext>): Promise<void> {
    const runId = ++this.activeRunId;
    this.listeningStartedAt = Date.now();
    this.patch({ state: 'listening', lastError: undefined, lastTranscript: '', lastDetectedAction: '', lastConfidence: 0 });

    if (this.snapshot.engine === 'whisper_transcription') {
      await this.processVoiceTurn(runId, null, this.normalizeContext(context));
      return;
    }

    if (this.snapshot.engine === 'gemma_audio' && getGemmaAudioStatus() !== 'ready') {
      this.patch({ state: 'error', engineStatus: getGemmaAudioStatus(), lastError: 'Local AI audio understanding is not available in this build.' });
      return;
    }

    if (this.snapshot.engine === 'cloud_audio' && getCloudAudioStatus() !== 'ready') {
      this.patch({ state: 'error', engineStatus: getCloudAudioStatus(), lastError: 'Cloud audio understanding is not configured in this build.' });
      return;
    }

    this.vad.reset();
    this.unsubFrame?.();
    this.unsubFrame = audioCaptureService.subscribeFrame((frame) => this.vad.onFrame(frame));
    await audioCaptureService.start();
  }

  async stopListening(context?: Partial<VoiceTurnContext>): Promise<void> {
    if (this.snapshot.engine === 'whisper_transcription') {
      return;
    }

    const runId = ++this.activeRunId;
    const stopped = await audioCaptureService.stop();
    this.unsubFrame?.();
    this.unsubFrame = null;
    const segment = buildAudioSegment({ uri: stopped?.uri, durationMs: stopped?.durationMs ?? 0 });
    if (!segment) {
      this.patch({ state: 'listening' });
      return;
    }

    await this.processVoiceTurn(runId, segment, this.normalizeContext(context));
  }

  private async processVoiceTurn(runId: number, segment: ReturnType<typeof buildAudioSegment>, context: VoiceTurnContext): Promise<void> {
    try {
      this.patch({ state: this.snapshot.engine === 'whisper_transcription' ? 'transcribing' : 'processing' });
      const understanding = await understandVoiceTurn({
        engine: this.snapshot.engine,
        segment: segment ?? undefined,
        context
      });
      if (runId !== this.activeRunId) {
        return;
      }

      this.patch({ state: 'routing', lastTranscript: understanding.transcript });
      const result = await resolveVoiceCommand(understanding, context);
      if (runId !== this.activeRunId) {
        return;
      }

      this.patch({
        state: 'ready',
        engineStatus: this.getEngineStatus(this.snapshot.engine, await checkModelStatus()),
        lastTranscript: result.transcript,
        lastDetectedAction: result.intent,
        lastConfidence: result.confidence,
        lastLatencyMs: Date.now() - this.listeningStartedAt
      });
    } catch (error) {
      this.patch({
        state: 'error',
        lastError: error instanceof Error ? error.message : 'Voice processing failed.',
        lastLatencyMs: Date.now() - this.listeningStartedAt
      });
    }
  }

  async cancel(): Promise<void> {
    this.activeRunId += 1;
    await audioCaptureService.stop();
    this.unsubFrame?.();
    this.unsubFrame = null;
    this.patch({ state: 'idle' });
  }

  private normalizeContext(context?: Partial<VoiceTurnContext>): VoiceTurnContext {
    return {
      currentScreen: context?.currentScreen ?? 'home',
      currentLessonTitle: context?.currentLessonTitle,
      currentPageNumber: context?.currentPageNumber
    };
  }

  private getEngineStatus(engine: VoiceEngine, whisperStatus: VoiceControllerSnapshot['engineStatus']): VoiceControllerSnapshot['engineStatus'] {
    if (engine === 'gemma_audio') return getGemmaAudioStatus();
    if (engine === 'cloud_audio') return getCloudAudioStatus();
    return whisperStatus;
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

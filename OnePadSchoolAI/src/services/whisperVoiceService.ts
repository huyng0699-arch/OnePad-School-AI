import * as FileSystem from 'expo-file-system/legacy';
import * as Speech from 'expo-speech';
import { PermissionsAndroid, Platform } from 'react-native';
import { initWhisper, type TranscribeRealtimeEvent, type WhisperContext } from 'whisper.rn';

export type VoiceLanguage = {
  code: string;
  whisperCode: string;
  label: string;
  selected: boolean;
};

export type WhisperModelOption = {
  id: string;
  fileName: string;
  label: string;
  modelName: string;
  modelUrl: string;
  installed: boolean;
  selected: boolean;
  sizeMb: number;
  quality: string;
  minimumBytes: number;
};

export type VoiceBridgeStatus = {
  ok: boolean;
  ttsReady?: boolean;
  language?: string;
  sampleRate?: number;
  audioFormat?: string;
  modelName?: string;
  modelSource?: string;
  message?: string;
};

export type VoiceListenResult = {
  ok: boolean;
  transcript?: string;
  language?: string;
  sampleRate?: number;
  audioFormat?: string;
  code?: string;
  message?: string;
};

type VoiceEvent = { type?: string; text?: string; language?: string; modelId?: string; progress?: number };

type WhisperLanguageConfig = Omit<VoiceLanguage, 'selected'>;
type WhisperModelConfig = Omit<WhisperModelOption, 'installed' | 'selected'>;

const WHISPER_MODELS: WhisperModelConfig[] = [
  {
    id: 'tiny',
    fileName: 'ggml-tiny.bin',
    label: 'Tiny multilingual',
    modelName: 'Whisper ggml-tiny multilingual',
    modelUrl: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin',
    sizeMb: 75,
    minimumBytes: 70_000_000,
    quality: 'Lightest multilingual, fastest, lower accuracy'
  },
  {
    id: 'tiny-en',
    fileName: 'ggml-tiny.en.bin',
    label: 'Tiny English',
    modelName: 'Whisper ggml-tiny.en',
    modelUrl: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.en.bin',
    sizeMb: 75,
    minimumBytes: 70_000_000,
    quality: 'Lightest English-only model'
  },
  {
    id: 'base',
    fileName: 'ggml-base.bin',
    label: 'Base multilingual',
    modelName: 'Whisper ggml-base multilingual',
    modelUrl: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin',
    sizeMb: 148,
    minimumBytes: 140_000_000,
    quality: 'Balanced multilingual model'
  },
  {
    id: 'base-en',
    fileName: 'ggml-base.en.bin',
    label: 'Base English',
    modelName: 'Whisper ggml-base.en',
    modelUrl: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin',
    sizeMb: 148,
    minimumBytes: 140_000_000,
    quality: 'Balanced English-only model'
  },
  {
    id: 'small',
    fileName: 'ggml-small.bin',
    label: 'Small multilingual',
    modelName: 'Whisper ggml-small multilingual',
    modelUrl: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin',
    sizeMb: 465,
    minimumBytes: 450_000_000,
    quality: 'Higher accuracy, much larger download'
  }
];

const LANGUAGES: WhisperLanguageConfig[] = [
  { code: 'en-US', whisperCode: 'en', label: 'English' },
  { code: 'vi-VN', whisperCode: 'vi', label: 'Vietnamese' },
  { code: 'zh-CN', whisperCode: 'zh', label: 'Chinese' },
  { code: 'ja-JP', whisperCode: 'ja', label: 'Japanese' },
  { code: 'ko-KR', whisperCode: 'ko', label: 'Korean' },
  { code: 'fr-FR', whisperCode: 'fr', label: 'French' },
  { code: 'de-DE', whisperCode: 'de', label: 'German' },
  { code: 'es-ES', whisperCode: 'es', label: 'Spanish' },
  { code: 'pt-BR', whisperCode: 'pt', label: 'Portuguese' },
  { code: 'ru-RU', whisperCode: 'ru', label: 'Russian' },
  { code: 'th-TH', whisperCode: 'th', label: 'Thai' },
  { code: 'id-ID', whisperCode: 'id', label: 'Indonesian' }
];

const listeners = new Set<(event: VoiceEvent) => void>();
let selectedLanguage: VoiceLanguage['code'] = 'vi-VN';
let selectedModelId = 'tiny';
let whisperContext: WhisperContext | null = null;
let whisperContextModelId: string | null = null;
let downloadPromise: Promise<{ ok: boolean; message?: string }> | null = null;
let lastDownloadProgressPercent = -1;

export function subscribeVoiceEvents(handler: (event: VoiceEvent) => void): () => void {
  listeners.add(handler);
  return () => listeners.delete(handler);
}

export async function getWhisperStatus(): Promise<VoiceBridgeStatus> {
  const language = getSelectedLanguage();
  const model = getSelectedModel();
  if (Platform.OS !== 'android') {
    return { ok: false, ttsReady: true, language: language.code, message: 'Whisper voice-to-text is wired for Android.' };
  }
  const installed = await isWhisperModelInstalled(model);
  if (!installed) {
    return {
      ok: false,
      ttsReady: true,
      language: language.code,
      modelName: model.modelName,
      modelSource: model.modelUrl,
      message: `Selected ${model.label} is not installed. Download this Whisper model before listening.`
    };
  }
  if (!isLanguageCompatibleWithModel(language, model)) {
    return {
      ok: false,
      ttsReady: true,
      language: language.code,
      modelName: model.modelName,
      modelSource: await getWhisperModelPath(model),
      message: `${model.label} is English-only. Switch to a multilingual Whisper model for ${language.label}.`
    };
  }

  return {
    ok: true,
    ttsReady: true,
    language: language.code,
    sampleRate: 16000,
    audioFormat: 'Whisper realtime microphone input',
    modelName: model.modelName,
    modelSource: await getWhisperModelPath(model)
  };
}

export async function getWhisperLanguages(): Promise<VoiceLanguage[]> {
  return LANGUAGES.map((language) => ({
    ...language,
    selected: language.code === selectedLanguage
  }));
}

export async function getWhisperModels(): Promise<WhisperModelOption[]> {
  const installedPairs = await Promise.all(
    WHISPER_MODELS.map(async (model) => [model.id, await isWhisperModelInstalled(model)] as const)
  );
  const installedById = new Map(installedPairs);
  return WHISPER_MODELS.map((model) => ({
    ...model,
    installed: installedById.get(model.id) ?? false,
    selected: model.id === selectedModelId
  }));
}

export async function selectWhisperLanguage(languageCode: VoiceLanguage['code']): Promise<{ ok: boolean; language?: string; message?: string }> {
  const language = LANGUAGES.find((item) => item.code === languageCode);
  if (!language) {
    return { ok: false, message: 'Unsupported Whisper language.' };
  }
  selectedLanguage = languageCode;
  const model = getSelectedModel();
  if (!isLanguageCompatibleWithModel(language, model)) {
    return {
      ok: false,
      language: languageCode,
      message: `Selected ${language.label}, but current model is English-only. Choose Tiny/Base multilingual.`
    };
  }
  return { ok: true, language: languageCode, message: `Selected ${language.label}. No separate language pack is needed.` };
}

export async function selectWhisperModel(modelId: string): Promise<{ ok: boolean; modelId?: string; message?: string }> {
  const model = WHISPER_MODELS.find((item) => item.id === modelId);
  if (!model) {
    return { ok: false, message: 'Unsupported Whisper model.' };
  }
  selectedModelId = modelId;
  await releaseWhisperContext();
  const installed = await isWhisperModelInstalled(model);
  const language = getSelectedLanguage();
  if (!isLanguageCompatibleWithModel(language, model)) {
    return {
      ok: false,
      modelId,
      message: `Selected ${model.label}. This model is English-only, so please switch speech language to English or choose a multilingual model.`
    };
  }
  return {
    ok: installed,
    modelId,
    message: installed
      ? `Selected ${model.label}.`
      : `Selected ${model.label}. Download this ${model.sizeMb}MB model before listening.`
  };
}

export async function downloadWhisperModel(modelId = selectedModelId): Promise<{ ok: boolean; message?: string }> {
  if (downloadPromise) {
    return downloadPromise;
  }

  downloadPromise = (async () => {
    try {
      const model = WHISPER_MODELS.find((item) => item.id === modelId) ?? getSelectedModel();
      await ensureWhisperModelDirectory();
      const target = await getWhisperModelPath(model);
      const existing = await FileSystem.getInfoAsync(target);
      if (await isWhisperModelInstalled(model)) {
        emitVoiceEvent({ type: 'download', text: `${model.label} already installed.`, modelId: model.id, progress: 100 });
        return { ok: true, message: `${model.label} already installed.` };
      }
      if (existing.exists) {
        await FileSystem.deleteAsync(target, { idempotent: true });
      }

      emitVoiceEvent({ type: 'download', text: `Downloading ${model.label} (${model.sizeMb}MB)...`, modelId: model.id, progress: 0 });
      lastDownloadProgressPercent = -1;
      const download = FileSystem.createDownloadResumable(
        model.modelUrl,
        target,
        {},
        (progress) => {
          const total = progress.totalBytesExpectedToWrite || model.minimumBytes;
          const percent = Math.max(0, Math.min(100, Math.round((progress.totalBytesWritten / total) * 100)));
          const displayPercent = percent === 100 ? 100 : Math.floor(percent / 5) * 5;
          if (displayPercent !== lastDownloadProgressPercent) {
            lastDownloadProgressPercent = displayPercent;
            emitVoiceEvent({ type: 'download', text: `${model.label} download ${displayPercent}%`, modelId: model.id, progress: displayPercent });
          }
        }
      );
      await download.downloadAsync();
      const finishedFile = await FileSystem.getInfoAsync(target);
      if (!finishedFile.exists || (finishedFile.size ?? 0) <= model.minimumBytes) {
        return { ok: false, message: 'Whisper download finished but the model file is incomplete. Please try again.' };
      }
      await writeWhisperCompleteMarker(model, finishedFile.size ?? 0);
      if (selectedModelId === model.id) {
        await releaseWhisperContext();
      }
      emitVoiceEvent({ type: 'download', text: `${model.label} download 100%`, modelId: model.id, progress: 100 });
      return { ok: true, message: `${model.label} installed.` };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : 'Whisper model download failed.'
      };
    } finally {
      downloadPromise = null;
    }
  })();

  return downloadPromise;
}

export async function listenWithWhisperOnce(durationMs = 8500): Promise<VoiceListenResult> {
  if (Platform.OS !== 'android') {
    return { ok: false, code: 'android_only', message: 'Whisper microphone mode is currently wired for Android.' };
  }

  const granted = await ensureMicrophonePermission();
  if (!granted) {
    return { ok: false, code: 'record_audio_permission_denied', message: 'Microphone permission was denied.' };
  }

  const model = getSelectedModel();
  const installed = await isWhisperModelInstalled(model);
  if (!installed) {
    return { ok: false, code: 'whisper_model_missing', message: `Download ${model.label} before listening.` };
  }

  const language = getSelectedLanguage();
  if (!isLanguageCompatibleWithModel(language, model)) {
    return {
      ok: false,
      code: 'language_model_mismatch',
      message: `${model.label} is English-only. For ${language.label}, choose a multilingual Whisper model (tiny/base/small).`
    };
  }
  const context = await getWhisperContext();
  const listenSec = Math.max(6, Math.ceil(durationMs / 1000));
  let bestTranscript = '';
  let lastError = '';
  let settled = false;
  let safetyTimeout: ReturnType<typeof setTimeout> | null = null;

  return new Promise((resolve) => {
    const finish = (message?: string) => {
      if (settled) return;
      settled = true;
      if (safetyTimeout) {
        clearTimeout(safetyTimeout);
        safetyTimeout = null;
      }
      const transcript = cleanTranscript(bestTranscript);
      resolve({
        ok: Boolean(transcript),
        transcript,
        language: language.code,
        sampleRate: 16000,
        audioFormat: 'Whisper realtime microphone input',
        message: transcript ? `Whisper heard: ${transcript}` : message ?? lastError ?? 'Whisper did not hear a usable transcript.'
      });
    };

    emitVoiceEvent({
      type: 'status',
      text: `Recording with Whisper for ${listenSec}s, then processing on device. Hold the phone close and speak continuously...`,
      language: language.code,
      modelId: model.id
    });

    context.transcribeRealtime({
      language: language.whisperCode,
      realtimeAudioSec: listenSec,
      realtimeAudioSliceSec: listenSec,
      realtimeAudioMinSec: 1,
      maxThreads: 2,
      maxLen: 180,
      translate: false
    }).then(({ stop, subscribe }) => {
      subscribe((event: TranscribeRealtimeEvent) => {
        if (event.error) {
          lastError = event.error;
          emitVoiceEvent({ type: 'error', text: event.error, language: language.code });
        }
        const text = extractRealtimeTranscript(event, bestTranscript);
        if (text) {
          bestTranscript = text;
          emitVoiceEvent({ type: event.isCapturing ? 'partial' : 'final', text, language: language.code });
        }
        if (!event.isCapturing) {
          finish();
        }
      });

      safetyTimeout = setTimeout(() => {
        void stop()
          .catch((error) => {
            lastError = error instanceof Error ? error.message : 'Unable to stop Whisper recording.';
          })
          .finally(() => {
            finish(bestTranscript ? undefined : 'Whisper timed out before returning text. Speak 1 short sentence clearly and keep speaking until recording ends.');
          });
      }, (listenSec + 25) * 1000);
    }).catch((error) => {
      finish(error instanceof Error ? error.message : 'Unable to start Whisper.');
    });
  });
}

export async function speakWithAndroidTts(text: string): Promise<{ ok: boolean; message?: string }> {
  const trimmed = text.trim();
  if (!trimmed) {
    return { ok: false, message: 'No text to speak.' };
  }
  Speech.stop();
  Speech.speak(trimmed, {
    language: selectedLanguage,
    pitch: 1,
    rate: 0.95
  });
  return { ok: true };
}

export async function stopWhisperListening(): Promise<void> {
  // transcribeRealtime exposes stop per session. The app uses short one-shot sessions.
}

function getSelectedLanguage() {
  return LANGUAGES.find((language) => language.code === selectedLanguage) ?? LANGUAGES[0];
}

function getSelectedModel() {
  return WHISPER_MODELS.find((model) => model.id === selectedModelId) ?? WHISPER_MODELS[0];
}

async function getWhisperContext(): Promise<WhisperContext> {
  const model = getSelectedModel();
  if (whisperContext && whisperContextModelId === model.id) {
    return whisperContext;
  }
  await releaseWhisperContext();
  whisperContext = await initWhisper({ filePath: await getWhisperModelPath(model) });
  whisperContextModelId = model.id;
  return whisperContext;
}

async function releaseWhisperContext(): Promise<void> {
  if (!whisperContext) return;
  await whisperContext.release();
  whisperContext = null;
  whisperContextModelId = null;
}

async function isWhisperModelInstalled(model: WhisperModelConfig): Promise<boolean> {
  const info = await FileSystem.getInfoAsync(await getWhisperModelPath(model));
  const hasCompleteFile = info.exists && (info.size ?? 0) > model.minimumBytes;
  const markerPath = await getWhisperCompleteMarkerPath(model);
  if (!hasCompleteFile) {
    await FileSystem.deleteAsync(markerPath, { idempotent: true });
    return false;
  }
  const marker = await FileSystem.getInfoAsync(markerPath);
  if (!marker.exists) {
    await writeWhisperCompleteMarker(model, info.size ?? 0);
  }
  return true;
}

async function getWhisperModelPath(model: WhisperModelConfig): Promise<string> {
  await ensureWhisperModelDirectory();
  return `${getWhisperModelDirectory()}${model.fileName}`;
}

async function getWhisperCompleteMarkerPath(model: WhisperModelConfig): Promise<string> {
  await ensureWhisperModelDirectory();
  return `${getWhisperModelDirectory()}${model.fileName}.complete.json`;
}

async function writeWhisperCompleteMarker(model: WhisperModelConfig, size: number): Promise<void> {
  await FileSystem.writeAsStringAsync(
    await getWhisperCompleteMarkerPath(model),
    JSON.stringify({
      modelId: model.id,
      modelName: model.modelName,
      fileName: model.fileName,
      size,
      completedAt: new Date().toISOString()
    })
  );
}

async function ensureWhisperModelDirectory(): Promise<void> {
  const directory = getWhisperModelDirectory();
  const info = await FileSystem.getInfoAsync(directory);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  }
}

function getWhisperModelDirectory(): string {
  return `${FileSystem.documentDirectory ?? ''}whisper-models/`;
}

async function ensureMicrophonePermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false;
  }
  const permission = PermissionsAndroid.PERMISSIONS.RECORD_AUDIO;
  const current = await PermissionsAndroid.check(permission);
  if (current) {
    return true;
  }
  const result = await PermissionsAndroid.request(permission, {
    title: 'OnePad voice command',
    message: 'OnePad needs microphone access to turn your voice into text on this device.',
    buttonPositive: 'Allow',
    buttonNegative: 'Not now'
  });
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

function emitVoiceEvent(event: VoiceEvent): void {
  listeners.forEach((listener) => listener(event));
}

function cleanTranscript(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function isEnglishOnlyModel(model: WhisperModelConfig): boolean {
  return model.id.endsWith('-en') || model.fileName.endsWith('.en.bin');
}

function isLanguageCompatibleWithModel(language: WhisperLanguageConfig, model: WhisperModelConfig): boolean {
  if (!isEnglishOnlyModel(model)) {
    return true;
  }
  return language.whisperCode === 'en';
}

function extractRealtimeTranscript(event: TranscribeRealtimeEvent, fallback: string): string {
  const direct = cleanTranscript(event.data?.result ?? '');
  if (direct) {
    return direct;
  }

  const sliced = event.slices
    ?.map((slice) => cleanTranscript(slice.data?.result ?? ''))
    .filter(Boolean)
    .join(' ');

  return cleanTranscript(sliced || fallback);
}

import { initWhisper, type WhisperContext } from 'whisper.rn';
import { getWhisperModels } from '../whisperVoiceService';
import { checkModelStatus } from './whisperModelDownloadService';
import type { AudioSegment } from './voiceTypes';

let context: WhisperContext | null = null;
let contextKey: string | null = null;

async function getSelectedModelPath(): Promise<{ modelId: string; path: string }> {
  const models = await getWhisperModels();
  const selected = models.find((model) => model.selected) ?? models[0];
  const fileSystem = await import('expo-file-system/legacy');
  const path = `${fileSystem.documentDirectory ?? ''}whisper-models/${selected.fileName}`;
  return { modelId: selected.id, path };
}

async function ensureContext(path: string): Promise<WhisperContext> {
  if (context && contextKey === path) return context;
  if (context) {
    await context.release();
    context = null;
    contextKey = null;
  }
  context = await initWhisper({ filePath: path });
  contextKey = path;
  return context;
}

export async function transcribeAudioSegment(segment: AudioSegment): Promise<{ transcript: string; confidence?: number; latencyMs: number; modelId: string }> {
  const status = await checkModelStatus();
  if (status !== 'ready') {
    throw new Error('Whisper model is not downloaded.');
  }
  if (!segment.wavPath) {
    throw new Error('No audio segment path was provided.');
  }

  const start = Date.now();
  const model = await getSelectedModelPath();
  const ctx = await ensureContext(model.path);
  const anyCtx = ctx as unknown as { transcribe: (path: string, options?: Record<string, unknown>) => Promise<{ result: string }> };
  const output = await anyCtx.transcribe(segment.wavPath, { language: 'auto', maxLen: 200 });
  const transcript = (output?.result ?? '').trim();

  return {
    transcript,
    latencyMs: Date.now() - start,
    modelId: model.modelId
  };
}

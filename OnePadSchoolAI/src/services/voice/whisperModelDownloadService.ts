import * as FileSystem from 'expo-file-system/legacy';
import { downloadWhisperModel, getWhisperModels, subscribeVoiceEvents } from '../whisperVoiceService';
import type { WhisperModelStatus } from './voiceTypes';

type ProgressListener = (progress: number) => void;

let currentStatus: WhisperModelStatus = 'not_downloaded';
const listeners = new Set<ProgressListener>();

export async function checkModelStatus(): Promise<WhisperModelStatus> {
  const models = await getWhisperModels();
  const installed = models.some((item) => item.selected && item.installed);
  currentStatus = installed ? 'ready' : currentStatus === 'downloading' ? 'downloading' : 'not_downloaded';
  return currentStatus;
}

export async function downloadModel(): Promise<{ ok: boolean; message?: string }> {
  currentStatus = 'downloading';
  const result = await downloadWhisperModel();
  currentStatus = result.ok ? 'ready' : 'error';
  return result;
}

export async function deleteModel(): Promise<void> {
  const root = `${FileSystem.documentDirectory ?? ''}whisper-models/`;
  await FileSystem.deleteAsync(root, { idempotent: true });
  currentStatus = 'not_downloaded';
}

export async function getStorageUsed(): Promise<number> {
  const root = `${FileSystem.documentDirectory ?? ''}whisper-models/`;
  const info = await FileSystem.getInfoAsync(root);
  if (!info.exists) return 0;
  const files = await FileSystem.readDirectoryAsync(root);
  let total = 0;
  for (const f of files) {
    const fileInfo = await FileSystem.getInfoAsync(`${root}${f}`);
    total += fileInfo.exists ? fileInfo.size ?? 0 : 0;
  }
  return total;
}

export function subscribeDownloadProgress(listener: ProgressListener): () => void {
  listeners.add(listener);
  const unsubscribe = subscribeVoiceEvents((event) => {
    if (event.type === 'download' && typeof event.progress === 'number') {
      listener(event.progress);
    }
  });
  return () => {
    listeners.delete(listener);
    unsubscribe();
  };
}

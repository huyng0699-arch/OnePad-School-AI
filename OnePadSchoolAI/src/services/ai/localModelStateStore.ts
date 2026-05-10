import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LocalModelQuantization } from './localModelConfig';

const LOCAL_MODEL_STATE_PREFIX = 'localModelState';
const LOCAL_MODEL_SELECTED_KEY = 'localModel:selectedModelId';

export type LocalModelDownloadStatus =
  | 'not_started'
  | 'downloading'
  | 'paused'
  | 'failed'
  | 'downloaded'
  | 'loaded'
  | 'ready';

export type LocalModelPersistentState = {
  modelId: string;
  registryKey: string;
  quantization: LocalModelQuantization;
  sourceType: 'cactus_registry' | 'remote_url' | 'local_path';
  sourceUrl?: string;
  localPath?: string;
  downloadedBytes?: number;
  totalBytes?: number;
  progress?: number;
  status: LocalModelDownloadStatus;
  lastError?: string;
  lastUpdatedAt: string;
};

function modelStateKey(modelId: string, quantization: LocalModelQuantization): string {
  return `${LOCAL_MODEL_STATE_PREFIX}:${modelId}:${quantization}`;
}

export async function getModelState(
  modelId: string,
  quantization: LocalModelQuantization
): Promise<LocalModelPersistentState | null> {
  try {
    const raw = await AsyncStorage.getItem(modelStateKey(modelId, quantization));
    if (!raw) return null;
    return JSON.parse(raw) as LocalModelPersistentState;
  } catch {
    return null;
  }
}

export async function saveModelState(state: LocalModelPersistentState): Promise<void> {
  await AsyncStorage.setItem(
    modelStateKey(state.modelId, state.quantization),
    JSON.stringify(state)
  );
}

export async function updateModelState(
  modelId: string,
  quantization: LocalModelQuantization,
  patch: Partial<LocalModelPersistentState>
): Promise<LocalModelPersistentState> {
  const previous = await getModelState(modelId, quantization);
  const next: LocalModelPersistentState = {
    modelId,
    registryKey: patch.registryKey ?? previous?.registryKey ?? modelId,
    quantization,
    sourceType: patch.sourceType ?? previous?.sourceType ?? 'cactus_registry',
    sourceUrl: patch.sourceUrl ?? previous?.sourceUrl,
    localPath: patch.localPath ?? previous?.localPath,
    downloadedBytes: patch.downloadedBytes ?? previous?.downloadedBytes,
    totalBytes: patch.totalBytes ?? previous?.totalBytes,
    progress: patch.progress ?? previous?.progress,
    status: patch.status ?? previous?.status ?? 'not_started',
    lastError: patch.lastError ?? previous?.lastError,
    lastUpdatedAt: new Date().toISOString()
  };
  await saveModelState(next);
  return next;
}

export async function clearModelState(
  modelId: string,
  quantization: LocalModelQuantization
): Promise<void> {
  await AsyncStorage.removeItem(modelStateKey(modelId, quantization));
}

export async function getAllLocalModelStates(): Promise<LocalModelPersistentState[]> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const targetKeys = keys.filter((key) => key.startsWith(`${LOCAL_MODEL_STATE_PREFIX}:`));
    if (!targetKeys.length) return [];
    const rows = await AsyncStorage.multiGet(targetKeys);
    return rows
      .map(([, raw]) => {
        if (!raw) return null;
        try {
          return JSON.parse(raw) as LocalModelPersistentState;
        } catch {
          return null;
        }
      })
      .filter((item): item is LocalModelPersistentState => item != null);
  } catch {
    return [];
  }
}

export async function getSelectedLocalModelId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(LOCAL_MODEL_SELECTED_KEY);
  } catch {
    return null;
  }
}

export async function setSelectedLocalModelId(modelId: string): Promise<void> {
  await AsyncStorage.setItem(LOCAL_MODEL_SELECTED_KEY, modelId);
}


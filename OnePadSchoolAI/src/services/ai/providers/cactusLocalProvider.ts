import type { AiProvider, AiRequest, AiResult } from '../aiTypes';
import type {
  CactusLM as CactusLMType,
  CactusLMCompleteResult as CactusLMCompleteResultType
} from 'cactus-react-native';
import type { LocalModelConfig } from '../localModelConfig';
import { DEFAULT_LOCAL_MODEL_ID } from '../localModelConfig';
import {
  updateModelState
} from '../localModelStateStore';

// NOTE: cactus-react-native does not export CactusFileSystem from the package root.
// This internal path is used by cactus-react-native hooks as well.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cactusNative: any = require('cactus-react-native/lib/module/native');

type CactusStatus =
  | 'not_initialized'
  | 'initializing'
  | 'initialized'
  | 'model_source_missing'
  | 'downloading'
  | 'loading'
  | 'ready'
  | 'error';

type CactusState = {
  isInitialized: boolean;
  isModelLoaded: boolean;
  modelId: string;
  modelPath: string;
  status: CactusStatus;
  lastError: string | null;
  downloadProgress: number | null;
  activeSourceType: string | null;
  activeSourceValue: string | null;
  selectedModelId: string | null;
};

type SourceResolution =
  | { ok: true; modelKey: string; sourceType: 'cactus_registry' | 'local_path'; sourceValue: string }
  | { ok: false; error: string };

type LmCache = {
  key: string;
  quantization: 'int4' | 'int8';
  lm: CactusLMType;
};

const state: CactusState = {
  isInitialized: false,
  isModelLoaded: false,
  modelId: '',
  modelPath: '',
  status: 'not_initialized',
  lastError: null,
  downloadProgress: null,
  activeSourceType: null,
  activeSourceValue: null,
  selectedModelId: null
};

let cactusCache: LmCache | null = null;
let readyModelKey: string | null = null;
let warmupPromise: Promise<AiResult> | null = null;
let generationQueue: Promise<void> = Promise.resolve();
let activeLm: CactusLMType | null = null;
let latestRequestId = 0;
let activeGenerationRequestId: number | null = null;

function setError(message: string) {
  state.status = 'error';
  state.lastError = message;
}

function isModelPath(model: string): boolean {
  return model.startsWith('file://') || model.startsWith('/');
}

function resetModelRuntimeState() {
  state.isModelLoaded = false;
  state.modelPath = '';
  state.downloadProgress = null;
  readyModelKey = null;
}

async function getManualLocalSource(): Promise<{ localPath: string; remoteUrl: string }> {
  const svc = await import('../localAiSourceService');
  return svc.getManualLocalAiSource();
}

async function resolveSource(selectedModel: LocalModelConfig): Promise<SourceResolution> {
  const manual = await getManualLocalSource();
  const localPath = (manual.localPath ?? '').trim();
  const manualUrl = (manual.remoteUrl ?? '').trim();

  if (localPath) {
    return {
      ok: true,
      modelKey: localPath,
      sourceType: 'local_path',
      sourceValue: localPath
    };
  }

  if (manualUrl) {
    return {
      ok: false,
      error: 'CactusLM download does not accept direct remote URL as model source. Use registry model key or localPath.'
    };
  }

  const registryKey = (selectedModel.registryKey ?? '').trim();
  if (!registryKey) {
    return {
      ok: false,
      error: 'Gemma local model source is not configured for this model.'
    };
  }

  return {
    ok: true,
    modelKey: registryKey,
    sourceType: 'cactus_registry',
    sourceValue: registryKey
  };
}

async function getCactusLM(selectedModel: LocalModelConfig): Promise<CactusLMType> {
  const source = await resolveSource(selectedModel);
  if (!source.ok) {
    throw new Error(source.error);
  }

  state.activeSourceType = source.sourceType;
  state.activeSourceValue = source.sourceValue;
  state.modelId = source.modelKey;
  state.selectedModelId = selectedModel.id;

  const cacheKey = `${source.modelKey}:${selectedModel.quantization}`;
  if (cactusCache && cactusCache.key === cacheKey) {
    return cactusCache.lm;
  }

  const mod = await import('cactus-react-native');
  const CactusLM = mod.CactusLM as unknown as new (...args: any[]) => CactusLMType;
  const lm = new CactusLM({
    model: source.modelKey,
    options: { quantization: selectedModel.quantization }
  });

  cactusCache = {
    key: cacheKey,
    quantization: selectedModel.quantization,
    lm
  };
  activeLm = lm;

  resetModelRuntimeState();
  return lm;
}

async function isDownloaded(lm: CactusLMType, selectedModel: LocalModelConfig): Promise<boolean> {
  if (isModelPath(state.modelId)) return true;
  const CactusFileSystem = cactusNative?.CactusFileSystem;
  if (!CactusFileSystem?.modelExists) return false;
  const modelName = lm.getModelName();
  const exists = Boolean(await CactusFileSystem.modelExists(modelName));
  if (exists) {
    await updateModelState(selectedModel.id, selectedModel.quantization, {
      registryKey: selectedModel.registryKey,
      sourceType: 'cactus_registry',
      progress: 1,
      status: 'downloaded',
      lastError: undefined
    });
  }
  return exists;
}

export async function initializeCactus(selectedModel: LocalModelConfig): Promise<AiResult> {
  if (!selectedModel.enabled) {
    state.status = 'model_source_missing';
    state.lastError = selectedModel.unavailableReason ?? 'Selected model is unavailable.';
    return { ok: false, error: state.lastError, raw: getCactusStatus() };
  }

  try {
    state.lastError = null;
    state.status = 'initializing';
    await getCactusLM(selectedModel);
    state.isInitialized = true;
    state.status = state.isModelLoaded ? 'ready' : 'initialized';
    await updateModelState(selectedModel.id, selectedModel.quantization, {
      registryKey: selectedModel.registryKey,
      sourceType: 'cactus_registry',
      status: 'not_started',
      lastError: undefined
    });
    return { ok: true, text: 'cactus_initialized', raw: getCactusStatus() };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to initialize Cactus runtime.';
    setError(message);
    await updateModelState(selectedModel.id, selectedModel.quantization, {
      registryKey: selectedModel.registryKey,
      sourceType: 'cactus_registry',
      status: 'failed',
      lastError: message
    });
    return { ok: false, error: message, raw: getCactusStatus() };
  }
}

export async function downloadSelectedLocalModel(selectedModel: LocalModelConfig): Promise<AiResult> {
  if (!selectedModel.enabled) {
    state.status = 'model_source_missing';
    state.lastError = selectedModel.unavailableReason ?? 'Selected model is unavailable.';
    return { ok: false, error: state.lastError, raw: getCactusStatus() };
  }
  if (!state.isInitialized) {
    return { ok: false, error: 'Cactus runtime is not initialized.', raw: getCactusStatus() };
  }

  try {
    const lm = await getCactusLM(selectedModel);
    const alreadyDownloaded = await isDownloaded(lm, selectedModel);
    if (alreadyDownloaded) {
      state.downloadProgress = 1;
      state.status = state.isModelLoaded ? 'ready' : 'initialized';
      await updateModelState(selectedModel.id, selectedModel.quantization, {
        registryKey: selectedModel.registryKey,
        sourceType: isModelPath(state.modelId) ? 'local_path' : 'cactus_registry',
        progress: 1,
        status: state.isModelLoaded ? 'ready' : 'downloaded',
        lastError: undefined
      });
      return {
        ok: true,
        text: state.isModelLoaded ? 'model_already_loaded' : 'model_already_downloaded',
        raw: getCactusStatus()
      };
    }

    state.status = 'downloading';
    state.lastError = null;
    state.downloadProgress = 0;
    await updateModelState(selectedModel.id, selectedModel.quantization, {
      registryKey: selectedModel.registryKey,
      sourceType: isModelPath(state.modelId) ? 'local_path' : 'cactus_registry',
      progress: 0,
      status: 'downloading',
      lastError: undefined
    });

    await lm.download({
      onProgress: (progress) => {
        const normalized = Math.max(0, Math.min(1, progress));
        state.downloadProgress = normalized;
        void updateModelState(selectedModel.id, selectedModel.quantization, {
          registryKey: selectedModel.registryKey,
          sourceType: isModelPath(state.modelId) ? 'local_path' : 'cactus_registry',
          progress: normalized,
          status: 'downloading',
          lastError: undefined
        });
      }
    });

    state.downloadProgress = 1;
    const exists = await isDownloaded(lm, selectedModel);
    if (!exists) {
      const msg = 'Download finished but model is still not available on device.';
      setError(msg);
      await updateModelState(selectedModel.id, selectedModel.quantization, {
        registryKey: selectedModel.registryKey,
        sourceType: 'cactus_registry',
        status: 'failed',
        progress: state.downloadProgress ?? 0,
        lastError: msg
      });
      return { ok: false, error: msg, raw: getCactusStatus() };
    }

    state.status = 'initialized';
    await updateModelState(selectedModel.id, selectedModel.quantization, {
      registryKey: selectedModel.registryKey,
      sourceType: isModelPath(state.modelId) ? 'local_path' : 'cactus_registry',
      progress: 1,
      status: 'downloaded',
      lastError: undefined
    });
    return { ok: true, text: 'download_ok', raw: getCactusStatus() };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to download selected local model.';
    const lower = message.toLowerCase();
    if (lower.includes('404') || lower.includes('not found') || lower.includes('specified options not found')) {
      state.status = 'model_source_missing';
      state.lastError = `Cactus React Native registry did not provide an artifact for ${selectedModel.registryKey} (${selectedModel.quantization}).`;
    } else if (lower.includes('unzip')) {
      setError('Failed to unzip local model artifact.');
    } else if (lower.includes('download failed')) {
      setError('Failed to download local model artifact.');
    } else {
      setError(message);
    }

    await updateModelState(selectedModel.id, selectedModel.quantization, {
      registryKey: selectedModel.registryKey,
      sourceType: isModelPath(state.modelId) ? 'local_path' : 'cactus_registry',
      status: 'failed',
      progress: state.downloadProgress ?? 0,
      lastError: state.lastError ?? message
    });
    return { ok: false, error: state.lastError ?? message, raw: getCactusStatus() };
  }
}

export async function loadSelectedLocalModel(selectedModel: LocalModelConfig): Promise<AiResult> {
  if (!selectedModel.enabled) {
    state.status = 'model_source_missing';
    state.lastError = selectedModel.unavailableReason ?? 'Selected model is unavailable.';
    return { ok: false, error: state.lastError, raw: getCactusStatus() };
  }
  if (!state.isInitialized) {
    return { ok: false, error: 'Cactus runtime is not initialized.', raw: getCactusStatus() };
  }

  try {
    state.lastError = null;
    state.status = 'loading';
    const lm = await getCactusLM(selectedModel);
    const exists = await isDownloaded(lm, selectedModel);
    if (!exists) {
      state.status = 'initialized';
      const msg = 'Selected local model is not downloaded yet.';
      await updateModelState(selectedModel.id, selectedModel.quantization, {
        registryKey: selectedModel.registryKey,
        sourceType: isModelPath(state.modelId) ? 'local_path' : 'cactus_registry',
        status: 'not_started',
        lastError: msg
      });
      return { ok: false, error: msg, raw: getCactusStatus() };
    }

    await lm.init();
    state.isModelLoaded = true;
    state.status = 'ready';
    readyModelKey = `${selectedModel.id}:${selectedModel.quantization}`;
    await updateModelState(selectedModel.id, selectedModel.quantization, {
      registryKey: selectedModel.registryKey,
      sourceType: isModelPath(state.modelId) ? 'local_path' : 'cactus_registry',
      status: 'ready',
      progress: 1,
      lastError: undefined
    });
    return { ok: true, text: 'load_ok', raw: getCactusStatus() };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load selected local model.';
    setError(message);
    await updateModelState(selectedModel.id, selectedModel.quantization, {
      registryKey: selectedModel.registryKey,
      sourceType: isModelPath(state.modelId) ? 'local_path' : 'cactus_registry',
      status: 'failed',
      lastError: message
    });
    return { ok: false, error: message, raw: getCactusStatus() };
  }
}

export async function generateWithCactus(request: AiRequest, selectedModel: LocalModelConfig): Promise<AiResult> {
  if (!state.isInitialized) {
    return { ok: false, error: 'Cactus runtime is not initialized.', raw: getCactusStatus() };
  }
  if (state.status !== 'ready' || !state.isModelLoaded) {
    return { ok: false, error: 'Selected local model is not ready.', raw: getCactusStatus() };
  }

  let onAbort: (() => Promise<void>) | null = null;
  try {
    if (request.signal?.aborted) {
      return { ok: false, error: 'request_superseded' };
    }
    state.lastError = null;
    const lm = await getCactusLM(selectedModel);
    const boundedPrompt = request.prompt.length > 2400
      ? request.prompt.slice(-2400)
      : request.prompt;
    onAbort = async () => {
      try {
        await (lm as unknown as { stop?: () => Promise<void> }).stop?.();
      } catch {
        // ignore stop errors when aborting superseded request
      }
    };
    request.signal?.addEventListener('abort', onAbort, { once: true });
    const runCompletion = async () =>
      (await lm.complete({
        messages: [{ role: 'user', content: boundedPrompt }],
        options: {
          temperature: 0.2,
          maxTokens: 180,
          stopSequences: ['<|im_end|>', '<end_of_turn>']
        },
        onToken: (token) => {
          if (request.signal?.aborted) {
            return;
          }
          request.onToken?.(token);
        }
      })) as unknown as CactusLMCompleteResultType;

    let result: CactusLMCompleteResultType;
    try {
      result = await runCompletion();
    } catch (error) {
      const message = error instanceof Error ? error.message.toLowerCase() : '';
      if (message.includes('already in progress') || message.includes('is generating')) {
        await new Promise((resolve) => setTimeout(resolve, 80));
        result = await runCompletion();
      } else {
        throw error;
      }
    }

    if (request.signal?.aborted) {
      return { ok: false, error: 'request_superseded' };
    }

    if (!result?.success || !result.response) {
      return { ok: false, error: 'Cactus returned an empty response.', raw: result };
    }

    return { ok: true, text: result.response, raw: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Cactus generation failed.';
    if (request.signal?.aborted || message.toLowerCase().includes('aborted')) {
      return { ok: false, error: 'request_superseded' };
    }
    setError(message);
    return { ok: false, error: message, raw: getCactusStatus() };
  } finally {
    if (onAbort) {
      request.signal?.removeEventListener('abort', onAbort);
    }
  }
}

export function getCactusStatus(): CactusState {
  return { ...state };
}

function withGenerationQueue<T>(task: () => Promise<T>): Promise<T> {
  const run = generationQueue.then(task, task);
  generationQueue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function resolveSelectedEnabledModel(): Promise<LocalModelConfig | null> {
  const registryService = await import('../localModelRegistryService');
  const stateStore = await import('../localModelStateStore');
  const configs = await registryService.getLocalModelConfigs();
  const storedSelected = await stateStore.getSelectedLocalModelId();
  return (
    configs.find((item) => item.id === storedSelected && item.enabled) ??
    configs.find((item) => item.id === DEFAULT_LOCAL_MODEL_ID && item.enabled) ??
    configs.find((item) => item.enabled) ??
    null
  );
}

async function ensureModelReady(selectedModel: LocalModelConfig): Promise<AiResult> {
  const modelKey = `${selectedModel.id}:${selectedModel.quantization}`;
  if (state.status === 'ready' && state.isModelLoaded && readyModelKey === modelKey) {
    return { ok: true, text: 'local_model_ready' };
  }

  if (warmupPromise) {
    return warmupPromise;
  }

  warmupPromise = (async () => {
    if (!state.isInitialized || state.selectedModelId !== selectedModel.id) {
      const init = await initializeCactus(selectedModel);
      if (!init.ok) {
        return init;
      }
    }

    if (!state.isModelLoaded || state.status !== 'ready' || state.selectedModelId !== selectedModel.id) {
      const load = await loadSelectedLocalModel(selectedModel);
      if (!load.ok) {
        return load;
      }
    }

    return { ok: true, text: 'local_model_ready' } as AiResult;
  })();

  try {
    return await warmupPromise;
  } finally {
    warmupPromise = null;
  }
}

class CactusLocalProvider implements AiProvider {
  async generate(request: AiRequest): Promise<AiResult> {
    const requestId = ++latestRequestId;

    if (activeLm && state.status === 'ready' && activeGenerationRequestId != null) {
      try {
        await (activeLm as unknown as { stop?: () => Promise<void> }).stop?.();
      } catch {
        // ignore stop errors; best effort to prevent long-running previous generation
      }
    }

    const selectedModel = await resolveSelectedEnabledModel();

    if (!selectedModel) {
      return { ok: false, error: 'No enabled local model is configured in Settings.' };
    }

    const ready = await ensureModelReady(selectedModel);
    if (!ready.ok) {
      return ready;
    }

    return withGenerationQueue(async () => {
      if (requestId !== latestRequestId) {
        return { ok: false, error: 'request_superseded' };
      }

      activeGenerationRequestId = requestId;
      try {
        return await generateWithCactus(request, selectedModel);
      } finally {
        if (activeGenerationRequestId === requestId) {
          activeGenerationRequestId = null;
        }
      }
    });
  }
}

export const cactusLocalProvider: AiProvider = new CactusLocalProvider();

export async function stopActiveCactusGeneration(): Promise<void> {
  if (!activeLm) return;
  try {
    await (activeLm as unknown as { stop?: () => Promise<void> }).stop?.();
  } catch {
    // noop
  }
}

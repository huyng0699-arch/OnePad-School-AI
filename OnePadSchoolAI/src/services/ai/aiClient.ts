import {
  DEV_GEMINI_KEY_MISSING_MESSAGE,
  LOCAL_AI_ENDPOINT_MISSING_MESSAGE,
  getAiConfig
} from './aiConfig';
import type { AiProvider, AiRequest, AiResult } from './aiTypes';
import { geminiCloudProvider } from './providers/geminiCloudProvider';
import { localAiProvider } from './providers/localAiProvider';
import { cactusLocalProvider } from './providers/cactusLocalProvider';
import { getActiveAiProvider, getActiveGeminiModel, getCloudFallbackOnLocalFail } from '../aiSettingsService';
import { studentEventCollector } from '../sync/studentEventCollector';

let activeRequestController: AbortController | null = null;
let activeRequestId = 0;

function getProvider(): AiProvider {
  const provider = getActiveAiProvider();
  if (provider === 'local_server') {
    return localAiProvider;
  }
  if (provider === 'cactus' || provider === 'local_ai') {
    return cactusLocalProvider;
  }
  return geminiCloudProvider;
}

export async function generateAiResponse(request: AiRequest): Promise<AiResult> {
  activeRequestController?.abort('superseded');
  const requestController = new AbortController();
  activeRequestController = requestController;
  const currentRequestId = ++activeRequestId;

  const startedAt = Date.now();
  if (__DEV__) {
    console.log('[AI] request meta', {
      action: request.action,
      contextMode: request.contextMode ?? 'unset',
      contextLength: request.contextText.length,
      promptLength: request.prompt.length
    });
  }
  const providerMode = getActiveAiProvider();
  const provider = getProvider();
  if ((providerMode === 'cactus' || providerMode === 'local_ai') && currentRequestId > 1) {
    const cactus = await import('./providers/cactusLocalProvider');
    await cactus.stopActiveCactusGeneration();
  }

  const result = await provider.generate({
    ...request,
    signal: requestController.signal
  }).catch((error) => {
    const message = error instanceof Error ? error.message : 'AI request failed.';
    return { ok: false, error: message } as AiResult;
  });
  if (currentRequestId !== activeRequestId || requestController.signal.aborted) {
    return { ok: false, error: 'request_superseded' };
  }
  const baseMeta = {
    action: request.action,
    modelId: providerMode === 'gemini' ? getActiveGeminiModel() : 'local_model',
    quantization: providerMode === 'gemini' ? undefined : 'q4',
    latencyMs: Date.now() - startedAt
  };
  const isSuperseded = !result.ok && result.error === 'request_superseded';
  if (!isSuperseded && (providerMode === 'cactus' || providerMode === 'local_ai' || providerMode === 'local_server')) {
    void studentEventCollector.recordLocalAiUsed({ ...baseMeta, provider: providerMode, status: result.ok ? 'success' : 'error' });
  } else if (!isSuperseded) {
    void studentEventCollector.recordCloudAiUsed({ ...baseMeta, provider: providerMode, status: result.ok ? 'success' : 'error' });
  }

  if (
    (providerMode === 'cactus' || providerMode === 'local_ai') &&
    !result.ok &&
    result.error !== 'request_superseded' &&
    getCloudFallbackOnLocalFail()
  ) {
    const cloud = await geminiCloudProvider.generate(request);
    void studentEventCollector.recordCloudAiUsed({
      ...baseMeta,
      provider: 'gemini_fallback',
      modelId: getActiveGeminiModel(),
      status: cloud.ok ? 'success' : 'error',
      fallback: true
    });
    if (cloud.ok) {
      return {
        ok: true,
        text: `Cloud fallback used because Local AI failed.\n\n${cloud.text}`,
        raw: {
          localError: result,
          cloud
        }
      };
    }
    return { ok: false, error: `Local AI failed: ${result.error}. Cloud fallback also failed: ${cloud.error}`, raw: { local: result, cloud } };
  }

  return result;
}

export async function testAiConnection(): Promise<AiResult> {
  const config = getAiConfig();
  const provider = getActiveAiProvider();
  if (provider === 'gemini' && !config.devGeminiApiKey) {
    return { ok: false, error: DEV_GEMINI_KEY_MISSING_MESSAGE };
  }
  if (provider === 'local_server' && !config.localAiEndpoint) {
    return { ok: false, error: LOCAL_AI_ENDPOINT_MISSING_MESSAGE };
  }
  if ((provider === 'cactus' || provider === 'local_ai')) {
    return { ok: true, text: 'local_ai_ready_for_init' };
  }

  return generateAiResponse({
    action: 'chat',
    contextMode: 'general',
    prompt: 'Reply with: connection_ok',
    contextText: 'connection_test'
  });
}

export function getActiveAiRuntime() {
  return {
    provider: getActiveAiProvider(),
    model: getActiveGeminiModel()
  };
}

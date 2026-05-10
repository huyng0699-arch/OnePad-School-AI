export type AiProviderMode = 'gemini' | 'local_server' | 'cactus' | 'local_ai';
export type AiKnowledgeScope = 'lesson_only' | 'general_tutor' | 'web_grounded';

export type AiRuntimeSettings = {
  provider: AiProviderMode;
  cloudModel: string;
  knowledgeScope: AiKnowledgeScope;
  cloudFallbackOnLocalFail: boolean;
};

const ALLOWED_CLOUD_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-3-flash',
  'gemini-3.1-flash-lite',
  'gemma-3-2b-it',
  'gemma-3-4b-it',
  'gemma-3-12b-it',
  'gemma-4-26b-it',
  'gemma-4-31b-it'
] as const;
type AllowedCloudModel = (typeof ALLOWED_CLOUD_MODELS)[number];

let runtimeSettings: AiRuntimeSettings = {
  provider: (process.env.EXPO_PUBLIC_AI_PROVIDER as AiProviderMode | undefined) ?? 'cactus',
  cloudModel: (process.env.EXPO_PUBLIC_DEV_GEMINI_MODEL as AllowedCloudModel | undefined) ?? 'gemini-2.5-flash',
  knowledgeScope: 'general_tutor',
  cloudFallbackOnLocalFail: true
};

export function getAiSettings(): AiRuntimeSettings {
  return { ...runtimeSettings };
}

export function getActiveAiProvider(): AiProviderMode {
  return runtimeSettings.provider;
}

export function getActiveGeminiModel(): string {
  return runtimeSettings.cloudModel || 'gemini-2.5-flash';
}

export function getActiveKnowledgeScope(): AiKnowledgeScope {
  return runtimeSettings.knowledgeScope;
}

export function setAiProvider(provider: AiProviderMode): { ok: boolean; message: string } {
  if ((provider === 'local_server' || provider === 'cactus' || provider === 'local_ai') && !isLocalAiAvailable()) {
    runtimeSettings = { ...runtimeSettings, provider: 'gemini' };
    return {
      ok: false,
      message: 'Local AI is not available in this demo build. Cloud AI will remain active.'
    };
  }
  runtimeSettings = { ...runtimeSettings, provider };
  return { ok: true, message: `AI provider set to ${provider}.` };
}

export function setCloudModel(model: string): { ok: boolean; message: string } {
  const normalized = ALLOWED_CLOUD_MODELS.includes(model as AllowedCloudModel)
    ? (model as AllowedCloudModel)
    : 'gemini-2.5-flash';
  runtimeSettings = { ...runtimeSettings, cloudModel: normalized };
  return { ok: true, message: `Cloud model set to ${normalized}.` };
}

export function isApiKeyConfigured(): boolean {
  return Boolean(process.env.EXPO_PUBLIC_DEV_GEMINI_API_KEY);
}

export function isLocalAiAvailable(): boolean {
  try {
    // Avoid touching Cactus runtime here; only declare capability when on-device.
    // Android-only for this iteration.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Platform } = require('react-native') as typeof import('react-native');
    return Platform.OS === 'android';
  } catch {
    return false;
  }
}

export function isWebGroundingAvailable(): boolean {
  return false;
}

export function getAllowedCloudModels(): readonly string[] {
  return ALLOWED_CLOUD_MODELS;
}

export function getCloudFallbackOnLocalFail(): boolean {
  return runtimeSettings.cloudFallbackOnLocalFail;
}

export function setCloudFallbackOnLocalFail(on: boolean): { ok: boolean; message: string } {
  runtimeSettings = { ...runtimeSettings, cloudFallbackOnLocalFail: on };
  return { ok: true, message: `Cloud fallback when Local AI fails: ${on ? 'On' : 'Off'}.` };
}

export function setKnowledgeScope(scope: AiKnowledgeScope): { ok: boolean; message: string } {
  if (scope === 'web_grounded' && !isWebGroundingAvailable()) {
    return { ok: false, message: 'Web-grounded AI is not available in this demo build.' };
  }
  runtimeSettings = { ...runtimeSettings, knowledgeScope: scope };
  return { ok: true, message: `Knowledge scope set to ${scope}.` };
}

export function getCloudModelLabel(model: string): string {
  const labels: Record<string, string> = {
    'gemini-2.5-flash': 'Gemini 2.5 Flash - balanced default',
    'gemini-2.5-flash-lite': 'Gemini 2.5 Flash Lite - cheaper / lighter',
    'gemini-3-flash': 'Gemini 3 Flash - newer fast model',
    'gemini-3.1-flash-lite': 'Gemini 3.1 Flash Lite - cheapest fast model if available',
    'gemma-3-2b-it': 'Gemma 3 2B - small open model',
    'gemma-3-4b-it': 'Gemma 3 4B - small open model',
    'gemma-3-12b-it': 'Gemma 3 12B - stronger open model',
    'gemma-4-26b-it': 'Gemma 4 26B - larger open model',
    'gemma-4-31b-it': 'Gemma 4 31B - larger open model'
  };
  return labels[model] ?? model;
}

import type { AiProviderType } from './aiTypes';
import { getRuntimeGeminiApiKeyOverride } from '../aiSettingsService';

export const DEV_GEMINI_KEY_MISSING_MESSAGE = 'Development Gemini API key is not configured.';
export const LOCAL_AI_ENDPOINT_MISSING_MESSAGE = 'Local AI endpoint is not configured.';

export type AiConfig = {
  provider: AiProviderType;
  model: string;
  devGeminiApiKey: string;
  localAiEndpoint: string;
};

export function getAiConfig(): AiConfig {
  const provider = (process.env.EXPO_PUBLIC_AI_PROVIDER as AiProviderType | undefined) ?? 'gemini';
  const runtimeOverride = getRuntimeGeminiApiKeyOverride();
  return {
    provider,
    model: process.env.EXPO_PUBLIC_DEV_GEMINI_MODEL ?? 'gemini-2.5-flash',
    devGeminiApiKey: runtimeOverride || process.env.EXPO_PUBLIC_DEV_GEMINI_API_KEY ?? '',
    localAiEndpoint: process.env.EXPO_PUBLIC_LOCAL_AI_ENDPOINT ?? ''
  };
}

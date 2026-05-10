import {
  DEV_GEMINI_KEY_MISSING_MESSAGE,
  LOCAL_AI_ENDPOINT_MISSING_MESSAGE
} from './ai/aiConfig';
import { generateAiResponse, testAiConnection } from './ai/aiClient';
import type { AiAction, AiRequest, AiResult } from './ai/aiTypes';

export const AI_ENDPOINT_ERROR_MESSAGE = 'AI endpoint is not configured.';
export { DEV_GEMINI_KEY_MISSING_MESSAGE, LOCAL_AI_ENDPOINT_MISSING_MESSAGE };
export type AIAction = Exclude<AiAction, 'ar_explain'>;
export type AIRequestPayload = Omit<AiRequest, 'action'> & { action: AIAction };
export type AIResponsePayload = { text: string };

export async function requestAI(payload: AIRequestPayload): Promise<AIResponsePayload> {
  const result = await generateAiResponse(payload);
  if (!result.ok) {
    return { text: result.error };
  }
  return { text: result.text };
}

export { generateAiResponse, testAiConnection };
export type { AiRequest, AiResult };

import {
  DEV_GEMINI_KEY_MISSING_MESSAGE,
  getAiConfig
} from '../aiConfig';
import type { AiProvider, AiRequest, AiResult } from '../aiTypes';
import { getActiveGeminiModel } from '../../aiSettingsService';

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

class GeminiCloudProvider implements AiProvider {
  async generate(request: AiRequest): Promise<AiResult> {
    const config = getAiConfig();
    if (!config.devGeminiApiKey) {
      return { ok: false, error: DEV_GEMINI_KEY_MISSING_MESSAGE };
    }

    const model = getActiveGeminiModel() || config.model;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const finalPrompt = request.prompt;
    const controller = new AbortController();
    const relayAbort = () => controller.abort('superseded');
    request.signal?.addEventListener('abort', relayAbort, { once: true });

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': config.devGeminiApiKey
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: finalPrompt }]
            }
          ]
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        if (response.status === 429) {
          return {
            ok: false,
            error: 'Rate limit reached for the selected model. Please wait or choose another model in Settings.'
          };
        }
        if (response.status === 400 || response.status === 404) {
          return {
            ok: false,
            error: 'Selected AI model is not available for this API key. Please choose another model in Settings.'
          };
        }
        return { ok: false, error: `Gemini request failed: ${response.status}` };
      }

      const data = (await response.json()) as GeminiResponse;
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        return { ok: false, error: 'Gemini returned an empty response.', raw: data };
      }

      return { ok: true, text, raw: data };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gemini request failed.';
      if (request.signal?.aborted) {
        return { ok: false, error: 'request_superseded' };
      }
      if (message.toLowerCase().includes('aborted')) {
        return { ok: false, error: 'Gemini request aborted.' };
      }
      return { ok: false, error: message };
    } finally {
      request.signal?.removeEventListener('abort', relayAbort);
    }
  }
}

export const geminiCloudProvider: AiProvider = new GeminiCloudProvider();

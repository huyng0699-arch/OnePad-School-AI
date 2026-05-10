import {
  LOCAL_AI_ENDPOINT_MISSING_MESSAGE
} from '../aiConfig';
import type { AiProvider, AiRequest, AiResult } from '../aiTypes';
import { isLocalAiAvailable } from '../../aiSettingsService';

class LocalAiProvider implements AiProvider {
  async generate(request: AiRequest): Promise<AiResult> {
    void request;
    if (!isLocalAiAvailable()) {
      return { ok: false, error: 'Local AI is not available in this demo build.' };
    }
    return { ok: false, error: LOCAL_AI_ENDPOINT_MISSING_MESSAGE };
  }
}

export const localAiProvider: AiProvider = new LocalAiProvider();

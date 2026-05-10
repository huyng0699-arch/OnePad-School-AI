import type { AiProvider, AiRequest, AiResult } from '../aiTypes';

type BackendResponse = {
  text?: string;
  output?: string;
  message?: string;
  json?: unknown;
};

class BackendCloudProvider implements AiProvider {
  async generate(_request: AiRequest): Promise<AiResult> {
    return { ok: false, error: 'Backend cloud provider is not enabled in this build.' };
  }
}

export const backendCloudProvider: AiProvider = new BackendCloudProvider();

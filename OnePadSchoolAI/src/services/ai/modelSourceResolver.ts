import type { LocalModelConfig } from './localModelConfig';
import { getManualLocalAiSource } from './localAiSourceService';

export type ResolvedModelSource = {
  ok: boolean;
  sourceType: 'manual_url' | 'manual_local_path' | 'default_registry' | 'default_url' | 'missing';
  registryId?: string;
  remoteUrl?: string;
  localPath?: string;
  error?: string;
};

function normalizeValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function resolveLocalModelSource(selectedModel: LocalModelConfig | null): ResolvedModelSource {
  const manual = getManualLocalAiSource();
  const manualPath = normalizeValue(manual.localPath);
  if (manualPath) {
    return { ok: true, sourceType: 'manual_local_path', localPath: manualPath };
  }

  const manualUrl = normalizeValue(manual.remoteUrl);
  if (manualUrl) {
    return { ok: true, sourceType: 'manual_url', remoteUrl: manualUrl };
  }

  const defaultRegistryId = normalizeValue(selectedModel?.registryKey);
  if (defaultRegistryId) {
    return { ok: true, sourceType: 'default_registry', registryId: defaultRegistryId };
  }

  return {
    ok: false,
    sourceType: 'missing',
    error: 'Selected local model source is not configured. Add a registry key or manual local path.'
  };
}

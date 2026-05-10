import { getRegistry } from 'cactus-react-native';
import type { LocalModelConfig } from './localModelConfig';
import {
  LOCAL_MODELS_BASE,
  LOCAL_GEMMA4_E4B_MODEL
} from './localModelConfig';

type CactusRegistryModel = {
  slug: string;
  quantization?: {
    int4?: { url?: string };
    int8?: { url?: string };
  };
  capabilities?: string[];
};

let cachedModels: LocalModelConfig[] | null = null;

function hasArtifactUrl(model: CactusRegistryModel | undefined, quantization: 'int4' | 'int8'): boolean {
  const url = quantization === 'int4'
    ? model?.quantization?.int4?.url
    : model?.quantization?.int8?.url;
  return typeof url === 'string' && url.length > 0;
}

function findE4BSlug(registry: Record<string, CactusRegistryModel>): string | null {
  for (const [slug, item] of Object.entries(registry)) {
    const text = `${slug} ${(item.capabilities ?? []).join(' ')}`.toLowerCase();
    if (text.includes('gemma-4') && text.includes('e4b')) {
      return slug;
    }
  }
  return null;
}

export async function getLocalModelConfigs(): Promise<LocalModelConfig[]> {
  if (cachedModels) return cachedModels;

  const base = [...LOCAL_MODELS_BASE];

  try {
    const registry = (await getRegistry()) as unknown as Record<string, CactusRegistryModel>;

    const e4bSlug = findE4BSlug(registry);
    const e4bModel = e4bSlug ? registry[e4bSlug] : undefined;
    const e4bAvailable = Boolean(e4bSlug && hasArtifactUrl(e4bModel, 'int4'));

    cachedModels = base.map((item) => {
      if (item.id !== LOCAL_GEMMA4_E4B_MODEL.id) {
        return item;
      }

      if (e4bAvailable && e4bSlug) {
        return {
          ...item,
          registryKey: e4bSlug,
          enabled: true,
          unavailableReason: undefined
        };
      }

      return {
        ...item,
        enabled: false,
        unavailableReason: 'Gemma 4 E4B artifact is not available in the current Cactus registry.'
      };
    });
  } catch {
    cachedModels = base.map((item) =>
      item.id === LOCAL_GEMMA4_E4B_MODEL.id
        ? {
            ...item,
            enabled: false,
            unavailableReason: 'Gemma 4 E4B artifact is not available in the current Cactus registry.'
          }
        : item
    );
  }

  return cachedModels;
}

export function clearLocalModelConfigsCache(): void {
  cachedModels = null;
}


export type LocalModelQuantization = 'int4' | 'int8';

export type LocalModelConfig = {
  id: string;
  label: string;
  provider: 'cactus';
  target: 'android_local';
  registryKey: string;
  quantization: LocalModelQuantization;
  recommended?: boolean;
  advanced?: boolean;
  enabled: boolean;
  unavailableReason?: string;
};

export const LOCAL_GEMMA4_E2B_MODEL: LocalModelConfig = {
  id: 'gemma-4-e2b-it',
  label: 'Gemma 4 E2B Local via Cactus',
  provider: 'cactus',
  target: 'android_local',
  registryKey: 'gemma-4-e2b-it',
  quantization: 'int4',
  recommended: true,
  advanced: false,
  enabled: true
};

export const LOCAL_GEMMA4_E4B_MODEL: LocalModelConfig = {
  id: 'gemma-4-e4b-it',
  label: 'Gemma 4 E4B Local via Cactus',
  provider: 'cactus',
  target: 'android_local',
  registryKey: 'gemma-4-e4b-it',
  quantization: 'int4',
  recommended: false,
  advanced: true,
  enabled: false,
  unavailableReason: 'Gemma 4 E4B artifact is not available in the current Cactus registry.'
};

export const LOCAL_MODELS_BASE: LocalModelConfig[] = [
  LOCAL_GEMMA4_E2B_MODEL,
  LOCAL_GEMMA4_E4B_MODEL
];

export const DEFAULT_LOCAL_MODEL_ID = LOCAL_GEMMA4_E2B_MODEL.id;


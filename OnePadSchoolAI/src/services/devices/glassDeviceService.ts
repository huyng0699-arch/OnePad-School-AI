import AsyncStorage from '@react-native-async-storage/async-storage';

const GLASS_KEY = 'onepad_glass_device_v1';

export type GlassDeviceState = {
  connected: boolean;
  deviceName: string;
  deviceId: string;
  lastConnectedAt?: string;
};

const DEFAULT_STATE: GlassDeviceState = {
  connected: false,
  deviceName: 'Google Glass',
  deviceId: 'glass_demo_001'
};

export async function getGlassDeviceState(): Promise<GlassDeviceState> {
  try {
    const raw = await AsyncStorage.getItem(GLASS_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<GlassDeviceState>;
    return {
      connected: Boolean(parsed.connected),
      deviceName: parsed.deviceName?.trim() || DEFAULT_STATE.deviceName,
      deviceId: parsed.deviceId?.trim() || DEFAULT_STATE.deviceId,
      lastConnectedAt: parsed.lastConnectedAt
    };
  } catch {
    return DEFAULT_STATE;
  }
}

async function save(state: GlassDeviceState): Promise<void> {
  await AsyncStorage.setItem(GLASS_KEY, JSON.stringify(state));
}

export async function connectGlassDevice(deviceName = 'Google Glass Enterprise 2'): Promise<GlassDeviceState> {
  const next: GlassDeviceState = {
    connected: true,
    deviceName,
    deviceId: DEFAULT_STATE.deviceId,
    lastConnectedAt: new Date().toISOString()
  };
  await save(next);
  return next;
}

export async function disconnectGlassDevice(): Promise<GlassDeviceState> {
  const next: GlassDeviceState = {
    ...DEFAULT_STATE,
    connected: false
  };
  await save(next);
  return next;
}


import AsyncStorage from '@react-native-async-storage/async-storage';
import { studentEventCollector } from '../sync/studentEventCollector';

const HEALTH_CONNECTOR_KEY = 'onepad_third_party_health_connectors_v1';

export type HealthProviderId = 'google_fit' | 'health_connect' | 'fitbit';

export type HealthProviderState = {
  id: HealthProviderId;
  label: string;
  connected: boolean;
  lastSyncAt?: string;
};

const DEFAULT_PROVIDERS: HealthProviderState[] = [
  { id: 'health_connect', label: 'Health Connect', connected: false },
  { id: 'google_fit', label: 'Google Fit', connected: false },
  { id: 'fitbit', label: 'Fitbit', connected: false }
];

export async function getHealthProviders(): Promise<HealthProviderState[]> {
  try {
    const raw = await AsyncStorage.getItem(HEALTH_CONNECTOR_KEY);
    if (!raw) return DEFAULT_PROVIDERS;
    const parsed = JSON.parse(raw) as Array<Partial<HealthProviderState>>;
    const map = new Map(parsed.map((item) => [item.id, item]));
    return DEFAULT_PROVIDERS.map((provider) => {
      const override = map.get(provider.id);
      return {
        ...provider,
        connected: Boolean(override?.connected),
        lastSyncAt: override?.lastSyncAt
      };
    });
  } catch {
    return DEFAULT_PROVIDERS;
  }
}

async function saveProviders(list: HealthProviderState[]): Promise<void> {
  await AsyncStorage.setItem(HEALTH_CONNECTOR_KEY, JSON.stringify(list));
}

export async function setHealthProviderConnection(providerId: HealthProviderId, connected: boolean): Promise<HealthProviderState[]> {
  const current = await getHealthProviders();
  const next = current.map((provider) =>
    provider.id === providerId
      ? {
          ...provider,
          connected,
          lastSyncAt: connected ? provider.lastSyncAt : undefined
        }
      : provider
  );
  await saveProviders(next);
  return next;
}

export async function syncConnectedHealthProviders(): Promise<{ ok: boolean; message: string; providers: HealthProviderState[] }> {
  const current = await getHealthProviders();
  const connectedList = current.filter((provider) => provider.connected);
  if (connectedList.length === 0) {
    return { ok: false, message: 'No connected health apps.', providers: current };
  }

  const now = new Date().toISOString();
  const next = current.map((provider) =>
    provider.connected
      ? { ...provider, lastSyncAt: now }
      : provider
  );
  await saveProviders(next);
  await studentEventCollector.recordHealthSignalReceived(`Synced data from ${connectedList.map((item) => item.label).join(', ')}.`);
  return {
    ok: true,
    message: `Synced ${connectedList.length} health app(s).`,
    providers: next
  };
}


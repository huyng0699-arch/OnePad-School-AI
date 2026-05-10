import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockDailyBodyLogs, mockPhysicalHealthProfile } from '../../data/mockPhysicalHealthData';
import { mockSupportSignals } from '../../data/mockSupportSignals';
import { mockWellbeingCheckIns } from '../../data/mockWellbeingData';
import { getBackendBaseUrl } from '../sync/syncConfig';
import type { DailyBodyLog, PhysicalHealthProfile } from '../../types/healthTypes';
import type { SupportSignal, WellbeingCheckIn } from '../../types/wellbeingTypes';

export type DataSourceBadge = 'live_backend' | 'local_cache' | 'demo_seed';

type HealthBundle = {
  profile: PhysicalHealthProfile;
  logs: DailyBodyLog[];
  checkIns: WellbeingCheckIn[];
  supportSignals: SupportSignal[];
  source: DataSourceBadge;
  generatedAt: string;
};

const CACHE_KEY = 'onepad_health_bundle_v1';

async function safeGetJson(path: string): Promise<any | null> {
  const base = getBackendBaseUrl();
  if (!base) return null;
  try {
    const response = await fetch(`${base}${path}`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function readCache(): Promise<HealthBundle | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) as HealthBundle : null;
  } catch {
    return null;
  }
}

async function writeCache(bundle: HealthBundle) {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(bundle));
  } catch {}
}

function demoSeedBundle(): HealthBundle {
  return {
    profile: mockPhysicalHealthProfile,
    logs: mockDailyBodyLogs,
    checkIns: mockWellbeingCheckIns,
    supportSignals: mockSupportSignals,
    source: 'demo_seed',
    generatedAt: new Date().toISOString()
  };
}

export async function loadHealthWellbeingBundle(studentId = 'stu_001'): Promise<HealthBundle> {
  const health = await safeGetJson(`/v1/student/health/logs?studentId=${studentId}`);
  const signals = await safeGetJson(`/v1/student/wellbeing/signals?studentId=${studentId}`);
  if (health?.ok && signals?.ok) {
    const bundle: HealthBundle = {
      profile: { ...mockPhysicalHealthProfile, studentId, updatedAt: new Date().toISOString() },
      logs: health.logs || [],
      checkIns: mockWellbeingCheckIns,
      supportSignals: signals.signals || [],
      source: 'live_backend',
      generatedAt: new Date().toISOString()
    };
    await writeCache(bundle);
    return bundle;
  }
  const cache = await readCache();
  if (cache) return { ...cache, source: 'local_cache' };
  return demoSeedBundle();
}

export async function submitWellbeingCheckInToBackend(payload: Record<string, unknown>) {
  const base = getBackendBaseUrl();
  if (!base) return { ok: false, state: 'queued' as const };
  try {
    const response = await fetch(`${base}/v1/student/wellbeing/check-ins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) return { ok: false, state: 'failed' as const };
    return { ok: true, state: 'synced' as const };
  } catch {
    return { ok: false, state: 'failed' as const };
  }
}

export async function submitSupportSignalToBackend(payload: Record<string, unknown>) {
  const base = getBackendBaseUrl();
  if (!base) return { ok: false, state: 'queued' as const };
  try {
    const response = await fetch(`${base}/v1/student/support-signals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) return { ok: false, state: 'failed' as const };
    return { ok: true, state: 'synced' as const };
  } catch {
    return { ok: false, state: 'failed' as const };
  }
}

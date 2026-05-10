import type { MobileSyncItem, SyncResult } from './mobileSyncTypes';

export const syncItemToBackend = async (
  item: MobileSyncItem,
): Promise<SyncResult> => {
  const endpoint = process.env.EXPO_PUBLIC_ONEPAD_API_BASE_URL;

  if (!endpoint) {
    return {
      ok: false,
      error: 'Backend endpoint is not configured.',
    };
  }

  const response = await fetch(`${endpoint}/api/mobile-sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  });

  if (!response.ok) {
    return {
      ok: false,
      error: `Sync failed with status ${response.status}`,
    };
  }

  return {
    ok: true,
    syncedAt: new Date().toISOString(),
  };
};

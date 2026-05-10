import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { SyncStatus } from '../../services/sync/mobileSyncTypes';

type Props = {
  status: SyncStatus;
  backendConfigured: boolean;
};

export default function SyncStatusBadge({ status, backendConfigured }: Props) {
  const label = !backendConfigured
    ? 'Backend not configured'
    : status === 'synced'
      ? 'Synced'
      : status === 'failed'
        ? 'Sync failed'
        : status === 'syncing'
          ? 'Syncing'
          : 'Pending sync';

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#eef4ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
  },
  text: { color: '#1e3a8a', fontSize: 12, fontWeight: '700' },
});

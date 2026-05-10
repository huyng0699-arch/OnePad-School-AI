import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getLastEvent, getQueueStats } from '../services/sync/studentEventQueue';
import { studentSyncClient } from '../services/sync/studentSyncClient';
import { getBackendBaseUrl, getSyncConfigError } from '../services/sync/syncConfig';
import { getSyncStatus, subscribeSyncStatus, syncNow } from '../services/sync/studentSyncService';
import { studentEventCollector } from '../services/sync/studentEventCollector';

export default function OnePadBackendSyncPanel() {
  const [syncState, setSyncState] = React.useState(getSyncStatus());
  const [pending, setPending] = React.useState(0);
  const [preview, setPreview] = React.useState<string>('');
  React.useEffect(() => {
    const unsub = subscribeSyncStatus(setSyncState);
    const t = setInterval(async () => setPending((await getQueueStats()).pending), 1500);
    return () => { unsub(); clearInterval(t); };
  }, []);
  const enqueueGuardianDemo = async (kind: 'health' | 'wellbeing') => {
    if (kind === 'health') {
      await studentEventCollector.recordHealthSignalReceived('Parent-controlled health signal: low sleep and possible fatigue before Biology review.');
    } else {
      await studentEventCollector.recordWellbeingSignalReceived('Wellbeing signal: stress rose during timed quiz and student prefers written response path.');
    }
    setPending((await getQueueStats()).pending);
    setPreview(`${kind} guardian signal queued. Press Sync Now to send it to school reports.`);
  };
  const runPreview = async (kind: 'teacher' | 'parent' | 'admin' | 'ar' | 'last') => {
    if (kind === 'last') {
      const ev = await getLastEvent();
      setPreview(ev ? JSON.stringify(ev, null, 2) : 'No event yet');
      return;
    }
    const res = kind === 'teacher'
      ? await studentSyncClient.getTeacherDemoReport()
      : kind === 'parent'
        ? await studentSyncClient.getParentDemoReport()
        : kind === 'admin'
          ? await studentSyncClient.getAdminDemoOverview()
          : await studentSyncClient.getStudentArAssignments();
    setPreview(JSON.stringify(res.data, null, 2));
  };
  return (
    <View style={styles.card}>
      <Text style={styles.title}>OnePad Backend Sync</Text>
      <Text style={styles.item}>Backend URL: {getBackendBaseUrl() || '(missing)'}</Text>
      {getSyncConfigError() ? <Text style={styles.warn}>{getSyncConfigError()}</Text> : null}
      <Text style={styles.item}>State: {syncState.state}</Text>
      <Text style={styles.item}>Pending: {pending}</Text>
      <Text style={styles.item}>Last Synced: {syncState.lastSyncedAt ?? 'N/A'}</Text>
      <Pressable style={styles.btn} onPress={() => void syncNow()}><Text style={styles.btnText}>Sync Now</Text></Pressable>
      <Pressable style={styles.btnAlt} onPress={() => void enqueueGuardianDemo('health')}><Text style={styles.btnAltText}>Queue Health Signal for Parent/Teacher</Text></Pressable>
      <Pressable style={styles.btnAlt} onPress={() => void enqueueGuardianDemo('wellbeing')}><Text style={styles.btnAltText}>Queue Wellbeing Signal for Guardian Mode</Text></Pressable>
      <Pressable style={styles.btn} onPress={() => void runPreview('last')}><Text style={styles.btnText}>View Last Event</Text></Pressable>
      <Pressable style={styles.btn} onPress={() => void runPreview('teacher')}><Text style={styles.btnText}>Open Teacher Report Preview</Text></Pressable>
      <Pressable style={styles.btn} onPress={() => void runPreview('parent')}><Text style={styles.btnText}>Open Parent Report Preview</Text></Pressable>
      <Pressable style={styles.btn} onPress={() => void runPreview('admin')}><Text style={styles.btnText}>Open School Aggregate Preview</Text></Pressable>
      <Pressable style={styles.btn} onPress={() => void runPreview('ar')}><Text style={styles.btnText}>Open Assigned AR Lessons</Text></Pressable>
      {preview ? <Text style={styles.preview}>{preview}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 12, borderWidth: 1, borderColor: '#dbe3ef', borderRadius: 10, padding: 10, backgroundColor: '#f8fafc' },
  title: { fontWeight: '700', color: '#0f172a', marginBottom: 6 },
  item: { color: '#334155', fontSize: 12, marginBottom: 2 },
  warn: { color: '#b91c1c', fontSize: 12 },
  btn: { marginTop: 6, backgroundColor: '#1d4ed8', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  btnText: { color: 'white', fontSize: 12, fontWeight: '700' },
  btnAlt: { marginTop: 6, backgroundColor: '#ecfeff', borderWidth: 1, borderColor: '#67e8f9', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  btnAltText: { color: '#0f766e', fontSize: 12, fontWeight: '700' },
  preview: { marginTop: 8, color: '#0f172a', fontSize: 11 }
});



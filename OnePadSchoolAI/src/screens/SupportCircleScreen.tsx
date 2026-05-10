import React from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { createSupportSignalFromCheckIn, createWellbeingCheckIn } from '../services/wellbeing/wellbeingCheckInEngine';
import { submitSupportSignalToBackend } from '../services/health/healthWellbeingDataService';
import { studentEventCollector } from '../services/sync/studentEventCollector';
import type { SupportRole } from '../types/wellbeingTypes';

type Props = {
  onBack: () => void;
  onNavigateReportPreview: () => void;
};

const roles: Array<{ label: string; value: SupportRole; description: string }> = [
  { label: 'Homeroom Teacher', value: 'homeroom_teacher', description: 'Coordinates school support.' },
  { label: 'Subject Teacher', value: 'subject_teacher', description: 'Helps with lesson-specific questions.' },
  { label: 'Parent / Guardian', value: 'parent', description: 'Receives safe home recommendations.' },
  { label: 'Education Guardian', value: 'education_guardian', description: 'Supports family-school coordination.' }
];

const reasons = [
  'I do not understand the lesson',
  'I need teacher help',
  'I want to talk privately',
  'I feel too tired to study today',
  'School feels too much today'
];

export default function SupportCircleScreen({ onBack, onNavigateReportPreview }: Props) {
  const [selectedRole, setSelectedRole] = React.useState<SupportRole>('homeroom_teacher');
  const [selectedReason, setSelectedReason] = React.useState(reasons[0]);
  const signal = React.useMemo(() => {
    const checkIn = createWellbeingCheckIn({
      studentId: 'student_minh_001',
      moodLabel: 'tired',
      schoolStressLevel: 4,
      socialComfortLevel: 3,
      wantsAdultSupport: true,
      preferredSupportRole: selectedRole,
      privateReflection: selectedReason
    });
    return createSupportSignalFromCheckIn(checkIn);
  }, [selectedReason, selectedRole]);
  const [sendState, setSendState] = React.useState<'idle' | 'queued' | 'synced' | 'failed'>('idle');

  const sendSignal = async () => {
    if (!signal) return;
    await studentEventCollector.recordSupportRequested(signal.safeSummary, 'sensitive');
    const result = await submitSupportSignalToBackend({
      studentId: signal.studentId,
      safeSummary: signal.safeSummary,
      signalType: signal.signalType
    });
    setSendState(result.state);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Support Circle</Text>

        {roles.map((role) => (
          <Pressable
            key={role.value}
            style={[styles.roleCard, selectedRole === role.value ? styles.roleActive : null]}
            onPress={() => setSelectedRole(role.value)}
          >
            <Text style={styles.roleTitle}>{role.label}</Text>
            <Text style={styles.cardText}>{role.description}</Text>
          </Pressable>
        ))}

        <Text style={styles.sectionTitle}>Support reason</Text>
        {reasons.map((reason) => (
          <Pressable
            key={reason}
            style={[styles.reason, selectedReason === reason ? styles.reasonActive : null]}
            onPress={() => setSelectedReason(reason)}
          >
            <Text style={styles.reasonText}>{reason}</Text>
          </Pressable>
        ))}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Sent request preview</Text>
          <Text style={styles.cardText}>{signal?.safeSummary}</Text>
          <Text style={styles.lockedText}>Raw private content locked. Safe summary only.</Text>
          <Text style={styles.cardText}>Send status: {sendState}</Text>
        </View>

        <Pressable style={styles.primaryButton} onPress={() => void sendSignal()}>
          <Text style={styles.primaryButtonText}>Send Support Request</Text>
        </Pressable>
        <Pressable style={styles.primaryButton} onPress={onNavigateReportPreview}>
          <Text style={styles.primaryButtonText}>Report Preview</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f3f6fb' },
  container: { paddingTop: (StatusBar.currentHeight ?? 0) + 8, paddingHorizontal: 16, paddingBottom: 40 },
  backButton: { alignSelf: 'flex-start', paddingVertical: 8, paddingRight: 12, marginBottom: 4 },
  backText: { color: '#2563eb', fontWeight: '800' },
  title: { color: '#0f172a', fontSize: 24, fontWeight: '900', marginBottom: 12 },
  sectionTitle: { color: '#1f2937', fontSize: 16, fontWeight: '800', marginBottom: 8 },
  roleCard: { backgroundColor: '#ffffff', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  roleActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  roleTitle: { color: '#0f172a', fontSize: 15, fontWeight: '800', marginBottom: 4 },
  card: { backgroundColor: '#ffffff', borderRadius: 14, padding: 14, marginTop: 4, marginBottom: 12 },
  cardText: { color: '#475569', fontSize: 13, marginBottom: 6 },
  reason: { backgroundColor: '#ffffff', borderRadius: 12, padding: 12, marginBottom: 8 },
  reasonActive: { backgroundColor: '#dcfce7' },
  reasonText: { color: '#334155', fontWeight: '700' },
  lockedText: { color: '#0f766e', fontSize: 13, fontWeight: '800' },
  primaryButton: { backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginBottom: 10 },
  primaryButtonText: { color: '#ffffff', fontWeight: '800' }
});

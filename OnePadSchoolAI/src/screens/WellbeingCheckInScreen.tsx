import React from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import LocalFirstRouteCard from '../components/ai/LocalFirstRouteCard';
import WellbeingHeatmap from '../components/charts/WellbeingHeatmap';
import { mockWellbeingCheckIns } from '../data/mockWellbeingData';
import {
  createSupportSignalFromCheckIn,
  createWellbeingCheckIn
} from '../services/wellbeing/wellbeingCheckInEngine';
import { runStudentAgentTurn } from '../services/agents/studentAgentOrchestrator';
import { studentEventCollector } from '../services/sync/studentEventCollector';
import { submitWellbeingCheckInToBackend } from '../services/health/healthWellbeingDataService';
import type { MoodLabel, SupportRole, SupportSignal, WellbeingCheckIn } from '../types/wellbeingTypes';

type Props = {
  onBack: () => void;
  onNavigateSupportCircle: () => void;
};

const moodOptions: MoodLabel[] = ['calm', 'okay', 'tired', 'stressed', 'overwhelmed'];
const roleOptions: Array<{ label: string; value: SupportRole }> = [
  { label: 'Subject teacher', value: 'subject_teacher' },
  { label: 'Homeroom teacher', value: 'homeroom_teacher' },
  { label: 'Parent / Guardian', value: 'parent' },
  { label: 'Education guardian', value: 'education_guardian' }
];

export default function WellbeingCheckInScreen({ onBack, onNavigateSupportCircle }: Props) {
  const [moodLabel, setMoodLabel] = React.useState<MoodLabel>('tired');
  const [schoolStressLevel, setSchoolStressLevel] = React.useState<1 | 2 | 3 | 4 | 5>(4);
  const [socialComfortLevel, setSocialComfortLevel] = React.useState<1 | 2 | 3 | 4 | 5>(3);
  const [wantsAdultSupport, setWantsAdultSupport] = React.useState(true);
  const [preferredSupportRole, setPreferredSupportRole] = React.useState<SupportRole>('homeroom_teacher');
  const [privateReflection, setPrivateReflection] = React.useState('Math feels too much today.');
  const [savedCheckIn, setSavedCheckIn] = React.useState<WellbeingCheckIn | null>(null);
  const [supportSignal, setSupportSignal] = React.useState<SupportSignal | undefined>();
  const [syncState, setSyncState] = React.useState<'queued' | 'synced' | 'failed'>('queued');

  const submit = async () => {
    const checkIn = createWellbeingCheckIn({
      studentId: 'student_minh_001',
      moodLabel,
      schoolStressLevel,
      socialComfortLevel,
      wantsAdultSupport,
      preferredSupportRole: wantsAdultSupport ? preferredSupportRole : undefined,
      privateReflection
    });
    setSavedCheckIn(checkIn);
    const generatedSignal = createSupportSignalFromCheckIn(checkIn);
    setSupportSignal(generatedSignal);
    await studentEventCollector.recordWellbeingSignalReceived(
      checkIn.safeSummary ?? `Wellbeing check-in submitted: stress ${checkIn.schoolStressLevel}/5`
    );
    if (generatedSignal?.safeSummary) {
      await studentEventCollector.recordSupportRequested(generatedSignal.safeSummary, 'sensitive');
      await runStudentAgentTurn({
        action: 'support_signal_summary',
        contextMode: 'support',
        prompt: `Create a concise support follow-up note from this safe summary: ${generatedSignal.safeSummary}`,
        contextText: generatedSignal.safeSummary,
        userText: privateReflection,
        studentId: 'stu_001',
        eventId: `wellbeing_${Date.now()}`
      });
    }
    const sync = await submitWellbeingCheckInToBackend({
      studentId: checkIn.studentId,
      moodLabel: checkIn.moodLabel,
      schoolStressLevel: checkIn.schoolStressLevel,
      socialComfortLevel: checkIn.socialComfortLevel,
      wantsAdultSupport: checkIn.wantsAdultSupport,
      preferredSupportRole: checkIn.preferredSupportRole,
      privateReflection: checkIn.privateReflection
    });
    setSyncState(sync.state);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Wellbeing Check-in</Text>
        <Text style={styles.privacy}>
          Private notes stay private by default. OnePad only creates a safe summary when you ask for support or when school safety policy requires an adult check-in.
        </Text>
        <LocalFirstRouteCard />

        <Text style={styles.sectionTitle}>Mood</Text>
        <View style={styles.chipRow}>
          {moodOptions.map((option) => (
            <Pressable
              key={option}
              style={[styles.chip, moodLabel === option ? styles.chipActive : null]}
              onPress={() => setMoodLabel(option)}
            >
              <Text style={[styles.chipText, moodLabel === option ? styles.chipTextActive : null]}>
                {option.replace('_', ' ')}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>School stress: {schoolStressLevel}/5</Text>
          <View style={styles.scaleRow}>
            {[1, 2, 3, 4, 5].map((value) => (
              <Pressable
                key={`stress-${value}`}
                style={[styles.scaleButton, schoolStressLevel === value ? styles.scaleActive : null]}
                onPress={() => setSchoolStressLevel(value as 1 | 2 | 3 | 4 | 5)}
              >
                <Text style={styles.scaleText}>{value}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.sectionTitle}>Social comfort: {socialComfortLevel}/5</Text>
          <View style={styles.scaleRow}>
            {[1, 2, 3, 4, 5].map((value) => (
              <Pressable
                key={`social-${value}`}
                style={[styles.scaleButton, socialComfortLevel === value ? styles.scaleActive : null]}
                onPress={() => setSocialComfortLevel(value as 1 | 2 | 3 | 4 | 5)}
              >
                <Text style={styles.scaleText}>{value}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          style={[styles.toggle, wantsAdultSupport ? styles.toggleActive : null]}
          onPress={() => setWantsAdultSupport((prev) => !prev)}
        >
          <Text style={[styles.toggleText, wantsAdultSupport ? styles.toggleTextActive : null]}>
            I want adult support
          </Text>
        </Pressable>

        {wantsAdultSupport ? (
          <View style={styles.chipRow}>
            {roleOptions.map((role) => (
              <Pressable
                key={role.value}
                style={[styles.chip, preferredSupportRole === role.value ? styles.chipActive : null]}
                onPress={() => setPreferredSupportRole(role.value)}
              >
                <Text style={[styles.chipText, preferredSupportRole === role.value ? styles.chipTextActive : null]}>
                  {role.label}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <TextInput
          style={styles.noteInput}
          multiline
          value={privateReflection}
          onChangeText={setPrivateReflection}
          placeholder="Optional private note"
          placeholderTextColor="#64748b"
        />

        <Pressable style={styles.primaryButton} onPress={submit}>
          <Text style={styles.primaryButtonText}>Submit Check-in</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onNavigateSupportCircle}>
          <Text style={styles.secondaryButtonText}>Open Support Circle</Text>
        </Pressable>

        {savedCheckIn ? (
          <View style={styles.resultCard}>
            <Text style={styles.sectionTitle}>Check-in saved.</Text>
            <Text style={styles.cardText}>Visibility: {savedCheckIn.visibility.replace('_', ' ')}</Text>
            <Text style={styles.cardText}>Sync status: {syncState}</Text>
            {supportSignal ? (
              <>
                <Text style={styles.cardText}>
                  Support summary created for: {preferredSupportRole.replace('_', ' ')}.
                </Text>
                <Text style={styles.cardText}>Summary: {supportSignal.safeSummary}</Text>
                <Text style={styles.lockedText}>Raw private note locked.</Text>
              </>
            ) : (
              <Text style={styles.cardText}>No support summary was shared.</Text>
            )}
          </View>
        ) : null}

        <WellbeingHeatmap checkIns={mockWellbeingCheckIns} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f3f6fb' },
  container: { paddingTop: (StatusBar.currentHeight ?? 0) + 8, paddingHorizontal: 16, paddingBottom: 40 },
  backButton: { alignSelf: 'flex-start', paddingVertical: 8, paddingRight: 12, marginBottom: 4 },
  backText: { color: '#2563eb', fontWeight: '800' },
  title: { color: '#0f172a', fontSize: 24, fontWeight: '900', marginBottom: 8 },
  privacy: { color: '#475569', fontSize: 13, backgroundColor: '#ffffff', borderRadius: 12, padding: 12, marginBottom: 12 },
  sectionTitle: { color: '#1f2937', fontSize: 16, fontWeight: '800', marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#dbe3ef', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9 },
  chipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  chipText: { color: '#475569', fontWeight: '700', textTransform: 'capitalize' },
  chipTextActive: { color: '#ffffff' },
  card: { backgroundColor: '#ffffff', borderRadius: 14, padding: 14, marginBottom: 12 },
  scaleRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  scaleButton: { width: 42, height: 38, borderRadius: 10, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  scaleActive: { backgroundColor: '#bfdbfe' },
  scaleText: { color: '#0f172a', fontWeight: '800' },
  toggle: { backgroundColor: '#ffffff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#dbe3ef', marginBottom: 12 },
  toggleActive: { backgroundColor: '#ecfeff', borderColor: '#06b6d4' },
  toggleText: { color: '#475569', fontWeight: '800' },
  toggleTextActive: { color: '#075985' },
  noteInput: { minHeight: 92, textAlignVertical: 'top', backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#dbe3ef', color: '#0f172a', padding: 12, marginBottom: 12 },
  primaryButton: { backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginBottom: 10 },
  primaryButtonText: { color: '#ffffff', fontWeight: '800' },
  secondaryButton: { backgroundColor: '#eef4ff', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginBottom: 12 },
  secondaryButtonText: { color: '#1e3a8a', fontWeight: '800' },
  resultCard: { backgroundColor: '#ffffff', borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#bae6fd' },
  cardText: { color: '#475569', fontSize: 13, marginBottom: 6 },
  lockedText: { color: '#0f766e', fontSize: 13, fontWeight: '800' }
});

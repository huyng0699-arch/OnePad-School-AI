import React from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import LocalFirstRouteCard from '../components/ai/LocalFirstRouteCard';
import EvidenceCard from '../components/evidence/EvidenceCard';
import PermissionMatrixCard from '../components/privacy/PermissionMatrixCard';
import PrivacyRedactionSummary from '../components/privacy/PrivacyRedactionSummary';
import SyncStatusBadge from '../components/sync/SyncStatusBadge';
import { runStudentAgentTurn } from '../services/agents/studentAgentOrchestrator';
import { createBodyReadinessSnapshot } from '../services/health/bodyReadinessEngine';
import { mockDailyBodyLogs } from '../data/mockPhysicalHealthData';
import { mockSupportSignals } from '../data/mockSupportSignals';
import { listEvidenceByEvent } from '../services/evidence/evidenceEngine';
import { listStudentSupportEvents } from '../services/events/studentSupportEventEngine';
import { generateAndDeliverGuardianReport } from '../services/reports/guardianReportDeliveryService';
import {
  getPermissionDecision,
  type AppRole,
} from '../services/permissions/permissionEngine';
import { getMobileSyncQueue } from '../services/sync/mobileSyncQueue';
import type { VisibleRole } from '../types/wellbeingTypes';

type Props = {
  onBack: () => void;
};

const sharedFields = [
  'learning summary',
  'body readiness safe summary',
  'support request safe summary',
  'recommendation',
];
const privateFields = ['raw AI chat', 'private reflection', 'raw body logs', 'raw wellbeing logs'];

const toAppRole = (role: VisibleRole): AppRole => {
  switch (role) {
    case 'student':
      return 'student';
    case 'parent':
      return 'parent';
    case 'subject_teacher':
      return 'subject_teacher';
    case 'homeroom_teacher':
      return 'homeroom_teacher';
    case 'education_guardian':
      return 'education_guardian';
    case 'school_admin':
      return 'school_admin';
    default:
      return 'parent';
  }
};

export default function GuardianReportPreviewScreen({ onBack }: Props) {
  const [recipientRole, setRecipientRole] = React.useState<VisibleRole>('parent');
  const event = listStudentSupportEvents()[0];
  const evidence = event ? listEvidenceByEvent(event.id) : [];

  const permissionDecision = getPermissionDecision(toAppRole(recipientRole), [
    'learning_mastery',
    'quiz_score',
    'body_readiness',
    'wellbeing_safe_summary',
    'private_reflection',
    'raw_ai_chat',
    'raw_body_logs',
    'support_signal',
    'audit_log',
  ]);
  const queue = getMobileSyncQueue();
  const backendConfigured = Boolean(process.env.EXPO_PUBLIC_BACKEND_URL);
  const [deliveryStatus, setDeliveryStatus] = React.useState<string>('');

  const handleGeneratePreview = async () => {
    const baseSummary = event?.parentSummary ?? 'Generate parent-safe report preview.';
    await runStudentAgentTurn({
      action: recipientRole === 'parent' ? 'guardian_report' : 'teacher_wellbeing_insight',
      contextMode: 'report',
      prompt: `Generate ${recipientRole} safe report summary using this context: ${baseSummary}`,
      contextText: baseSummary,
      studentId: 'stu_001',
      eventId: `report_preview_${Date.now()}`
    });
  };

  const handleSendToParent = async () => {
    const readiness = createBodyReadinessSnapshot('stu_001', mockDailyBodyLogs);
    const result = await generateAndDeliverGuardianReport({
      studentId: 'stu_001',
      learningSummary: event?.parentSummary ?? 'Weekly learning progress summary for parent channel.',
      readiness,
      supportSignals: mockSupportSignals
    });
    setDeliveryStatus(result.message);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Report Preview</Text>

        <Text style={styles.sectionTitle}>Recipient role</Text>
        <View style={styles.chipRow}>
          {(['parent', 'subject_teacher', 'homeroom_teacher', 'education_guardian', 'school_admin'] as VisibleRole[]).map(
            (role) => (
              <Pressable
                key={role}
                style={[styles.chip, recipientRole === role ? styles.chipActive : null]}
                onPress={() => setRecipientRole(role)}
              >
                <Text style={[styles.chipText, recipientRole === role ? styles.chipTextActive : null]}>
                  {role.replace('_', ' ')}
                </Text>
              </Pressable>
            ),
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>What will be shared</Text>
          {sharedFields.map((field) => (
            <Text key={field} style={styles.cardText}>
              - {field}
            </Text>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>What stays private</Text>
          {privateFields.map((field) => (
            <Text key={field} style={styles.cardText}>
              - {field}
            </Text>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Safe summary</Text>
          <Text style={styles.cardText}>{event?.teacherSummary ?? 'No teacher summary available.'}</Text>
          {(recipientRole === 'parent' || recipientRole === 'education_guardian') && event?.wellbeingSafeSummary ? (
            <Text style={styles.cardText}>{event.wellbeingSafeSummary}</Text>
          ) : (
            <Text style={styles.cardText}>Wellbeing detail hidden for this role.</Text>
          )}
          <Text style={styles.cardText}>{event?.parentSummary ?? 'No parent summary available.'}</Text>
        </View>

        <EvidenceCard items={evidence} />
        <PrivacyRedactionSummary decision={permissionDecision} />
        <PermissionMatrixCard />
        <LocalFirstRouteCard />

        <View style={styles.auditCard}>
          <Text style={styles.sectionTitle}>Audit log status</Text>
          <Text style={styles.cardText}>Permission rule applied.</Text>
          <Text style={styles.cardText}>Safe summary delivered.</Text>
          <Text style={styles.cardText}>Raw private content locked.</Text>
          <SyncStatusBadge
            status={queue.some((item) => item.status === 'failed') ? 'failed' : queue.length > 0 ? 'pending' : 'synced'}
            backendConfigured={backendConfigured}
          />
        </View>

        <Pressable style={styles.primaryButton} onPress={handleGeneratePreview}>
          <Text style={styles.primaryButtonText}>Send / Save Demo Report</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => void handleSendToParent()}>
          <Text style={styles.secondaryButtonText}>Generate + Sync To Parent (Local AI)</Text>
        </Pressable>
        {deliveryStatus ? <Text style={styles.cardText}>{deliveryStatus}</Text> : null}
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
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#dbe3ef', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9 },
  chipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  chipText: { color: '#475569', fontWeight: '700', textTransform: 'capitalize' },
  chipTextActive: { color: '#ffffff' },
  card: { backgroundColor: '#ffffff', borderRadius: 14, padding: 14, marginBottom: 12 },
  auditCard: { backgroundColor: '#ecfeff', borderRadius: 14, padding: 14, marginBottom: 12 },
  cardText: { color: '#475569', fontSize: 13, marginBottom: 6 },
  primaryButton: { backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginBottom: 10 },
  primaryButtonText: { color: '#ffffff', fontWeight: '800' },
  secondaryButton: { backgroundColor: '#eef4ff', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginBottom: 10 },
  secondaryButtonText: { color: '#1e3a8a', fontWeight: '800' },
});

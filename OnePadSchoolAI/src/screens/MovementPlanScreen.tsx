import React from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { mockDailyBodyLogs, mockPhysicalHealthProfile } from '../data/mockPhysicalHealthData';
import { createBodyReadinessSnapshot } from '../services/health/bodyReadinessEngine';
import { createWeeklyMovementPlan } from '../services/health/movementPlanEngine';
import { loadHealthWellbeingBundle } from '../services/health/healthWellbeingDataService';

type Props = {
  onBack: () => void;
  onNavigateHealthDashboard: () => void;
};

export default function MovementPlanScreen({ onBack, onNavigateHealthDashboard }: Props) {
  const [logs, setLogs] = React.useState(mockDailyBodyLogs);
  const [profile, setProfile] = React.useState(mockPhysicalHealthProfile);
  const [source, setSource] = React.useState<'live_backend' | 'local_cache' | 'demo_seed'>('demo_seed');
  React.useEffect(() => {
    void loadHealthWellbeingBundle('stu_001').then((bundle) => {
      setLogs(bundle.logs.length > 0 ? bundle.logs : mockDailyBodyLogs);
      setProfile(bundle.profile);
      setSource(bundle.source);
    });
  }, []);
  const readiness = createBodyReadinessSnapshot('student_minh_001', logs, source);
  const plan = createWeeklyMovementPlan(profile, readiness);
  const [completed, setCompleted] = React.useState<Record<string, boolean>>(
    Object.fromEntries(plan.items.map((item) => [item.id, item.completed]))
  );
  const completedCount = plan.items.filter((item) => completed[item.id]).length;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Movement Plan</Text>
        <Text style={styles.badge}>DATA SOURCE: {source.toUpperCase()}</Text>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Readiness-aware plan</Text>
          <Text style={styles.cardText}>{readiness.safeSummary}</Text>
          <Text style={styles.cardText}>Completed this demo week: {completedCount}/{plan.items.length}</Text>
        </View>

        {plan.items.map((item) => (
          <Pressable
            key={item.id}
            style={styles.planItem}
            onPress={() => setCompleted((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
          >
            <View style={[styles.checkbox, completed[item.id] ? styles.checkboxDone : null]}>
              <Text style={styles.checkboxText}>{completed[item.id] ? 'OK' : ''}</Text>
            </View>
            <View style={styles.planBody}>
              <Text style={styles.planTitle}>{item.day}: {item.title}</Text>
              <Text style={styles.cardText}>{item.durationMinutes} minutes · {item.intensity}</Text>
              <Text style={styles.cardText}>{item.description}</Text>
            </View>
          </Pressable>
        ))}

        <View style={styles.safetyCard}>
          <Text style={styles.sectionTitle}>Safety note</Text>
          <Text style={styles.cardText}>{plan.safetyNote}</Text>
        </View>

        <Pressable style={styles.primaryButton} onPress={() => setCompleted({})}>
          <Text style={styles.primaryButtonText}>Reset Plan Progress (Demo Action)</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onNavigateHealthDashboard}>
          <Text style={styles.secondaryButtonText}>Back to Health Dashboard</Text>
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
  badge: { alignSelf: 'flex-start', color: '#0c4a6e', backgroundColor: '#e0f2fe', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 10, fontSize: 11, fontWeight: '800' },
  card: { backgroundColor: '#ffffff', borderRadius: 14, padding: 14, marginBottom: 12 },
  safetyCard: { backgroundColor: '#ecfeff', borderRadius: 14, padding: 14, marginBottom: 12 },
  sectionTitle: { color: '#1f2937', fontSize: 16, fontWeight: '800', marginBottom: 8 },
  cardText: { color: '#475569', fontSize: 13, marginBottom: 5 },
  planItem: { flexDirection: 'row', backgroundColor: '#ffffff', borderRadius: 14, padding: 14, marginBottom: 10 },
  checkbox: { width: 28, height: 28, borderRadius: 8, borderWidth: 2, borderColor: '#94a3b8', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  checkboxDone: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  checkboxText: { color: '#ffffff', fontWeight: '900' },
  planBody: { flex: 1 },
  planTitle: { color: '#0f172a', fontSize: 15, fontWeight: '800', marginBottom: 4 },
  primaryButton: { backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginBottom: 10 },
  primaryButtonText: { color: '#ffffff', fontWeight: '800' },
  secondaryButton: { backgroundColor: '#eef4ff', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  secondaryButtonText: { color: '#1e3a8a', fontWeight: '800' }
});

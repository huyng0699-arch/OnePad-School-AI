import React from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import ActiveMinutesBarChart from '../components/charts/ActiveMinutesBarChart';
import EnergyTrendChart from '../components/charts/EnergyTrendChart';
import ReadinessRing from '../components/charts/ReadinessRing';
import SkillHealthCorrelationChart from '../components/charts/SkillHealthCorrelationChart';
import SleepLineChart from '../components/charts/SleepLineChart';
import StudyLoadEnergyChart from '../components/charts/StudyLoadEnergyChart';
import { mockDailyBodyLogs, mockPhysicalHealthProfile } from '../data/mockPhysicalHealthData';
import { mastery } from '../data/mockData';
import { mockSupportSignals } from '../data/mockSupportSignals';
import { createBodyReadinessSnapshot } from '../services/health/bodyReadinessEngine';
import { createAdvancedHealthAnalytics } from '../services/health/advancedHealthAnalyticsService';
import { createHealthTrendSummary } from '../services/health/healthTrendEngine';
import { createWeeklyMovementPlan } from '../services/health/movementPlanEngine';
import { createSleepRecoverySummary } from '../services/health/sleepRecoveryEngine';
import {
  getHealthProviders,
  setHealthProviderConnection,
  syncConnectedHealthProviders,
  type HealthProviderState
} from '../services/health/thirdPartyHealthConnectorService';
import { generateAndDeliverGuardianReport } from '../services/reports/guardianReportDeliveryService';
import { loadHealthWellbeingBundle } from '../services/health/healthWellbeingDataService';

type Props = {
  onBack: () => void;
  onNavigateMovementPlan: () => void;
  onNavigateWellbeingCheckIn: () => void;
  onNavigateGuardianReport: () => void;
};

export default function HealthDashboardScreen({
  onBack,
  onNavigateMovementPlan,
  onNavigateWellbeingCheckIn,
  onNavigateGuardianReport
}: Props) {
  const [logs, setLogs] = React.useState(mockDailyBodyLogs);
  const [profile, setProfile] = React.useState(mockPhysicalHealthProfile);
  const [dataSource, setDataSource] = React.useState<'live_backend' | 'local_cache' | 'demo_seed'>('demo_seed');
  const readiness = createBodyReadinessSnapshot('student_minh_001', logs, dataSource);
  const sleep = createSleepRecoverySummary(logs);
  const trends = createHealthTrendSummary(logs);
  const plan = createWeeklyMovementPlan(profile, readiness);
  const analytics = createAdvancedHealthAnalytics(logs);
  const [providers, setProviders] = React.useState<HealthProviderState[]>([]);
  const [syncStatus, setSyncStatus] = React.useState<string>('');
  const [deliveryStatus, setDeliveryStatus] = React.useState<string>('');

  React.useEffect(() => {
    void getHealthProviders().then(setProviders);
    void loadHealthWellbeingBundle('stu_001').then((bundle) => {
      setLogs(bundle.logs.length > 0 ? bundle.logs : mockDailyBodyLogs);
      setProfile(bundle.profile);
      setDataSource(bundle.source);
    });
  }, []);

  const toggleProvider = async (providerId: HealthProviderState['id'], nextConnected: boolean) => {
    const next = await setHealthProviderConnection(providerId, nextConnected);
    setProviders(next);
  };

  const syncProviders = async () => {
    const result = await syncConnectedHealthProviders();
    setProviders(result.providers);
    setSyncStatus(result.message);
  };

  const deliverParentReport = async () => {
    const result = await generateAndDeliverGuardianReport({
      studentId: 'stu_001',
      learningSummary: `Current mastery is ${mastery.level}%. Student needs short, structured review for weaker concepts.`,
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
        <Text style={styles.title}>OnePad Health & Readiness</Text>
        <Text style={styles.subtitle}>
          School wellness signals are used only to adjust learning support and safe routines.
        </Text>
        <View style={styles.sourceBadge}>
          <Text style={styles.sourceBadgeText}>DATA SOURCE: {dataSource.toUpperCase()}</Text>
        </View>

        <View style={styles.cardRow}>
          <View style={[styles.card, styles.flexCard]}>
            <Text style={styles.sectionTitle}>Body Readiness</Text>
            <ReadinessRing level={readiness.readinessLevel} />
            <Text style={styles.cardText}>{readiness.safeSummary}</Text>
          </View>
          <View style={[styles.card, styles.flexCard]}>
            <Text style={styles.sectionTitle}>Sleep Recovery</Text>
            <Text style={styles.metric}>{sleep.averageSleepHours}h</Text>
            <Text style={styles.cardText}>Trend: {sleep.trend.replace('_', ' ')}</Text>
            <Text style={styles.cardText}>{sleep.recommendation}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Movement Balance</Text>
          <Text style={styles.cardText}>Average active minutes: {trends.averageActiveMinutes}m</Text>
          <Text style={styles.cardText}>Plan this week: {plan.items.length} light to moderate activities.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>AI Recommendation</Text>
          <Text style={styles.cardText}>{trends.patternSummary}</Text>
          <Text style={styles.cardText}>Learning mode: {readiness.learningRecommendation.replace('_', ' ')}</Text>
          <Text style={styles.routeNote}>Local-first route: ready for Cactus/Gemma. Current demo: local deterministic engine + Gemini fallback.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Mental + Physical Indexes</Text>
          <View style={styles.metricGrid}>
            <View style={styles.metricCell}>
              <Text style={styles.metricLabel}>Readiness</Text>
              <Text style={styles.metricValue}>{analytics.indexes.readinessIndex}</Text>
            </View>
            <View style={styles.metricCell}>
              <Text style={styles.metricLabel}>Recovery</Text>
              <Text style={styles.metricValue}>{analytics.indexes.recoveryIndex}</Text>
            </View>
            <View style={styles.metricCell}>
              <Text style={styles.metricLabel}>Overload Risk</Text>
              <Text style={styles.metricValue}>{analytics.indexes.overloadRiskIndex}</Text>
            </View>
            <View style={styles.metricCell}>
              <Text style={styles.metricLabel}>Stress</Text>
              <Text style={styles.metricValue}>{analytics.indexes.stressIndex}</Text>
            </View>
            <View style={styles.metricCell}>
              <Text style={styles.metricLabel}>Resilience</Text>
              <Text style={styles.metricValue}>{analytics.indexes.resilienceIndex}</Text>
            </View>
          </View>
          <Text style={styles.cardText}>
            Corr(study,fatigue): {analytics.correlationStudyVsFatigue} · Corr(sleep,readiness): {analytics.correlationSleepVsReadiness}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Statistical Signals</Text>
          <Text style={styles.cardText}>Sleep mean {analytics.sleepProfile.mean}h (std {analytics.sleepProfile.stdDev}) · slope {analytics.sleepProfile.slope}</Text>
          <Text style={styles.cardText}>Activity mean {analytics.activityProfile.mean}m (std {analytics.activityProfile.stdDev}) · slope {analytics.activityProfile.slope}</Text>
          <Text style={styles.cardText}>Fatigue mean {analytics.fatigueProfile.mean} (z latest {analytics.fatigueProfile.zScoreLatest})</Text>
          <Text style={styles.cardText}>Study load mean {analytics.studyLoadProfile.mean}m · slope {analytics.studyLoadProfile.slope}</Text>
          <Text style={styles.cardText}>Heart-rate mean {analytics.hrProfile.mean} · slope {analytics.hrProfile.slope}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Anomaly Detection</Text>
          {analytics.anomalySignals.length === 0 ? (
            <Text style={styles.cardText}>No strong anomaly this week.</Text>
          ) : analytics.anomalySignals.map((signal, idx) => (
            <Text key={`${signal}-${idx}`} style={styles.cardText}>- {signal}</Text>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>7-Day Forecast (Readiness)</Text>
          {analytics.forecast7d.map((item) => (
            <Text key={`f-${item.dayOffset}`} style={styles.cardText}>
              Day +{item.dayOffset}: {item.predictedReadinessIndex} (band {item.lowerBand}-{item.upperBand})
            </Text>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Math-Driven Recommendations</Text>
          {analytics.recommendations.map((item, idx) => (
            <Text key={`rec-${idx}`} style={styles.cardText}>{idx + 1}. {item}</Text>
          ))}
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Connected Health Apps</Text>
          {providers.map((provider) => (
            <View key={provider.id} style={styles.providerRow}>
              <View style={styles.providerInfo}>
                <Text style={styles.providerTitle}>{provider.label}</Text>
                <Text style={styles.providerMeta}>
                  {provider.connected
                    ? `Connected${provider.lastSyncAt ? ` · Last sync ${provider.lastSyncAt}` : ''}`
                    : 'Not connected'}
                </Text>
              </View>
              <Pressable
                style={[styles.providerButton, provider.connected ? styles.providerDisconnect : styles.providerConnect]}
                onPress={() => void toggleProvider(provider.id, !provider.connected)}
              >
                <Text style={styles.providerButtonText}>{provider.connected ? 'Disconnect' : 'Connect'}</Text>
              </Pressable>
            </View>
          ))}
          <Pressable style={styles.primaryButton} onPress={() => void syncProviders()}>
            <Text style={styles.primaryButtonText}>Sync Connected Apps</Text>
          </Pressable>
          {syncStatus ? <Text style={styles.cardText}>{syncStatus}</Text> : null}
        </View>

        <SleepLineChart logs={mockDailyBodyLogs} />
        <ActiveMinutesBarChart logs={mockDailyBodyLogs} />
        <EnergyTrendChart logs={mockDailyBodyLogs} />
        <StudyLoadEnergyChart logs={mockDailyBodyLogs} />
        <SkillHealthCorrelationChart logs={mockDailyBodyLogs} masteryLevel={mastery.level} />

        <Pressable style={styles.primaryButton} onPress={onNavigateMovementPlan}>
          <Text style={styles.primaryButtonText}>Open Movement Plan</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onNavigateWellbeingCheckIn}>
          <Text style={styles.secondaryButtonText}>Wellbeing Check-in</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onNavigateGuardianReport}>
          <Text style={styles.secondaryButtonText}>Generate Parent Summary Preview</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => void deliverParentReport()}>
          <Text style={styles.secondaryButtonText}>Generate + Send Parent Report (Local AI)</Text>
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
  title: { color: '#0f172a', fontSize: 24, fontWeight: '900', marginBottom: 6 },
  subtitle: { color: '#64748b', fontSize: 13, marginBottom: 12 },
  sourceBadge: { alignSelf: 'flex-start', backgroundColor: '#e0f2fe', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 10 },
  sourceBadgeText: { color: '#0c4a6e', fontWeight: '800', fontSize: 11 },
  cardRow: { flexDirection: 'row', gap: 10 },
  flexCard: { flex: 1 },
  card: { backgroundColor: '#ffffff', borderRadius: 14, padding: 14, marginBottom: 12 },
  sectionTitle: { color: '#1f2937', fontSize: 16, fontWeight: '800', marginBottom: 10 },
  cardText: { color: '#475569', fontSize: 13, marginBottom: 6 },
  metric: { color: '#0f172a', fontSize: 30, fontWeight: '900', marginBottom: 6 },
  routeNote: { color: '#075985', fontSize: 12, marginTop: 4 },
  providerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 },
  providerInfo: { flex: 1 },
  providerTitle: { color: '#1f2937', fontSize: 14, fontWeight: '800' },
  providerMeta: { color: '#64748b', fontSize: 12, marginTop: 2 },
  providerButton: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  providerConnect: { backgroundColor: '#1d4ed8' },
  providerDisconnect: { backgroundColor: '#334155' },
  providerButtonText: { color: '#ffffff', fontWeight: '800', fontSize: 12 },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metricCell: { width: '31%', minWidth: 92, backgroundColor: '#f8fafc', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 8 },
  metricLabel: { color: '#64748b', fontSize: 11, fontWeight: '700' },
  metricValue: { color: '#0f172a', fontSize: 18, fontWeight: '900', marginTop: 2 },
  primaryButton: { backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginBottom: 10 },
  primaryButtonText: { color: '#ffffff', fontWeight: '800' },
  secondaryButton: { backgroundColor: '#eef4ff', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginBottom: 10 },
  secondaryButtonText: { color: '#1e3a8a', fontWeight: '800' }
});

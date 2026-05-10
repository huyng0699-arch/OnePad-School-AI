import React from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { lesson, student } from '../data/mockData';
import { getStudentPathLabel } from '../services/adaptiveAssessmentEngine';
import { getGuardianFacingSafeSummary, getStudentFacingHiddenSummary, getTeacherFacingSafeSummary } from '../services/hiddenStudentStateEngine';
import { getProgressInsight, getProgressState } from '../services/progressEngine';

type ProgressScreenProps = {
  onBack: () => void;
};

export default function ProgressScreen({ onBack }: ProgressScreenProps) {
  const [studyStreak, setStudyStreak] = React.useState<number>(3);
  const snapshot = getProgressState();
  const insight = getProgressInsight();
  const studentReflection = getStudentFacingHiddenSummary();
  const teacherPreview = getTeacherFacingSafeSummary();
  const guardianPreview = getGuardianFacingSafeSummary();
  const adaptivePath = getStudentPathLabel();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Learning Progress</Text>
      <Text style={styles.subtitle}>{student.name} | {lesson.subject}</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Current Mastery</Text>
        <Text style={styles.metric}>{insight.masteryLevel}%</Text>
        <Text style={styles.cardText}>Quiz attempts: {snapshot.quizAttempts}</Text>
        <Text style={styles.cardText}>Correct answers: {snapshot.quizCorrect}</Text>
        <Text style={styles.cardText}>Learning path state: {insight.learningPathState}</Text>
        <Text style={styles.cardText}>Study streak: {studyStreak} days</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Strengths</Text>
        {insight.strengths.map((item) => (
          <Text key={item} style={styles.cardText}>- {item}</Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Weak Areas</Text>
        {insight.weakAreas.map((item) => (
          <Text key={item} style={styles.cardText}>- {item}</Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Next Recommendation</Text>
        <Text style={styles.cardText}>{insight.nextRecommendation}</Text>
        <Text style={styles.cardText}>Current path: {adaptivePath}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>My Learning Reflection</Text>
        <Text style={styles.cardText}>{studentReflection}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Teacher Summary Preview</Text>
        <Text style={styles.cardText}>{teacherPreview}</Text>
        <Text style={styles.cardText}>Guardian preview: {guardianPreview}</Text>
      </View>

      <View style={styles.row}>
        <Pressable style={styles.actionButton} onPress={() => setStudyStreak((prev) => prev + 1)}>
          <Text style={styles.buttonText}>Check In Today</Text>
        </Pressable>
      </View>

      <Pressable style={styles.backButton} onPress={onBack}>
        <Text style={styles.buttonText}>Back Home</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: (StatusBar.currentHeight ?? 0) + 8,
    paddingHorizontal: 16,
    paddingBottom: 28,
    backgroundColor: '#f4f7fb'
  },
  title: { fontSize: 24, fontWeight: '700', color: '#0f172a' },
  subtitle: { marginTop: 4, color: '#64748b' },
  card: { marginTop: 12, backgroundColor: '#ffffff', borderRadius: 12, padding: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1f2937', marginBottom: 8 },
  metric: { fontSize: 20, fontWeight: '700', color: '#2563eb', marginBottom: 6 },
  cardText: { fontSize: 14, color: '#475569', marginBottom: 4, lineHeight: 20 },
  row: { marginTop: 12, flexDirection: 'row', gap: 8 },
  actionButton: { flex: 1, backgroundColor: '#0ea5e9', borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  backButton: { marginTop: 14, backgroundColor: '#0f172a', borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  buttonText: { color: '#ffffff', fontWeight: '700' }
});

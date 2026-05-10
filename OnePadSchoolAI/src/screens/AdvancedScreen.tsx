import React from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { lesson, student } from '../data/mockData';
import { getProgressInsight } from '../services/progressEngine';

type AdvancedScreenProps = {
  onBack: () => void;
};

export default function AdvancedScreen({ onBack }: AdvancedScreenProps) {
  const insight = getProgressInsight();
  const canChallenge = insight.masteryLevel >= 80;
  const [status, setStatus] = React.useState<string>('');

  const handlePrimaryAction = () => {
    if (canChallenge) {
      setStatus(`Challenge started for lesson "${lesson.title}".`);
      return;
    }
    setStatus(`Foundation review recommended for "${lesson.title}" before challenge.`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Advanced Challenge</Text>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Student Context</Text>
        <Text style={styles.cardText}>{student.name}</Text>
        <Text style={styles.cardText}>Lesson: {lesson.subject} - {lesson.title}</Text>
        <Text style={styles.cardText}>Mastery: {insight.masteryLevel}%</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Adaptive Recommendation</Text>
        <Text style={styles.cardText}>
          {canChallenge
            ? 'You are ready for advanced challenge tasks.'
            : 'You should review foundation concepts before advanced challenge.'}
        </Text>
      </View>

      <Pressable style={styles.primaryButton} onPress={handlePrimaryAction}>
        <Text style={styles.buttonText}>
          {canChallenge ? 'Open Advanced Challenge' : 'Open Foundation Review'}
        </Text>
      </Pressable>

      {status ? <Text style={styles.statusText}>{status}</Text> : null}

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
  card: { marginTop: 12, backgroundColor: '#ffffff', borderRadius: 12, padding: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1f2937', marginBottom: 8 },
  cardText: { color: '#475569', marginBottom: 4 },
  primaryButton: {
    marginTop: 12,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center'
  },
  statusText: { marginTop: 10, color: '#0f766e', fontWeight: '600' },
  backButton: {
    marginTop: 12,
    backgroundColor: '#0f172a',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center'
  },
  buttonText: { color: '#ffffff', fontWeight: '700' }
});

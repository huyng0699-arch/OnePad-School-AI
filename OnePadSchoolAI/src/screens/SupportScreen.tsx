import React from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { student } from '../data/mockData';
import { recordSupportSignal } from '../services/hiddenStudentStateEngine';
import { studentEventCollector } from '../services/sync/studentEventCollector';

type SupportScreenProps = {
  onBack: () => void;
};

const OPTIONS = [
  'I do not understand the lesson',
  'I need teacher help',
  'I want to talk privately',
  'I have a problem at school'
];

type LocalSupportRequest = {
  studentId: string;
  studentName: string;
  issue: string;
  createdAt: string;
};

export default function SupportScreen({ onBack }: SupportScreenProps) {
  const [selectedIssue, setSelectedIssue] = React.useState<string>(OPTIONS[0]);
  const [summary, setSummary] = React.useState<string>('');

  const submitSupport = () => {
    const payload: LocalSupportRequest = {
      studentId: student.id,
      studentName: student.name,
      issue: selectedIssue,
      createdAt: new Date().toISOString()
    };

    setSummary(
      `Safe summary: ${payload.studentName} requested support for "${payload.issue}". Request created at ${payload.createdAt}.`
    );
    recordSupportSignal(payload.issue);
    if (selectedIssue === 'I need teacher help') {
      void studentEventCollector.recordTeacherHelpRequested('Student requested teacher help from support screen.');
      return;
    }
    if (selectedIssue === 'I want to talk privately' || selectedIssue === 'I have a problem at school') {
      void studentEventCollector.recordSupportRequested(`Support request: ${selectedIssue}`, 'private');
      return;
    }
    void studentEventCollector.recordSupportRequested(`Support request: ${selectedIssue}`, 'sensitive');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Support Center</Text>
      <Text style={styles.subtitle}>Create a safe support request</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Student</Text>
        <Text style={styles.cardText}>{student.name}</Text>
        <Text style={styles.cardText}>Grade {student.grade}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Support Options</Text>
        {OPTIONS.map((option) => (
          <Pressable
            key={option}
            style={[styles.optionButton, selectedIssue === option ? styles.optionSelected : null]}
            onPress={() => setSelectedIssue(option)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.submitButton} onPress={submitSupport}>
        <Text style={styles.buttonText}>Submit Support Request</Text>
      </Pressable>

      {summary ? (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Safe Summary</Text>
          <Text style={styles.summaryText}>{summary}</Text>
        </View>
      ) : null}

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
  cardText: { color: '#475569', marginBottom: 4 },
  optionButton: {
    backgroundColor: '#f8fafc',
    borderColor: '#dbe3ef',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 8
  },
  optionSelected: { borderColor: '#2563eb', backgroundColor: '#eaf2ff' },
  optionText: { color: '#1f2937', fontWeight: '600' },
  submitButton: {
    marginTop: 12,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center'
  },
  summaryCard: { marginTop: 12, backgroundColor: '#ecfeff', borderRadius: 10, padding: 12 },
  summaryTitle: { color: '#0e7490', fontWeight: '700', marginBottom: 4 },
  summaryText: { color: '#155e75' },
  backButton: {
    marginTop: 12,
    backgroundColor: '#0f172a',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center'
  },
  buttonText: { color: '#ffffff', fontWeight: '700' }
});

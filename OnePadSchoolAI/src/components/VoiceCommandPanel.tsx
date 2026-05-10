import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { voiceCommandController } from '../services/voice/voiceCommandController';
import { inferIntentFromTranscript, toLegacyCommand } from '../services/voice/voiceCommandRouter';
import { getGemmaAudioStatus } from '../services/voice/cactusGemmaAudioService';
import type { VoiceCommandResult as LegacyVoiceCommandResult } from '../services/voiceLocalCommandMatcher';

type VoiceCommandPanelProps = {
  currentScreen: string;
  currentLessonTitle?: string;
  currentPageNumber?: number;
  onExecute: (command: LegacyVoiceCommandResult) => void;
};

export default function VoiceCommandPanel({ currentScreen, currentLessonTitle, currentPageNumber, onExecute }: VoiceCommandPanelProps) {
  const [snapshot, setSnapshot] = React.useState(voiceCommandController.getState());
  const [detected, setDetected] = React.useState<LegacyVoiceCommandResult | null>(null);

  React.useEffect(() => voiceCommandController.subscribe(setSnapshot), []);

  React.useEffect(() => {
    const run = async () => {
      if (!snapshot.lastTranscript.trim()) return;
      const parsed = await inferIntentFromTranscript(snapshot.lastTranscript, currentScreen, currentLessonTitle, currentPageNumber);
      setDetected(toLegacyCommand(parsed));
    };
    void run();
  }, [snapshot.lastTranscript, currentLessonTitle, currentPageNumber, currentScreen]);

  const start = async () => {
    setDetected(null);
    await voiceCommandController.startListening();
  };

  const stop = async () => {
    await voiceCommandController.stopListening({ currentScreen, currentLessonTitle, currentPageNumber });
  };

  const statusPill = snapshot.state === 'processing'
    ? snapshot.engine === 'gemma_audio' ? 'Processing with local AI' : 'Processing with Whisper'
    : snapshot.state === 'hearing_speech'
      ? 'Hearing speech'
      : snapshot.state === 'listening'
        ? 'Listening'
        : snapshot.state === 'ready'
          ? 'Ready'
          : snapshot.state === 'error'
            ? 'Error'
            : 'Idle';

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Voice Command</Text>
      <Text style={styles.pill}>{statusPill}</Text>

      {snapshot.engine === 'gemma_audio' && getGemmaAudioStatus() === 'not_available' ? (
        <Text style={styles.warn}>Gemma audio input is not available in this build. You can switch to Whisper Transcription in Voice Engine Settings.</Text>
      ) : null}

      {snapshot.engine === 'whisper_transcription' && snapshot.engineStatus !== 'ready' ? (
        <Text style={styles.warn}>Whisper model is not downloaded.</Text>
      ) : null}

      <View style={styles.row}>
        <Pressable style={styles.primary} onPress={() => void start()}><Text style={styles.btnText}>Start Listening</Text></Pressable>
        <Pressable style={styles.secondary} onPress={() => void stop()}><Text style={styles.btnText}>Stop</Text></Pressable>
        <Pressable style={styles.cancel} onPress={() => void voiceCommandController.cancel()}><Text style={styles.btnText}>Cancel</Text></Pressable>
      </View>

      <Text style={styles.meta}>Heard: {snapshot.lastTranscript || '-'}</Text>

      {detected ? (
        <View style={styles.detectCard}>
          <Text style={styles.meta}>Intent: {detected.action}</Text>
          <Text style={styles.meta}>Target: {detected.target ?? '-'}</Text>
          <Text style={styles.meta}>Confidence: {detected.confidence.toFixed(2)}</Text>
          <Text style={styles.meta}>Engine used: {snapshot.engine}</Text>
          <Text style={styles.meta}>Latency: {snapshot.lastLatencyMs} ms</Text>
          <View style={styles.row}>
            <Pressable style={styles.primary} onPress={() => onExecute(detected)}><Text style={styles.btnText}>Run action</Text></Pressable>
            <Pressable style={styles.cancel} onPress={() => setDetected(null)}><Text style={styles.btnText}>Cancel</Text></Pressable>
          </View>
        </View>
      ) : null}
      {snapshot.lastError ? <Text style={styles.error}>{snapshot.lastError}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginTop: 8 },
  title: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  pill: { marginTop: 8, color: '#1e3a8a', fontWeight: '700' },
  warn: { marginTop: 8, color: '#b45309' },
  error: { marginTop: 8, color: '#b91c1c' },
  row: { flexDirection: 'row', gap: 8, marginTop: 8 },
  primary: { backgroundColor: '#2563eb', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, flex: 1, alignItems: 'center' },
  secondary: { backgroundColor: '#475569', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, flex: 1, alignItems: 'center' },
  cancel: { backgroundColor: '#94a3b8', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, flex: 1, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
  meta: { marginTop: 6, color: '#334155' },
  detectCard: { marginTop: 10, backgroundColor: '#f8fafc', borderRadius: 10, padding: 10 }
});

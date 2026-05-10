import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { voiceCommandController } from '../services/voice/voiceCommandController';
import { getGemmaAudioStatus } from '../services/voice/cactusGemmaAudioService';
import { checkModelStatus, deleteModel, downloadModel, getStorageUsed, subscribeDownloadProgress } from '../services/voice/whisperModelDownloadService';
import type { VoiceEngine } from '../services/voice/voiceTypes';

export default function VoiceEngineSettingsPanel() {
  const [snapshot, setSnapshot] = React.useState(voiceCommandController.getState());
  const [storage, setStorage] = React.useState(0);
  const [progress, setProgress] = React.useState<number | null>(null);

  React.useEffect(() => {
    const unsub = voiceCommandController.subscribe(setSnapshot);
    const unsubProgress = subscribeDownloadProgress((p) => setProgress(p));
    void refresh();
    return () => {
      unsub();
      unsubProgress();
    };
  }, []);

  const refresh = async () => {
    const bytes = await getStorageUsed();
    setStorage(bytes);
    setSnapshot(voiceCommandController.getState());
  };

  const choose = async (engine: VoiceEngine) => {
    await voiceCommandController.setVoiceEngine(engine);
    await refresh();
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Voice Engine Settings</Text>
      <Text style={styles.desc}>Choose how OnePad understands your voice commands.</Text>

      <Pressable style={[styles.radio, snapshot.engine === 'gemma_audio' ? styles.active : null]} onPress={() => void choose('gemma_audio')}>
        <Text style={styles.radioTitle}>AI Voice Understanding</Text>
        <Text style={styles.meta}>Uses local Gemma audio understanding through Cactus when available.</Text>
        <Text style={styles.meta}>Mic ? VAD ? Gemma 4 audio ? intent/action</Text>
        <Text style={styles.meta}>Status: {getGemmaAudioStatus() === 'not_available' ? 'Not available' : 'Ready'}</Text>
      </Pressable>

      <Pressable style={[styles.radio, snapshot.engine === 'whisper_transcription' ? styles.active : null]} onPress={() => void choose('whisper_transcription')}>
        <Text style={styles.radioTitle}>Whisper Transcription</Text>
        <Text style={styles.meta}>Uses local Whisper to convert speech to text, then routes the transcript to the app command system.</Text>
        <Text style={styles.meta}>Mic ? VAD ? Whisper ? transcript ? command router</Text>
        <Text style={styles.meta}>Status: {snapshot.engine === 'whisper_transcription' ? snapshot.engineStatus : 'Not downloaded'}</Text>
      </Pressable>

      <Text style={styles.meta}>Current engine: {snapshot.engine}</Text>
      <Text style={styles.meta}>Engine status: {String(snapshot.engineStatus)}</Text>
      <Text style={styles.meta}>Last transcript: {snapshot.lastTranscript || '-'}</Text>
      <Text style={styles.meta}>Last detected action: {snapshot.lastDetectedAction || '-'}</Text>
      <Text style={styles.meta}>Last confidence: {snapshot.lastConfidence.toFixed(2)}</Text>
      <Text style={styles.meta}>Last latency: {snapshot.lastLatencyMs} ms</Text>

      {snapshot.engine === 'gemma_audio' && getGemmaAudioStatus() === 'not_available' ? (
        <Text style={styles.warn}>Gemma audio input is not available in this build.</Text>
      ) : null}

      {snapshot.engine === 'whisper_transcription' ? (
        <>
          <View style={styles.row}>
            <Pressable style={styles.primary} onPress={() => void downloadModel().then(refresh)}><Text style={styles.btnText}>Download Whisper Model</Text></Pressable>
            <Pressable style={styles.cancel} onPress={() => void deleteModel().then(refresh)}><Text style={styles.btnText}>Delete Whisper Model</Text></Pressable>
          </View>
          <Pressable style={styles.secondary} onPress={() => void voiceCommandController.startListening()}><Text style={styles.btnText}>Test Whisper Transcription</Text></Pressable>
          <Text style={styles.meta}>Whisper storage: {(storage / (1024 * 1024)).toFixed(1)} MB</Text>
          {progress != null ? <Text style={styles.meta}>Download progress: {progress}%</Text> : null}
        </>
      ) : null}

      <Pressable style={styles.secondary} onPress={() => void voiceCommandController.startListening()}><Text style={styles.btnText}>Test Voice</Text></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginTop: 8 },
  title: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  desc: { marginTop: 6, color: '#475569' },
  radio: { marginTop: 8, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 10 },
  active: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  radioTitle: { color: '#0f172a', fontWeight: '700' },
  meta: { marginTop: 6, color: '#334155' },
  warn: { marginTop: 8, color: '#b45309' },
  row: { flexDirection: 'row', gap: 8, marginTop: 8 },
  primary: { flex: 1, backgroundColor: '#2563eb', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  secondary: { marginTop: 8, backgroundColor: '#475569', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  cancel: { flex: 1, backgroundColor: '#94a3b8', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' }
});

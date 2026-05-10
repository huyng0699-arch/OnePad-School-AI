import React from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { lesson } from '../data/mockData';
import { generateAiResponse } from '../services/ai/aiClient';
import { buildQuizPrompt, buildTranscriptSummaryPrompt } from '../services/ai/aiPromptBuilder';
import { buildAiContext } from '../services/aiContextBuilder';
import { parseAiQuizResponse } from '../services/aiQuizParser';
import { setPendingQuizSession } from '../services/quizSessionService';
import { checkModelStatus, deleteModel, downloadModel, getStorageUsed, subscribeDownloadProgress } from '../services/voice/whisperModelDownloadService';
import { listenWithWhisperOnce } from '../services/whisperVoiceService';
import type { DemoQuizQuestion } from '../services/quizEngine';

type LectureRecorderScreenProps = {
  onBack: () => void;
  onNavigateQuiz?: () => void;
};

export default function LectureRecorderScreen({ onBack, onNavigateQuiz }: LectureRecorderScreenProps) {
  const [modelStatus, setModelStatus] = React.useState('not_downloaded');
  const [downloadProgress, setDownloadProgress] = React.useState<number | null>(null);
  const [storageUsed, setStorageUsed] = React.useState(0);
  const [isRecording, setIsRecording] = React.useState(false);
  const [savedAudio, setSavedAudio] = React.useState('No audio saved yet.');
  const [transcript, setTranscript] = React.useState('');
  const [summary, setSummary] = React.useState('');
  const [keyPoints, setKeyPoints] = React.useState('');
  const [quizPreview, setQuizPreview] = React.useState('');
  const [status, setStatus] = React.useState('');

  const refresh = React.useCallback(async () => {
    setModelStatus(await checkModelStatus());
    setStorageUsed(await getStorageUsed());
  }, []);

  React.useEffect(() => {
    const unsub = subscribeDownloadProgress((p: number) => setDownloadProgress(p));
    void refresh();
    return () => unsub();
  }, [refresh]);

  const startRecording = () => {
    setIsRecording(true);
    setStatus('Recording started.');
  };

  const stopRecording = () => {
    setIsRecording(false);
    setStatus('Recording stopped.');
  };

  const saveAudio = () => {
    setSavedAudio(`Saved at ${new Date().toLocaleTimeString('en-US')}`);
  };

  const transcribe = async () => {
    try {
      const result = await listenWithWhisperOnce(10000);
      if (!result.ok || !result.transcript?.trim()) {
        setStatus(result.message ?? 'Whisper did not return transcript.');
        return;
      }
      setTranscript(result.transcript);
      setStatus('Transcript generated with Whisper.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Whisper transcription failed.');
    }
  };

  const summarizeTranscript = async () => {
    const context = buildAiContext({ action: 'transcript_summary', contextMode: 'transcript', transcript, lesson });
    const prompt = buildTranscriptSummaryPrompt(context.contextText);
    const result = await generateAiResponse({ action: 'transcript_summary', contextMode: 'transcript', prompt, contextText: context.contextText, lessonId: lesson.id });
    setSummary(result.ok ? result.text ?? '' : result.error ?? 'Unable to summarize transcript.');
  };

  const createKeyPoints = async () => {
    const result = await generateAiResponse({ action: 'chat', contextMode: 'transcript', prompt: `Create concise key points from this transcript:\n${transcript}`, contextText: transcript, lessonId: lesson.id });
    setKeyPoints(result.ok ? result.text ?? '' : result.error ?? 'Unable to create key points.');
  };

  const createQuiz = async () => {
    const prompt = buildQuizPrompt(transcript, { quizMode: 'quick' });
    const result = await generateAiResponse({ action: 'quiz', contextMode: 'quiz', prompt, contextText: transcript, lessonId: lesson.id });
    if (!result.ok) {
      setQuizPreview(result.error ?? 'Unable to create quiz.');
      return;
    }
    const parsed = parseAiQuizResponse(result.text ?? '');
    if (!parsed.ok || parsed.questions.length === 0) {
      setQuizPreview(parsed.ok ? 'No quiz generated.' : parsed.error);
      return;
    }
    const mapped: DemoQuizQuestion[] = parsed.questions.map((item) => ({ ...item }));
    setPendingQuizSession({ source: 'transcript', lessonId: lesson.id, questions: mapped });
    setQuizPreview(JSON.stringify(parsed.questions.slice(0, 3), null, 2));
    if (onNavigateQuiz) onNavigateQuiz();
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 16 : 0}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Lecture Recorder</Text>

        <View style={styles.card}>
          <Text style={styles.section}>Section 1: Whisper Model</Text>
          <Text style={styles.text}>Status: {modelStatus}</Text>
          <Text style={styles.text}>Storage used: {(storageUsed / (1024 * 1024)).toFixed(1)} MB</Text>
          {downloadProgress != null ? <Text style={styles.text}>Download: {downloadProgress}%</Text> : null}
          <View style={styles.row}>
            <Pressable style={styles.primary} onPress={() => void downloadModel().then(refresh)}><Text style={styles.btn}>Download Whisper Model</Text></Pressable>
            <Pressable style={styles.secondary} onPress={() => void deleteModel().then(refresh)}><Text style={styles.btn}>Delete Model</Text></Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>Section 2: Recorder</Text>
          <View style={styles.row}>
            <Pressable style={styles.primary} onPress={startRecording}><Text style={styles.btn}>Start Recording</Text></Pressable>
            <Pressable style={styles.secondary} onPress={stopRecording}><Text style={styles.btn}>Stop Recording</Text></Pressable>
          </View>
          <Pressable style={styles.primarySingle} onPress={saveAudio}><Text style={styles.btn}>Save Audio</Text></Pressable>
          <Pressable style={styles.primarySingle} onPress={() => void transcribe()}><Text style={styles.btn}>Transcribe with Whisper</Text></Pressable>
          <Text style={styles.text}>Recorder status: {isRecording ? 'Recording' : 'Idle'}</Text>
          <Text style={styles.text}>Saved audio: {savedAudio}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>Section 3: Transcript</Text>
          <TextInput style={styles.input} multiline value={transcript} onChangeText={setTranscript} placeholder="Transcript text..." />
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>Section 4: AI Actions</Text>
          <Pressable style={styles.primarySingle} onPress={() => void summarizeTranscript()}><Text style={styles.btn}>Summarize Transcript</Text></Pressable>
          <Pressable style={styles.primarySingle} onPress={() => void createKeyPoints()}><Text style={styles.btn}>Create Key Points</Text></Pressable>
          <Pressable style={styles.primarySingle} onPress={() => void createQuiz()}><Text style={styles.btn}>Create Quiz</Text></Pressable>
          <Pressable style={styles.secondarySingle} onPress={() => setStatus(`Transcript attached to lesson: ${lesson.title}`)}><Text style={styles.btn}>Attach to Current Lesson</Text></Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>Section 5: Output</Text>
          <Text style={styles.text}>Summary</Text>
          <Text style={styles.output}>{summary || '-'}</Text>
          <Text style={styles.text}>Key points</Text>
          <Text style={styles.output}>{keyPoints || '-'}</Text>
          <Text style={styles.text}>Quiz preview</Text>
          <Text style={styles.output}>{quizPreview || '-'}</Text>
        </View>

        {status ? <Text style={styles.status}>{status}</Text> : null}
        <Pressable style={styles.back} onPress={onBack}><Text style={styles.btn}>Back Home</Text></Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  container: { paddingTop: (StatusBar.currentHeight ?? 0) + 8, paddingHorizontal: 16, paddingBottom: 28 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 10 },
  card: { marginTop: 10, backgroundColor: '#f8fafc', borderRadius: 10, padding: 12 },
  section: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  text: { marginTop: 6, color: '#334155' },
  row: { flexDirection: 'row', gap: 8, marginTop: 10 },
  primary: { flex: 1, backgroundColor: '#2563eb', borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  secondary: { flex: 1, backgroundColor: '#64748b', borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  primarySingle: { marginTop: 8, backgroundColor: '#2563eb', borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  secondarySingle: { marginTop: 8, backgroundColor: '#64748b', borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  btn: { color: '#fff', fontWeight: '700' },
  input: { marginTop: 8, minHeight: 120, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10, color: '#0f172a', textAlignVertical: 'top', backgroundColor: '#fff' },
  output: { marginTop: 4, color: '#334155' },
  status: { marginTop: 10, color: '#0f766e' },
  back: { marginTop: 14, backgroundColor: '#0f172a', borderRadius: 10, paddingVertical: 12, alignItems: 'center' }
});

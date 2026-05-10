import React from 'react';
import * as Speech from 'expo-speech';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { lesson, mastery, student } from '../data/mockData';
import { buildChatPrompt, buildDailyTrainingPlanPrompt } from '../services/ai/aiPromptBuilder';
import { buildAiContext } from '../services/aiContextBuilder';
import { recordAiTutorSignal } from '../services/hiddenStudentStateEngine';
import { getActiveKnowledgeScope } from '../services/aiSettingsService';
import { runStudentAgentTurn } from '../services/agents/studentAgentOrchestrator';
import { studentEventCollector } from '../services/sync/studentEventCollector';
import { buildLessonContextSlice } from '../services/lessonEngine';
import { getActiveMockLesson } from '../services/lessons/mockLessonRuntimeStore';
import { getBottomInset, getTopInset } from '../services/mobileViewport';
import { downloadWhisperModel, getWhisperStatus, listenWithWhisperOnce, speakWithAndroidTts, subscribeVoiceEvents } from '../services/whisperVoiceService';
import { normalizeAiOutputForSpeech } from '../services/aiOutputNormalizer';

type AiTutorScreenProps = {
  onBack: () => void;
};

type ChatRole = 'user' | 'assistant' | 'system';
type ChatMessage = { id: string; role: ChatRole; text: string };

const QUICK_PROMPTS = [
  'Help me make a study plan',
  'How should I review today?',
  "I don't understand my lesson",
  'Give me study tips'
];

export default function AiTutorScreen({ onBack }: AiTutorScreenProps) {
  const [inputText, setInputText] = React.useState<string>('');
  const [isSending, setIsSending] = React.useState<boolean>(false);
  const [isListening, setIsListening] = React.useState<boolean>(false);
  const [isDownloadingWhisper, setIsDownloadingWhisper] = React.useState<boolean>(false);
  const [isWhisperInstalled, setIsWhisperInstalled] = React.useState<boolean>(false);
  const [voiceStatus, setVoiceStatus] = React.useState<string>('');
  const [heardLines, setHeardLines] = React.useState<string[]>([]);
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: 'intro',
      role: 'system',
      text: 'Hi! I am your general AI tutor. Ask me anything about study skills or learning guidance.'
    }
  ]);
  const sendLockRef = React.useRef(false);
  const ttsQueueRef = React.useRef<string[]>([]);
  const ttsSpeakingRef = React.useRef(false);

  React.useEffect(() => {
    let mounted = true;
    const loadVoiceStatus = async () => {
      const status = await getWhisperStatus();
      if (!mounted) return;
      setIsWhisperInstalled(status.ok);
      setVoiceStatus(status.ok ? `Whisper ready: ${status.language} / ${status.modelName ?? 'model loaded'}` : status.message ?? 'Whisper is not ready.');
    };
    void loadVoiceStatus();
    const unsubscribe = subscribeVoiceEvents((event) => {
      if (!event.text) return;
      if (event.type === 'download') {
        setVoiceStatus(event.text);
        setHeardLines((prev) => [`download: ${event.text}`, ...prev.filter((line) => !line.startsWith('download:'))].slice(0, 4));
        return;
      }
      setHeardLines((prev) => [`${event.type ?? 'heard'}: ${event.text}`, ...prev].slice(0, 4));
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const sendMessage = async (text: string, options: { speakReply?: boolean } = {}) => {
    const trimmed = text.trim();
    if (!trimmed || isSending || sendLockRef.current) {
      return;
    }
    sendLockRef.current = true;

    const assistantId = `a-${Date.now()}`;
    const nextMessages = [
      ...messages,
      { id: `u-${Date.now()}`, role: 'user' as const, text: trimmed },
      { id: assistantId, role: 'assistant' as const, text: '' }
    ];
    recordAiTutorSignal(trimmed);
    void studentEventCollector.recordAiTutorUsed({ action: 'chat', messageLength: trimmed.length });
    const lower = trimmed.toLowerCase();
    if (lower.includes("i don't understand") || lower.includes('em không hiểu')) {
      void studentEventCollector.recordLowConfidenceSignal('Student repeated not-understand intent in AI Tutor.');
    }
    if (lower.includes('khó quá')) {
      void studentEventCollector.recordFrustrationSignal('Student expressed frustration in AI Tutor.');
    }
    setMessages(nextMessages);
    setInputText('');
    setIsSending(true);

    try {
      let streamedText = '';
      let ttsBuffer = '';
      let sawToken = false;

      const flushTtsQueue = () => {
        if (ttsSpeakingRef.current) return;
        const next = ttsQueueRef.current.shift();
        if (!next) return;
        ttsSpeakingRef.current = true;
        Speech.speak(next, {
          language: 'vi-VN',
          rate: 0.95,
          pitch: 1,
          onDone: () => {
            ttsSpeakingRef.current = false;
            flushTtsQueue();
          },
          onStopped: () => {
            ttsSpeakingRef.current = false;
          },
          onError: () => {
            ttsSpeakingRef.current = false;
            flushTtsQueue();
          }
        });
      };

      const queueTtsChunk = (chunk: string) => {
        const cleaned = chunk.replace(/\s+/g, ' ').trim();
        if (!cleaned) return;
        ttsQueueRef.current.push(cleaned);
        flushTtsQueue();
      };

      const onToken = (token: string) => {
        if (!token) return;
        sawToken = true;
        streamedText += token;
        setMessages((prev) =>
          prev.map((item) =>
            item.id === assistantId
              ? { ...item, text: streamedText }
              : item
          )
        );
        if (!options.speakReply) return;
        ttsBuffer += token;
        if (/[.!?\n,;:]$/.test(ttsBuffer.trim()) || ttsBuffer.length >= 28) {
          queueTtsChunk(ttsBuffer);
          ttsBuffer = '';
        }
      };

      const activeLesson = getActiveMockLesson(lesson);
      const wantsDailyPlan = /plan|review today|study today|h[oô]m nay|ke hoach|k[eế] ho[aạ]ch|on tap/i.test(trimmed);
      const lessonSlice = buildLessonContextSlice(activeLesson, 0, 3600, 2);
      const context = buildAiContext({
        action: 'chat',
        contextMode: wantsDailyPlan ? 'lesson' : 'general',
        userText: trimmed,
        chatHistory: nextMessages.map((item) => ({ role: item.role, text: item.text })),
        lesson: activeLesson,
        selectedText: wantsDailyPlan ? lessonSlice.text : undefined
      });
      const prompt = wantsDailyPlan
        ? buildDailyTrainingPlanPrompt({
          studentName: student.name,
          grade: student.grade,
          selectedLessonTitle: activeLesson.title,
          selectedSubject: activeLesson.subject,
          recentActivity: [
            `Reviewed ${activeLesson.title} pages today`,
            `Last quiz mastery trend: ${mastery.level}%`,
            'Needs concise practice before longer tests'
          ],
          recentMasteryPercent: mastery.level,
          currentLessonSlice: context.contextText,
          userText: context.trimmedUserText
        })
        : buildChatPrompt({
          userText: context.trimmedUserText,
          contextMode: 'general',
          contextText: context.contextText,
          history: context.trimmedHistory
        });
      const turnResult = await runStudentAgentTurn({
        action: 'chat',
        contextMode: wantsDailyPlan ? 'lesson' : 'general',
        prompt,
        contextText: context.contextText,
        userText: context.trimmedUserText,
        onToken,
        metadata: {
          ...context.metadata,
          knowledgeScope: getActiveKnowledgeScope(),
          promptSkill: wantsDailyPlan ? 'daily_micro_training_planner' : undefined,
          pageNumbers: wantsDailyPlan ? lessonSlice.pageNumbers : undefined
        },
        studentId: 'stu_001',
        eventId: `ai_tutor_${Date.now()}`
      });
      const result = turnResult.response;
      const responseText = result.ok
        ? result.text
        : result.error === 'request_superseded'
          ? ''
        : `I could not generate a response. ${result.error}`;
      const finalText = sawToken ? (streamedText.trim() || responseText) : responseText;
      if (!finalText.trim()) {
        setMessages((prev) => prev.filter((item) => item.id !== assistantId));
        return;
      }
      setMessages((prev) =>
        prev.map((item) =>
          item.id === assistantId
            ? { ...item, text: finalText }
            : item
        )
      );
      if (options.speakReply) {
        if (ttsBuffer.trim()) {
          queueTtsChunk(ttsBuffer);
          ttsBuffer = '';
        } else if (!sawToken) {
          await speakWithAndroidTts(normalizeAiOutputForSpeech(finalText));
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMessages((prev) =>
        prev.map((item) =>
          item.id === assistantId
            ? { ...item, text: `I could not generate a response. ${errorMessage}` }
            : item
        )
      );
    } finally {
      setIsSending(false);
      sendLockRef.current = false;
    }
  };

  const listenAndSend = async () => {
    if (isListening || isSending) {
      return;
    }
    setIsListening(true);
    setHeardLines([]);
    setVoiceStatus('Recording with Whisper, then processing on device...');
    try {
      const result = await listenWithWhisperOnce(10000);
      if (!result.ok || !result.transcript?.trim()) {
        setVoiceStatus(result.message ?? 'Whisper did not hear a usable transcript.');
        return;
      }
      setVoiceStatus(`Whisper heard: ${result.transcript}`);
      setInputText(result.transcript);
      await sendMessage(result.transcript, { speakReply: true });
    } catch (error) {
      setVoiceStatus(error instanceof Error ? error.message : 'Whisper listen failed.');
    } finally {
      setIsListening(false);
    }
  };

  const downloadWhisper = async () => {
    if (isDownloadingWhisper) {
      return;
    }
    setIsDownloadingWhisper(true);
    setVoiceStatus('Downloading selected Whisper model. Keep the app open...');
    try {
      const result = await downloadWhisperModel();
      const status = await getWhisperStatus();
      setIsWhisperInstalled(status.ok);
      setVoiceStatus(result.message ?? (result.ok ? 'Whisper model installed.' : 'Whisper download failed.'));
    } finally {
      setIsDownloadingWhisper(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 16 : 0}
    >
      <View style={styles.header}>
        <Pressable onPress={onBack}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>AI Tutor</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.lessonContext}>
        <Text style={styles.contextTitle}>{student.name}</Text>
        <Text style={styles.contextText}>General AI Tutor mode</Text>
        <Text style={styles.voiceStatus}>{voiceStatus}</Text>
        <Pressable
          style={[styles.downloadButton, (isWhisperInstalled || isDownloadingWhisper) ? styles.downloadButtonMuted : null]}
          onPress={() => void downloadWhisper()}
          disabled={isWhisperInstalled || isDownloadingWhisper}
        >
          <Text style={styles.downloadButtonText}>
            {isWhisperInstalled ? 'Whisper Model Installed' : isDownloadingWhisper ? 'Downloading Whisper...' : 'Download Whisper Model'}
          </Text>
        </Pressable>
      </View>

      {heardLines.length > 0 ? (
        <View style={styles.heardBox}>
          <Text style={styles.heardTitle}>Whisper heard</Text>
          {heardLines.map((line, index) => (
            <Text key={`${line}-${index}`} style={styles.heardText}>{line}</Text>
          ))}
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.messagesWrap}>
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.bubble,
              message.role === 'user'
                ? styles.userBubble
                : message.role === 'assistant'
                  ? styles.assistantBubble
                  : styles.systemBubble
            ]}
          >
            <Text
              style={[
                styles.bubbleText,
                message.role === 'user' ? styles.userBubbleText : styles.otherBubbleText
              ]}
            >
              {message.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
        {QUICK_PROMPTS.map((chip) => (
          <Pressable key={chip} style={styles.chip} onPress={() => sendMessage(chip)}>
            <Text style={styles.chipText}>{chip}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask the tutor..."
          placeholderTextColor="#6b7280"
          value={inputText}
          onChangeText={setInputText}
          editable={!isSending}
        />
        <Pressable
          style={[styles.micButton, (isListening || isSending) ? styles.sendButtonDisabled : null]}
          onPress={() => void listenAndSend()}
          disabled={isListening || isSending}
        >
          <Text style={styles.sendButtonText}>{isListening ? '...' : 'Mic'}</Text>
        </Pressable>
        <Pressable
          style={[styles.sendButton, isSending ? styles.sendButtonDisabled : null]}
          onPress={() => sendMessage(inputText)}
          disabled={isSending}
        >
          <Text style={styles.sendButtonText}>{isSending ? 'Sending...' : 'Send'}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f4f7fb',
    paddingHorizontal: 14,
    paddingTop: getTopInset(),
    paddingBottom: getBottomInset()
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  backText: { color: '#2563eb', fontWeight: '700' },
  headerTitle: { fontSize: 18, color: '#0f172a', fontWeight: '700' },
  headerSpacer: { width: 32 },
  lessonContext: { backgroundColor: '#ffffff', borderRadius: 12, padding: 12, marginBottom: 10 },
  contextTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  contextText: { marginTop: 4, fontSize: 13, color: '#475569' },
  voiceStatus: { marginTop: 6, color: '#0f766e', fontSize: 12, fontWeight: '700' },
  downloadButton: {
    marginTop: 10,
    backgroundColor: '#0f766e',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center'
  },
  downloadButtonMuted: { backgroundColor: '#94a3b8' },
  downloadButtonText: { color: '#ffffff', fontWeight: '700' },
  heardBox: { backgroundColor: '#ecfeff', borderRadius: 12, padding: 10, marginBottom: 8 },
  heardTitle: { color: '#0e7490', fontWeight: '800', marginBottom: 4 },
  heardText: { color: '#155e75', fontSize: 12, marginTop: 2 },
  messagesWrap: { paddingVertical: 6, gap: 8, paddingBottom: 8 },
  bubble: { maxWidth: '86%', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#2563eb' },
  assistantBubble: { alignSelf: 'flex-start', backgroundColor: '#ffffff' },
  systemBubble: { alignSelf: 'center', backgroundColor: '#e2e8f0' },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  userBubbleText: { color: '#ffffff' },
  otherBubbleText: { color: '#1f2937' },
  chipsRow: { gap: 8, paddingVertical: 8 },
  chip: { backgroundColor: '#eaf2ff', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12 },
  chipText: { color: '#1e3a8a', fontSize: 12, fontWeight: '600' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: Platform.OS === 'android' ? 12 : 0
  },
  input: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dbe3ef',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#0f172a'
  },
  sendButton: { backgroundColor: '#2563eb', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14 },
  micButton: { backgroundColor: '#0f766e', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 },
  sendButtonDisabled: { backgroundColor: '#93c5fd' },
  sendButtonText: { color: '#ffffff', fontWeight: '700' }
});

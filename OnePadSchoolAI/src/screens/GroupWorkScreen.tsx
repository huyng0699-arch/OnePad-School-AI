import React from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { lesson, student } from '../data/mockData';
import { generateAiResponse } from '../services/ai/aiClient';
import { buildChatPrompt } from '../services/ai/aiPromptBuilder';
import { buildAiContext } from '../services/aiContextBuilder';
import {
  addGroupMessage,
  getActiveGroupAssignment,
  submitGroupAssignment,
  updateGroupSubmissionDraft,
  updateGroupTaskStatus
} from '../services/groupWorkService';
import { recordGroupWorkSignal } from '../services/hiddenStudentStateEngine';
import type { GroupTaskStatus } from '../types';
import { studentEventCollector } from '../services/sync/studentEventCollector';

type GroupWorkScreenProps = {
  onBack: () => void;
};

export default function GroupWorkScreen({ onBack }: GroupWorkScreenProps) {
  const [group, setGroup] = React.useState(() => getActiveGroupAssignment());
  const [messageText, setMessageText] = React.useState('');
  const [answerDraft, setAnswerDraft] = React.useState(group?.submission?.answerText ?? '');
  const [statusText, setStatusText] = React.useState('');
  const [aiOutput, setAiOutput] = React.useState('');
  const [isAiLoading, setIsAiLoading] = React.useState(false);

  if (!group) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.title}>Group Work</Text>
        <Text style={styles.body}>No group assignment is available right now.</Text>
        <Pressable style={styles.button} onPress={onBack}>
          <Text style={styles.buttonText}>Back Home</Text>
        </Pressable>
      </View>
    );
  }

  const refresh = () => setGroup(getActiveGroupAssignment());

  const updateTask = (taskId: string, status: GroupTaskStatus) => {
    updateGroupTaskStatus(group.id, taskId, status);
    setStatusText(`Task updated to ${status}.`);
    refresh();
  };

  const sendMessage = () => {
    if (!messageText.trim()) {
      return;
    }
    addGroupMessage(group.id, messageText.trim(), {
      id: student.id,
      name: student.name,
      role: 'leader'
    });
    recordGroupWorkSignal('group_participation');
    void studentEventCollector.recordGroupWorkActivity({ groupId: group.id, action: 'message_sent' });
    setMessageText('');
    setStatusText('Message sent to group discussion.');
    refresh();
  };

  const saveDraft = () => {
    updateGroupSubmissionDraft(group.id, answerDraft);
    recordGroupWorkSignal('collaboration_activity');
    void studentEventCollector.recordCollaborationActivity({ groupId: group.id, action: 'draft_saved' });
    setStatusText('Group answer draft saved.');
    refresh();
  };

  const submit = () => {
    submitGroupAssignment(group.id, student.id);
    recordGroupWorkSignal('assignment_submitted');
    void studentEventCollector.recordAssignmentSubmitted(group.id);
    setStatusText('Group work submitted in demo mode.');
    refresh();
  };

  const askAi = async (mode: 'summary' | 'outline') => {
    if (isAiLoading) {
      return;
    }
    setIsAiLoading(true);
    try {
      const discussionSlice = group.discussion.slice(-6).map((m) => `${m.senderName}: ${m.text}`).join('\n');
      const contextRaw = [
        `Assignment: ${group.title}`,
        `Instruction: ${group.instruction}`,
        `Expected output: ${group.expectedOutput}`,
        `Discussion:\n${discussionSlice}`,
        `Draft:\n${answerDraft}`
      ].join('\n');
      const context = buildAiContext({
        action: 'chat',
        contextMode: 'group_work',
        selectedText: contextRaw
      });
      const userText = mode === 'summary'
        ? 'Summarize this group discussion with 3 key points and one next step.'
        : 'Suggest a concise outline for the group answer.';
      const prompt = buildChatPrompt({
        userText,
        contextMode: 'lesson',
        contextText: context.contextText
      });
      const result = await generateAiResponse({
        action: 'chat',
        contextMode: 'group_work',
        lessonId: lesson.id,
        prompt,
        contextText: context.contextText,
        userText,
        metadata: context.metadata
      });
      setAiOutput(result.ok ? (result.text ?? 'AI response is empty.') : result.error);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Group Work</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{group.title}</Text>
        <Text style={styles.body}>{group.subject} • {group.teacherName} • Due {group.dueDate}</Text>
        <Text style={styles.body}>Status: {group.status}</Text>
        <Text style={styles.body}>{group.instruction}</Text>
        <Text style={styles.body}>Expected output: {group.expectedOutput}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Members</Text>
        {group.members.map((item) => (
          <Text key={item.id} style={styles.body}>{item.name} - {item.role}</Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Tasks</Text>
        {group.tasks.map((task) => (
          <View key={task.id} style={styles.taskRow}>
            <View style={styles.taskTextWrap}>
              <Text style={styles.body}>{task.title}</Text>
              <Text style={styles.meta}>Status: {task.status}</Text>
            </View>
            <View style={styles.taskButtons}>
              <Pressable style={styles.chip} onPress={() => updateTask(task.id, 'todo')}><Text style={styles.chipText}>To do</Text></Pressable>
              <Pressable style={styles.chip} onPress={() => updateTask(task.id, 'doing')}><Text style={styles.chipText}>Doing</Text></Pressable>
              <Pressable style={styles.chip} onPress={() => updateTask(task.id, 'done')}><Text style={styles.chipText}>Done</Text></Pressable>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Discussion</Text>
        {group.discussion.map((item) => (
          <Text key={item.id} style={styles.body}>[{item.createdAt}] {item.senderName}: {item.text}</Text>
        ))}
        <TextInput
          style={styles.input}
          placeholder="Write a group message..."
          placeholderTextColor="#6b7280"
          value={messageText}
          onChangeText={setMessageText}
        />
        <Pressable style={styles.button} onPress={sendMessage}>
          <Text style={styles.buttonText}>Send</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Group Answer</Text>
        <TextInput
          style={styles.textArea}
          multiline
          placeholder="Write the group answer..."
          placeholderTextColor="#6b7280"
          value={answerDraft}
          onChangeText={setAnswerDraft}
        />
        <Pressable style={styles.button} onPress={saveDraft}>
          <Text style={styles.buttonText}>Save Draft</Text>
        </Pressable>
        <Pressable style={styles.buttonSecondary} onPress={submit}>
          <Text style={styles.buttonText}>Submit Group Work</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>AI Assist (Optional)</Text>
        <Pressable style={styles.button} onPress={() => void askAi('summary')}>
          <Text style={styles.buttonText}>{isAiLoading ? 'Loading...' : 'Summarize Group Discussion'}</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => void askAi('outline')}>
          <Text style={styles.buttonText}>Suggest Group Answer Outline</Text>
        </Pressable>
        {aiOutput ? <Text style={styles.body}>{aiOutput}</Text> : null}
      </View>

      {statusText ? <Text style={styles.status}>{statusText}</Text> : null}
      <Pressable style={styles.backButton} onPress={onBack}>
        <Text style={styles.buttonText}>Back Home</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: (StatusBar.currentHeight ?? 0) + 8,
    paddingHorizontal: 16,
    paddingBottom: 28,
    backgroundColor: '#f4f7fb'
  },
  emptyWrap: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f7fb' },
  title: { fontSize: 24, fontWeight: '700', color: '#0f172a' },
  card: { marginTop: 12, backgroundColor: '#fff', borderRadius: 12, padding: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 6 },
  body: { color: '#334155', marginBottom: 4 },
  meta: { color: '#64748b', fontSize: 12 },
  taskRow: { marginBottom: 10 },
  taskTextWrap: { marginBottom: 6 },
  taskButtons: { flexDirection: 'row', gap: 6 },
  chip: { backgroundColor: '#e2e8f0', borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10 },
  chipText: { color: '#0f172a', fontWeight: '600', fontSize: 12 },
  input: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#dbe3ef',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    color: '#0f172a'
  },
  textArea: {
    marginTop: 8,
    minHeight: 90,
    borderWidth: 1,
    borderColor: '#dbe3ef',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    color: '#0f172a',
    textAlignVertical: 'top'
  },
  button: {
    marginTop: 8,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center'
  },
  buttonSecondary: {
    marginTop: 8,
    backgroundColor: '#0f766e',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center'
  },
  backButton: {
    marginTop: 12,
    backgroundColor: '#0f172a',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center'
  },
  buttonText: { color: '#fff', fontWeight: '700' },
  status: { marginTop: 10, color: '#0f766e', fontWeight: '600' }
});

import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { lesson } from '../data/mockData';
import {
  buildChatPrompt,
  buildExplainPrompt,
  buildQuizPrompt,
  buildSummarizePrompt
} from '../services/ai/aiPromptBuilder';
import { buildAiContext } from '../services/aiContextBuilder';
import { parseAiQuizResponse } from '../services/aiQuizParser';
import { consumePendingLessonCommand } from '../services/lessonCommandBridge';
import { buildFullLessonContext, buildLessonContextSlice, getCurrentLesson, getCurrentPage } from '../services/lessonEngine';
import { resolveLesson, toStudentLesson } from '../services/lessons/publishedLessonService';
import { getActivePublishedLessonId } from '../services/lessons/publishedLessonRuntimeStore';
import { getActiveMockLesson } from '../services/lessons/mockLessonRuntimeStore';
import { getBottomInset, getTopInset } from '../services/mobileViewport';
import type { DemoQuizQuestion } from '../services/quizEngine';
import { setPendingQuizSession } from '../services/quizSessionService';
import { studentEventCollector } from '../services/sync/studentEventCollector';
import { runStudentAgentTurn } from '../services/agents/studentAgentOrchestrator';
import { normalizeAiOutput } from '../services/aiOutputNormalizer';
import type { LessonBlock } from '../types';
import type { Lesson } from '../types';

type LessonReaderScreenProps = {
  onBack: () => void;
  onNavigateQuiz: () => void;
};

type ReaderAction = 'summarize' | 'explain' | 'quiz' | 'chat';
type ReaderViewMode = 'single_page' | 'full_lesson';

export default function LessonReaderScreen({ onBack, onNavigateQuiz }: LessonReaderScreenProps) {
  const [currentPageIndex, setCurrentPageIndex] = React.useState<number>(0);
  const [aiOutput, setAiOutput] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [loadingAction, setLoadingAction] = React.useState<ReaderAction | null>(null);
  const [liveLesson, setLiveLesson] = React.useState<Lesson | null>(null);
  const [toolsOpen, setToolsOpen] = React.useState<boolean>(false);
  const [viewMode, setViewMode] = React.useState<ReaderViewMode>('single_page');
  const activeActionIdRef = React.useRef(0);

  const currentLesson = liveLesson ?? getCurrentLesson(getActiveMockLesson(lesson));
  const currentPage = getCurrentPage(currentLesson, currentPageIndex);
  const fullLessonContext = React.useMemo(() => buildFullLessonContext(currentLesson, 12000), [currentLesson]);
  const mergedBlocks = React.useMemo(
    () =>
      currentLesson.pages.flatMap((page) => [
        { type: 'heading', text: `Page ${page.pageNumber}: ${page.title}` } as LessonBlock,
        ...page.blocks
      ]),
    [currentLesson]
  );
  const normalizedAiOutput = React.useMemo(() => normalizeAiOutput(aiOutput), [aiOutput]);

  React.useEffect(() => {
    let mounted = true;
    const loadPublished = async () => {
      const activeLessonId = getActivePublishedLessonId();
      if (!activeLessonId) return;
      const fetched = await resolveLesson(activeLessonId, null);
      if (!mounted || !fetched) return;
      const mapped = toStudentLesson(fetched);
      if (mapped.pages.length > 0) {
        setLiveLesson(mapped);
        setCurrentPageIndex(0);
      }
    };
    void loadPublished();
    return () => {
      mounted = false;
    };
  }, []);

  const runAIAction = async (action: ReaderAction) => {
    const pageContextText = viewMode === 'full_lesson' ? fullLessonContext : currentPage.aiText;
    if (!pageContextText.trim()) {
      setAiOutput('This page does not have enough lesson context for AI.');
      return;
    }

    const actionId = ++activeActionIdRef.current;
    setIsLoading(true);
    setLoadingAction(action);
    try {
      const questionHints = (viewMode === 'full_lesson' ? mergedBlocks : currentPage.blocks)
        .filter((block) => block.type === 'question')
        .map((block) => (block.type === 'question' ? block.question : ''));

      const quizSlice = buildLessonContextSlice(currentLesson, currentPageIndex, 4200, action === 'quiz' ? 3 : 1);
      const explainContext = action === 'explain' || action === 'summarize'
        ? pageContextText
        : action === 'quiz'
          ? (viewMode === 'full_lesson' ? fullLessonContext : quizSlice.text)
          : pageContextText;

      const prompt =
        action === 'summarize'
          ? buildSummarizePrompt(explainContext)
          : action === 'explain'
            ? buildExplainPrompt(explainContext)
              : action === 'quiz'
                ? buildQuizPrompt(explainContext, {
                  questionHints,
                  quizMode: 'quick',
                  questionCount: 3,
                  sourceScope: `Use only pages ${quizSlice.pageNumbers.join(', ')} from the selected lesson slice.`
                })
                : buildChatPrompt({
                  userText: 'Please explain this page to me.',
                  contextMode: 'lesson',
                  contextText: pageContextText
                });

      const context = buildAiContext({
        action,
        contextMode: action === 'chat' ? 'lesson' : action === 'quiz' ? 'quiz' : 'lesson',
        lesson: currentLesson,
        currentPage,
        selectedText: action === 'quiz' ? (viewMode === 'full_lesson' ? fullLessonContext : quizSlice.text) : undefined
      });
      const userText = action === 'chat' ? 'Please explain this page to me.' : undefined;
      const turnResult = await runStudentAgentTurn({
        action,
        contextMode: action === 'chat' ? 'lesson' : action === 'quiz' ? 'quiz' : 'lesson',
        lessonId: currentLesson.id,
        pageNumber: viewMode === 'full_lesson' ? 0 : currentPage.pageNumber,
        prompt,
        contextText: viewMode === 'full_lesson' ? fullLessonContext : context.contextText,
        userText,
        metadata: {
          ...context.metadata,
          knowledgeScope: 'lesson_only',
          lessonContextStrategy: viewMode === 'full_lesson' ? 'full_lesson' : action === 'quiz' ? 'sliced_pages' : 'current_page',
          pageNumbers: viewMode === 'full_lesson' ? currentLesson.pages.map((p) => p.pageNumber) : action === 'quiz' ? quizSlice.pageNumbers : [currentPage.pageNumber],
          fullLessonContextAvailable: true
        },
        studentId: 'stu_001',
        eventId: `lesson_${currentLesson.id}_${currentPage.pageNumber}_${Date.now()}`
      });
      const result = turnResult.response;
      if (actionId !== activeActionIdRef.current) {
        return;
      }
      if (!result.ok) {
        if (result.error === 'request_superseded') {
          return;
        }
        const normalizedError = (result.error ?? 'Unable to process AI action.').replace(
          'AI request timed out. Please check network/API and try again.',
          'AI request was interrupted before completion. Tap another tool to continue.'
        );
        setAiOutput(normalizedError);
        return;
      }

      if (action === 'quiz') {
        void studentEventCollector.recordAiTutorUsed({ action: 'create_quiz', lessonId: currentLesson.id, pageNumber: viewMode === 'full_lesson' ? 0 : currentPage.pageNumber });
        const parsed = parseAiQuizResponse(result.text ?? '');
        if (!parsed.ok) {
          setAiOutput('AI generated quiz text, but it could not be converted into interactive questions.');
          return;
        }
        if (parsed.questions.length === 0) {
          setAiOutput('AI returned an empty quiz from current context.');
          return;
        }

        const mappedQuestions: DemoQuizQuestion[] = parsed.questions.map((item) => ({
          id: item.id,
          type: item.type,
          question: item.question,
          options: item.options,
          correctAnswer: item.correctAnswer,
          expectedAnswer: item.expectedAnswer,
          rubric: item.rubric,
          explanation: item.explanation,
          difficulty: item.difficulty,
          sourcePage: item.sourcePage ?? currentPage.pageNumber
        }));
        setPendingQuizSession({
          source: 'ai',
          lessonId: currentLesson.id,
          pageNumber: viewMode === 'full_lesson' ? 0 : currentPage.pageNumber,
          questions: mappedQuestions
        });
        setAiOutput('Quiz created. Opening interactive quiz...');
        onNavigateQuiz();
        return;
      }
      void studentEventCollector.recordAiTutorUsed({ action, lessonId: currentLesson.id, pageNumber: viewMode === 'full_lesson' ? 0 : currentPage.pageNumber });

      setAiOutput(result.text ?? 'AI response is empty.');
    } catch (error) {
      if (actionId !== activeActionIdRef.current) {
        return;
      }
      const message = error instanceof Error ? error.message : 'Unable to process AI action.';
      setAiOutput(message);
    } finally {
      if (actionId === activeActionIdRef.current) {
        setIsLoading(false);
        setLoadingAction(null);
      }
    }
  };

  React.useEffect(() => {
    void studentEventCollector.recordLessonStarted(currentLesson.id, currentPage.pageNumber);
    if (currentPage.pageNumber === currentLesson.pages.length) {
      void studentEventCollector.recordLessonCompleted(currentLesson.id, currentPage.pageNumber);
    }
  }, [currentLesson.id, currentLesson.pages.length, currentPage.pageNumber]);

  React.useEffect(() => {
    const pending = consumePendingLessonCommand();
    if (!pending) {
      return;
    }
    if (pending === 'next_page') {
      setCurrentPageIndex((prev) => Math.min(prev + 1, currentLesson.pages.length - 1));
      return;
    }
    if (pending === 'previous_page') {
      setCurrentPageIndex((prev) => Math.max(prev - 1, 0));
      return;
    }
    if (pending === 'summarize_current_page') {
      void runAIAction('summarize');
      return;
    }
    if (pending === 'explain_current_page') {
      void runAIAction('explain');
      return;
    }
    if (pending === 'create_quiz_from_current_page') {
      void runAIAction('quiz');
    }
  }, [currentLesson.pages.length]);

  const renderBlock = (block: LessonBlock, index: number) => {
    if (block.type === 'heading') {
      return <Text key={`block-${index}`} style={styles.blockHeading}>{block.text}</Text>;
    }
    if (block.type === 'paragraph') {
      return <Text key={`block-${index}`} style={styles.blockParagraph}>{block.text}</Text>;
    }
    if (block.type === 'key_point') {
      return (
        <View key={`block-${index}`} style={styles.tagBoxBlue}>
          <Text style={styles.tagTextBlue}>Key Point: {block.text}</Text>
        </View>
      );
    }
    if (block.type === 'example') {
      return (
        <View key={`block-${index}`} style={styles.tagBoxGreen}>
          <Text style={styles.tagTextGreen}>Example: {block.text}</Text>
        </View>
      );
    }
    if (block.type === 'question') {
      return (
        <View key={`block-${index}`} style={styles.tagBoxAmber}>
          <Text style={styles.tagTextAmber}>Question: {block.question}</Text>
        </View>
      );
    }
    if (block.type === 'image') {
      return (
        <View key={`block-${index}`} style={styles.imageCard}>
          <View style={styles.imageMock}>
            <Text style={styles.imageMockText}>Image Preview</Text>
            <Text style={styles.imageMockText}>{block.imageUrl}</Text>
          </View>
          <Text style={styles.caption}>{block.caption}</Text>
          <Text style={styles.description}>{block.aiDescription}</Text>
        </View>
      );
    }

    return (
      <View key={`block-${index}`} style={styles.arCard}>
        <Text style={styles.arTitle}>AR Model: {block.label}</Text>
        <Text style={styles.arText}>URL: {block.modelUrl}</Text>
        <Text style={styles.arText}>{block.description}</Text>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.content} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.lessonTitle}>{currentLesson.title}</Text>
          <Text style={styles.lessonMeta}>{currentLesson.subject} - Grade {currentLesson.grade}</Text>
          <Text style={styles.pageMeta}>
            {viewMode === 'full_lesson'
              ? `Full lesson mode: ${currentLesson.pages.length} pages merged`
              : `Page ${currentPage.pageNumber}/${currentLesson.pages.length}: ${currentPage.title}`}
          </Text>
          <Text style={styles.readerStatus}>
            {viewMode === 'full_lesson' ? 'AI is reading the full lesson bundle' : `AI is reading Page ${currentPage.pageNumber}`}
          </Text>
        </View>

        <View style={styles.pageCard}>
          {(viewMode === 'full_lesson' ? mergedBlocks : currentPage.blocks).map((block, index) => renderBlock(block, index))}
        </View>

        <View style={styles.navigationRow}>
          <Pressable
            style={[styles.navButton, viewMode === 'single_page' ? null : styles.navButtonDisabled]}
            onPress={() => setViewMode((prev) => (prev === 'single_page' ? 'full_lesson' : 'single_page'))}
          >
            <Text style={styles.navButtonText}>{viewMode === 'single_page' ? 'Merge All Pages' : 'Single Page Mode'}</Text>
          </Pressable>
        </View>

        {viewMode === 'single_page' ? (
          <View style={styles.navigationRow}>
          <Pressable
            style={[styles.navButton, currentPageIndex === 0 ? styles.navButtonDisabled : null]}
            onPress={() => setCurrentPageIndex((prev) => Math.max(prev - 1, 0))}
            disabled={currentPageIndex === 0}
          >
            <Text style={styles.navButtonText}>Previous Page</Text>
          </Pressable>
          <Pressable
            style={[
              styles.navButton,
              currentPageIndex === currentLesson.pages.length - 1 ? styles.navButtonDisabled : null
            ]}
            onPress={() =>
              setCurrentPageIndex((prev) => Math.min(prev + 1, currentLesson.pages.length - 1))
            }
            disabled={currentPageIndex === currentLesson.pages.length - 1}
          >
            <Text style={styles.navButtonText}>Next Page</Text>
          </Pressable>
          </View>
        ) : null}

        <View style={styles.aiOutputCard}>
          <Text style={styles.aiOutputLabel}>AI Output</Text>
          {aiOutput ? (
            <View>
              {normalizedAiOutput.warning ? <Text style={styles.aiWarning}>{normalizedAiOutput.warning}</Text> : null}
              {normalizedAiOutput.title ? <Text style={styles.aiOutputTitle}>{normalizedAiOutput.title}</Text> : null}
              {normalizedAiOutput.paragraphs.map((item, index) => (
                <Text key={`p-${index}`} style={styles.aiOutputText}>{item}</Text>
              ))}
              {normalizedAiOutput.bullets.map((item, index) => (
                <Text key={`b-${index}`} style={styles.aiOutputText}>- {item}</Text>
              ))}
              {normalizedAiOutput.numbered.map((item, index) => (
                <Text key={`n-${index}`} style={styles.aiOutputText}>{index + 1}. {item}</Text>
              ))}
            </View>
          ) : (
            <Text style={styles.aiOutputText}>Run an action below to generate AI output for this page.</Text>
          )}
        </View>
      </ScrollView>

      <View style={styles.toolDock}>
        {toolsOpen ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.toolScroller}
          >
            <Pressable style={styles.toolButton} onPress={() => runAIAction('summarize')}>
              <Text style={styles.toolIcon}>S</Text>
              <Text style={styles.toolText} numberOfLines={1}>
                {loadingAction === 'summarize' ? 'Working' : 'Summary'}
              </Text>
            </Pressable>
            <Pressable style={styles.toolButton} onPress={() => runAIAction('explain')}>
              <Text style={styles.toolIcon}>E</Text>
              <Text style={styles.toolText} numberOfLines={1}>
                {loadingAction === 'explain' ? 'Working' : 'Explain'}
              </Text>
            </Pressable>
            <Pressable style={styles.toolButton} onPress={() => runAIAction('quiz')}>
              <Text style={styles.toolIcon}>Q</Text>
              <Text style={styles.toolText} numberOfLines={1}>
                {loadingAction === 'quiz' ? 'Working' : 'Quiz'}
              </Text>
            </Pressable>
            <Pressable style={styles.toolButton} onPress={() => runAIAction('chat')}>
              <Text style={styles.toolIcon}>AI</Text>
              <Text style={styles.toolText} numberOfLines={1}>
                {loadingAction === 'chat' ? 'Working' : 'Ask'}
              </Text>
            </Pressable>
            <Pressable style={styles.homeToolButton} onPress={onBack}>
              <Text style={styles.homeToolText} numberOfLines={1}>Home</Text>
            </Pressable>
            <Pressable style={styles.hideToolButton} onPress={() => setToolsOpen(false)}>
              <Text style={styles.hideToolText} numberOfLines={1}>Hide</Text>
            </Pressable>
          </ScrollView>
        ) : (
          <View style={styles.collapsedDock}>
            <Pressable style={styles.openToolsButton} onPress={() => setToolsOpen(true)}>
              <Text style={styles.openToolsText}>AI Tools</Text>
            </Pressable>
            <Text style={styles.pageDockText} numberOfLines={1}>
              Page {currentPage.pageNumber}/{currentLesson.pages.length}
            </Text>
            <Pressable style={styles.homeCompactButton} onPress={onBack}>
              <Text style={styles.homeCompactText}>Home</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f4f7fb' },
  content: { flex: 1 },
  container: {
    paddingTop: getTopInset(),
    paddingHorizontal: 16,
    paddingBottom: getBottomInset(92)
  },
  header: { marginBottom: 10 },
  lessonTitle: { fontSize: 24, fontWeight: '700', color: '#0f172a' },
  lessonMeta: { marginTop: 4, fontSize: 14, color: '#475569' },
  pageMeta: { marginTop: 4, fontSize: 13, color: '#64748b' },
  readerStatus: { marginTop: 6, color: '#0e7490', fontWeight: '600' },
  pageCard: { backgroundColor: '#ffffff', borderRadius: 12, padding: 14, gap: 10 },
  blockHeading: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  blockParagraph: { fontSize: 15, lineHeight: 22, color: '#334155' },
  tagBoxBlue: { backgroundColor: '#dbeafe', padding: 10, borderRadius: 10 },
  tagTextBlue: { color: '#1e3a8a', fontWeight: '600' },
  tagBoxGreen: { backgroundColor: '#dcfce7', padding: 10, borderRadius: 10 },
  tagTextGreen: { color: '#166534' },
  tagBoxAmber: { backgroundColor: '#fef3c7', padding: 10, borderRadius: 10 },
  tagTextAmber: { color: '#92400e', fontWeight: '600' },
  imageCard: { backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderWidth: 1, borderRadius: 10, padding: 10 },
  imageMock: { height: 120, borderRadius: 8, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' },
  imageMockText: { color: '#334155', fontSize: 12 },
  caption: { marginTop: 8, fontSize: 13, fontWeight: '600', color: '#1f2937' },
  description: { marginTop: 4, color: '#475569', fontSize: 13 },
  arCard: { backgroundColor: '#ede9fe', borderRadius: 10, padding: 10 },
  arTitle: { color: '#5b21b6', fontWeight: '700' },
  arText: { marginTop: 4, color: '#4c1d95', fontSize: 13 },
  navigationRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  navButton: { flex: 1, backgroundColor: '#0ea5e9', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  navButtonDisabled: { backgroundColor: '#7dd3fc' },
  navButtonText: { color: '#ffffff', fontWeight: '700', textAlign: 'center' },
  aiOutputCard: { marginTop: 12, backgroundColor: '#ecfeff', borderRadius: 10, padding: 12 },
  aiOutputLabel: { color: '#0e7490', fontWeight: '700', marginBottom: 4 },
  aiWarning: { color: '#b45309', fontWeight: '700', marginBottom: 6 },
  aiOutputTitle: { color: '#0f172a', fontWeight: '800', fontSize: 15, marginBottom: 6 },
  aiOutputText: { color: '#155e75', fontSize: 14, lineHeight: 20, marginBottom: 5 },
  toolDock: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
    paddingBottom: getBottomInset(6)
  },
  toolScroller: {
    paddingHorizontal: 10,
    gap: 8,
    alignItems: 'center'
  },
  collapsedDock: {
    minHeight: 42,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  openToolsButton: {
    minWidth: 86,
    height: 38,
    backgroundColor: '#2563eb',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center'
  },
  openToolsText: { color: '#ffffff', fontWeight: '800', fontSize: 13 },
  pageDockText: { flex: 1, color: '#475569', fontSize: 12, textAlign: 'center' },
  homeCompactButton: {
    minWidth: 64,
    height: 38,
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  homeCompactText: { color: '#0f172a', fontWeight: '800', fontSize: 13 },
  toolButton: {
    width: 74,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6
  },
  toolIcon: { color: '#1d4ed8', fontWeight: '900', fontSize: 13, marginBottom: 3 },
  toolText: { color: '#1e3a8a', fontWeight: '800', fontSize: 11 },
  homeToolButton: {
    width: 72,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center'
  },
  homeToolText: { color: '#ffffff', fontWeight: '800', fontSize: 12 },
  hideToolButton: {
    width: 66,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  hideToolText: { color: '#0f172a', fontWeight: '800', fontSize: 12 }
});

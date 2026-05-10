import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { lesson } from '../data/mockData';
import { parseAiAnswerGrading } from '../services/aiAnswerGradingParser';
import { parseAiBatchGrading } from '../services/aiBatchGradingParser';
import { generateAiResponse } from '../services/ai/aiClient';
import { buildGradeAnswerBatchPrompt, buildGradeAnswerPrompt, buildQuizPrompt } from '../services/ai/aiPromptBuilder';
import { buildAiContext } from '../services/aiContextBuilder';
import { getAdaptiveQuizPlan, getStudentPathLabel, updateHiddenAssessmentState } from '../services/adaptiveAssessmentEngine';
import { parseAiQuizResponse } from '../services/aiQuizParser';
import { recordAiTutorSignal, recordQuizSignal } from '../services/hiddenStudentStateEngine';
import { buildLessonContextSlice, getCurrentPage } from '../services/lessonEngine';
import { getActiveMockLesson } from '../services/lessons/mockLessonRuntimeStore';
import { getBottomInset, getTopInset } from '../services/mobileViewport';
import { recordQuizResult } from '../services/progressEngine';
import { consumePendingQuizSession } from '../services/quizSessionService';
import { buildQuizFromLesson, type DemoQuizQuestion, gradeAnswer } from '../services/quizEngine';
import { studentEventCollector } from '../services/sync/studentEventCollector';
import type { QuizMode } from '../types';

type QuizScreenProps = {
  onBack: () => void;
};

type QuizSource = 'local' | 'ai' | 'transcript';
type StudentAnswer = {
  questionId: string;
  questionType: 'multiple_choice' | 'short_answer' | 'spoken_answer';
  selectedOption?: string;
  textAnswer?: string;
};

export default function QuizScreen({ onBack }: QuizScreenProps) {
  const [questions, setQuestions] = React.useState<DemoQuizQuestion[]>([]);
  const [quizSource, setQuizSource] = React.useState<QuizSource>('local');
  const [mode, setMode] = React.useState<QuizMode | null>(null);
  const [isChoosingMode, setIsChoosingMode] = React.useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [selectedOption, setSelectedOption] = React.useState<string | null>(null);
  const [textAnswer, setTextAnswer] = React.useState('');
  const [answers, setAnswers] = React.useState<Record<string, StudentAnswer>>({});
  const [submittedInstant, setSubmittedInstant] = React.useState(false);
  const [instantResult, setInstantResult] = React.useState('');
  const [instantExplanation, setInstantExplanation] = React.useState('');
  const [statusText, setStatusText] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isFinalized, setIsFinalized] = React.useState(false);
  const [finalSummary, setFinalSummary] = React.useState('');
  const activeLesson = getActiveMockLesson(lesson);

  React.useEffect(() => {
    const pending = consumePendingQuizSession();
    if (pending && pending.questions.length > 0) {
      setQuestions(pending.questions);
      setQuizSource(pending.source);
      setStatusText('Quiz loaded from Lesson Reader.');
      return;
    }
    setQuestions(buildQuizFromLesson(activeLesson));
    setQuizSource('local');
    void studentEventCollector.recordQuizStarted(undefined, activeLesson.id);
  }, []);

  const currentQuestion = questions[currentIndex];
  const planQuick = getAdaptiveQuizPlan('quick');
  const planTest = getAdaptiveQuizPlan('test_10');

  const startMode = async (selectedMode: QuizMode) => {
    setMode(selectedMode);
    setIsChoosingMode(false);
    setCurrentIndex(0);
    setSelectedOption(null);
    setTextAnswer('');
    setAnswers({});
    setSubmittedInstant(false);
    setInstantResult('');
    setInstantExplanation('');
    setIsFinalized(false);
    setFinalSummary('');

    if (quizSource === 'ai') {
      return;
    }
    await generateAiQuizForMode(selectedMode);
  };

  const generateAiQuizForMode = async (quizMode: QuizMode) => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    try {
      const page = getCurrentPage(activeLesson, 0);
      const plan = getAdaptiveQuizPlan(quizMode);
      const lessonSlice = buildLessonContextSlice(activeLesson, 0, quizMode === 'test_10' ? 5600 : 3600, quizMode === 'test_10' ? 4 : 2);
      const context = buildAiContext({
        action: 'quiz',
        contextMode: 'quiz',
        lesson: activeLesson,
        currentPage: page,
        selectedText: lessonSlice.text
      });
      const prompt = buildQuizPrompt(context.contextText, {
        questionHints: page.blocks.filter((b) => b.type === 'question').map((b) => (b.type === 'question' ? b.question : '')),
        quizMode,
        adaptiveDifficulty: plan.difficulty === 'challenge' ? 'advanced' : plan.difficulty,
        skillLevel: plan.difficulty === 'basic' ? 'foundation' : plan.difficulty === 'standard' ? 'developing' : plan.difficulty === 'advanced' ? 'proficient' : 'advanced',
        questionCount: plan.questionCount,
        questionMix: plan.questionMix,
        sourceScope: `Use only pages ${lessonSlice.pageNumbers.join(', ')}. Do not use the whole lesson unless asked to summarize.`
      });
      const result = await generateAiResponse({
        action: 'quiz',
        contextMode: 'quiz',
        lessonId: activeLesson.id,
        pageNumber: page.pageNumber,
        prompt,
        contextText: context.contextText,
        metadata: { ...context.metadata, quizMode, adaptiveDifficulty: plan.difficulty, questionCount: plan.questionCount, questionMix: plan.questionMix, contextStrategy: 'lesson_slice', pageNumbers: lessonSlice.pageNumbers }
      });
      if (!result.ok) {
        setStatusText(result.error);
        setQuestions(buildQuizFromLesson(activeLesson));
        return;
      }
      const parsed = parseAiQuizResponse(result.text ?? '');
      if (!parsed.ok || parsed.questions.length === 0) {
        setStatusText(parsed.ok ? 'AI quiz is empty. Using local quiz.' : parsed.error);
        setQuestions(buildQuizFromLesson(activeLesson));
        return;
      }
      setQuestions(parsed.questions.map((q) => ({
        id: q.id,
        type: q.type,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        expectedAnswer: q.expectedAnswer,
        rubric: q.rubric,
        explanation: q.explanation,
        difficulty: q.difficulty,
        sourcePage: q.sourcePage
      })));
      setQuizSource('ai');
      setStatusText(quizMode === 'test_10' ? '10-Question Test prepared.' : 'Quick Test prepared.');
    } finally {
      setIsLoading(false);
    }
  };

  const captureAnswer = (): StudentAnswer | null => {
    if (!currentQuestion) {
      return null;
    }
    if (currentQuestion.type === 'multiple_choice' && !selectedOption) {
      setStatusText('Please select an option.');
      return null;
    }
    if ((currentQuestion.type === 'short_answer' || currentQuestion.type === 'spoken_answer') && !textAnswer.trim()) {
      setStatusText('Please type your answer.');
      return null;
    }
    return {
      questionId: currentQuestion.id,
      questionType: currentQuestion.type,
      selectedOption: selectedOption ?? undefined,
      textAnswer: textAnswer.trim() || undefined
    };
  };

  const submitCurrent = async () => {
    const captured = captureAnswer();
    if (!captured || !currentQuestion || !mode) {
      return;
    }
      setAnswers((prev) => ({ ...prev, [captured.questionId]: captured }));
    if (mode === 'test_10') {
      const merged = { ...answers, [captured.questionId]: captured };
      setStatusText('Answer saved.');
      if (currentIndex >= questions.length - 1) {
        await finishTest(merged);
      } else {
        moveNext();
      }
      return;
    }
    await gradeImmediate(currentQuestion, captured);
  };

  const gradeImmediate = async (question: DemoQuizQuestion, answer: StudentAnswer) => {
    if (question.type === 'multiple_choice') {
      const result = gradeAnswer(question, answer.selectedOption ?? '');
      setSubmittedInstant(true);
      setInstantResult(result.resultText);
      setInstantExplanation(result.explanation);
      recordQuizResult(result.isCorrect);
      recordQuizSignal({ percentage: result.isCorrect ? 1 : 0 });
      return;
    }

    setIsLoading(true);
    try {
      const page = getCurrentPage(activeLesson, Math.max(0, (question.sourcePage ?? 1) - 1));
      const context = buildAiContext({ action: 'grade_answer', contextMode: 'assessment', lesson: activeLesson, currentPage: page });
      const prompt = buildGradeAnswerPrompt({
        question: question.question,
        questionType: question.type === 'spoken_answer' ? 'spoken_answer' : 'short_answer',
        expectedAnswer: question.expectedAnswer,
        rubric: question.rubric,
        studentAnswer: answer.textAnswer ?? '',
        contextText: context.contextText
      });
      const result = await generateAiResponse({
        action: 'grade_answer',
        contextMode: 'assessment',
        lessonId: activeLesson.id,
        pageNumber: page.pageNumber,
        prompt,
        contextText: context.contextText,
        userText: answer.textAnswer,
        metadata: context.metadata
      });
      if (!result.ok) {
        setSubmittedInstant(true);
        setInstantResult('Needs review');
        setInstantExplanation(result.error);
        return;
      }
      const parsed = parseAiAnswerGrading(result.text);
      if (!parsed.ok) {
        setSubmittedInstant(true);
        setInstantResult('Needs review');
        setInstantExplanation(parsed.error);
        return;
      }
      const isCorrect = parsed.result.score >= 0.7;
      setSubmittedInstant(true);
      setInstantResult(isCorrect ? 'Correct' : 'Needs review');
      setInstantExplanation(`${parsed.result.feedback}\nSuggested answer: ${parsed.result.correctedAnswer}`);
      void studentEventCollector.recordShortAnswerSubmitted({ questionId: question.id, score: parsed.result.score });
      recordQuizResult(isCorrect);
      recordQuizSignal({ percentage: isCorrect ? 1 : 0, studentAnswerText: answer.textAnswer });
      if (!isCorrect) {
        recordAiTutorSignal(answer.textAnswer ?? '');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const moveNext = () => {
    if (currentIndex >= questions.length - 1) {
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    const nextQuestion = questions[currentIndex + 1];
    const existing = nextQuestion ? answers[nextQuestion.id] : undefined;
    setSelectedOption(existing?.selectedOption ?? null);
    setTextAnswer(existing?.textAnswer ?? '');
    setSubmittedInstant(false);
    setInstantResult('');
    setInstantExplanation('');
  };

  const movePrev = () => {
    if (currentIndex <= 0) {
      return;
    }
    setCurrentIndex((prev) => prev - 1);
    const prevQuestion = questions[currentIndex - 1];
    const existing = prevQuestion ? answers[prevQuestion.id] : undefined;
    setSelectedOption(existing?.selectedOption ?? null);
    setTextAnswer(existing?.textAnswer ?? '');
    setSubmittedInstant(false);
    setInstantResult('');
    setInstantExplanation('');
  };

  const finishTest = async (presetAnswers?: Record<string, StudentAnswer>) => {
    if (mode !== 'test_10') {
      return;
    }
    const mergedAnswers = { ...(presetAnswers ?? answers) };
    const captured = captureAnswer();
    if (captured) {
      mergedAnswers[captured.questionId] = captured;
      setAnswers(mergedAnswers);
    }

    const mcQuestions = questions.filter((q) => q.type === 'multiple_choice');
    const textQuestions = questions.filter((q) => q.type !== 'multiple_choice');
    let totalScore = 0;
    let correctCount = 0;
    const details: string[] = [];

    mcQuestions.forEach((q, idx) => {
      const a = mergedAnswers[q.id];
      const isCorrect = a?.selectedOption === q.correctAnswer;
      totalScore += isCorrect ? 1 : 0;
      if (isCorrect) {
        correctCount += 1;
      }
      details.push(`${idx + 1}. ${isCorrect ? 'Correct' : 'Needs review'} - ${q.explanation}`);
    });

    if (textQuestions.length > 0) {
      setIsLoading(true);
      try {
        const lessonSlice = buildLessonContextSlice(activeLesson, 0, 5200, 4);
        const context = buildAiContext({
          action: 'grade_answer_batch',
          contextMode: 'assessment',
          lesson: activeLesson,
          selectedText: `${lessonSlice.text}\n\nQuestions:\n${textQuestions.map((q) => q.question).join('\n')}`
        });
        const payload = textQuestions.map((q) => ({
          questionId: q.id,
          question: q.question,
          expectedAnswer: q.expectedAnswer,
          rubric: q.rubric,
          studentAnswer: mergedAnswers[q.id]?.textAnswer ?? ''
        }));
        const prompt = buildGradeAnswerBatchPrompt({ contextText: context.contextText, answers: payload });
        const result = await generateAiResponse({
          action: 'grade_answer_batch',
          contextMode: 'assessment',
          lessonId: activeLesson.id,
          prompt,
          contextText: context.contextText,
          metadata: { ...context.metadata, answers: payload }
        });
        if (result.ok) {
          const parsed = parseAiBatchGrading(result.text ?? '');
          if (parsed.ok) {
            parsed.payload.results.forEach((item, idx) => {
              totalScore += item.score;
              if (item.score >= 0.7) {
                correctCount += 1;
              }
              details.push(`${mcQuestions.length + idx + 1}. ${item.masterySignal} - ${item.feedback}`);
            });
            if (parsed.payload.overallFeedback) {
              details.push(`Overall: ${parsed.payload.overallFeedback}`);
            }
            if (parsed.payload.recommendedReview.length > 0) {
              details.push(`Recommended review: ${parsed.payload.recommendedReview.join(', ')}`);
            }
          } else {
            details.push(parsed.error);
          }
        } else {
          details.push(result.error);
        }
      } finally {
        setIsLoading(false);
      }
    }

    const totalQuestions = questions.length;
    const percentage = totalQuestions > 0 ? totalScore / totalQuestions : 0;
    updateHiddenAssessmentState({
      totalQuestions,
      totalScore,
      percentage,
      shortAnswerAverageScore: textQuestions.length > 0 ? totalScore / textQuestions.length : 0,
      numberOfNeedsReview: totalQuestions - correctCount,
      numberOfCorrect: correctCount,
      quizMode: 'test_10',
      currentDifficulty: getAdaptiveQuizPlan('test_10').difficulty
    });
    recordQuizResult(percentage >= 0.7);
    recordQuizSignal({ percentage });
    void studentEventCollector.recordQuizCompleted({ score: totalScore, total: totalQuestions, accuracy: percentage }, undefined, activeLesson.id);
    if (percentage < 0.6) {
      void studentEventCollector.recordLearningDeclineSignal('Quiz accuracy dropped below baseline target.');
    }
    setFinalSummary(
      `Test Completed\nCorrect answers: ${correctCount}/${totalQuestions}\nScore: ${Math.round(percentage * 100)}%\n` +
      `Suggested practice: ${getStudentPathLabel()}\n\n${details.join('\n')}`
    );
    setIsFinalized(true);
  };

  if (isChoosingMode) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Choose Quiz Mode</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recommended: {planQuick.studentFacingLabel.includes('Quick') ? 'Quick Test' : '10-Question Test'}</Text>
          <Text style={styles.body}>Reason: {planQuick.studentFacingLabel.includes('Quick') ? planQuick.studentFacingMessage : planTest.studentFacingMessage}</Text>
        </View>
        <Pressable style={styles.button} onPress={() => void startMode('quick')}>
          <Text style={styles.buttonText}>Quick Test</Text>
          <Text style={styles.buttonSub}>Short practice with immediate feedback.</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => void startMode('test_10')}>
          <Text style={styles.buttonText}>10-Question Test</Text>
          <Text style={styles.buttonSub}>Finish all questions first, then get final feedback.</Text>
        </Pressable>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.buttonText}>Back Home</Text>
        </Pressable>
      </ScrollView>
    );
  }

  if (isFinalized) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Test Completed</Text>
        <View style={styles.card}>
          <Text style={styles.body}>{finalSummary}</Text>
        </View>
        <Pressable style={styles.button} onPress={() => setIsChoosingMode(true)}>
          <Text style={styles.buttonText}>Restart Test</Text>
        </Pressable>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.buttonText}>Back Home</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Quiz</Text>
      <Text style={styles.meta}>Mode: {mode === 'quick' ? 'Quick Test' : '10-Question Test'} • Question {Math.min(currentIndex + 1, questions.length)}/{questions.length}</Text>
      {statusText ? <Text style={styles.status}>{statusText}</Text> : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{currentQuestion?.question}</Text>
        <Text style={styles.meta}>Type: {currentQuestion?.type} • Difficulty: {currentQuestion?.difficulty}</Text>
      </View>

      <View style={styles.card}>
        {currentQuestion?.type === 'multiple_choice' ? (
          (currentQuestion.options ?? []).map((option) => (
            <Pressable key={option} style={[styles.option, selectedOption === option ? styles.optionActive : null]} onPress={() => setSelectedOption(option)}>
              <Text style={styles.body}>{option}</Text>
            </Pressable>
          ))
        ) : (
          <View>
            {currentQuestion?.type === 'spoken_answer' ? <Text style={styles.status}>Voice answer is coming soon. Type your answer for this demo.</Text> : null}
            <TextInput
              style={styles.textArea}
              multiline
              value={textAnswer}
              onChangeText={setTextAnswer}
              placeholder="Type your answer..."
              placeholderTextColor="#6b7280"
            />
          </View>
        )}
      </View>

      <View style={styles.row}>
        <Pressable style={styles.secondaryButton} onPress={movePrev} disabled={currentIndex === 0}>
          <Text style={styles.buttonText}>Previous</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => void submitCurrent()} disabled={isLoading}>
          <Text style={styles.buttonText}>{isLoading ? 'Loading...' : mode === 'test_10' ? (currentIndex === questions.length - 1 ? 'Finish Test' : 'Save & Next') : 'Submit'}</Text>
        </Pressable>
      </View>

      {mode === 'test_10' && currentIndex === questions.length - 1 ? (
        <Pressable style={styles.button} onPress={() => void finishTest()} disabled={isLoading}>
          <Text style={styles.buttonText}>Finish Test</Text>
        </Pressable>
      ) : null}
      {mode === 'quick' && submittedInstant ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{instantResult}</Text>
          <Text style={styles.body}>{instantExplanation}</Text>
          <Pressable style={styles.secondaryButton} onPress={moveNext} disabled={currentIndex >= questions.length - 1}>
            <Text style={styles.buttonText}>Next Question</Text>
          </Pressable>
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
    paddingTop: getTopInset(),
    paddingHorizontal: 16,
    paddingBottom: getBottomInset(24),
    backgroundColor: '#f4f7fb'
  },
  title: { fontSize: 24, fontWeight: '700', color: '#0f172a' },
  meta: { marginTop: 4, color: '#64748b' },
  status: { marginTop: 8, color: '#0f766e', fontWeight: '600' },
  card: { marginTop: 12, backgroundColor: '#fff', borderRadius: 12, padding: 12 },
  cardTitle: { color: '#0f172a', fontWeight: '700', fontSize: 15 },
  body: { color: '#334155', marginTop: 4 },
  option: { marginTop: 8, borderWidth: 1, borderColor: '#dbe3ef', borderRadius: 10, padding: 10, backgroundColor: '#f8fafc' },
  optionActive: { borderColor: '#2563eb', backgroundColor: '#eaf2ff' },
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
  row: { flexDirection: 'row', gap: 8, marginTop: 12 },
  button: {
    marginTop: 12,
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center'
  },
  secondaryButton: {
    marginTop: 12,
    flex: 1,
    backgroundColor: '#0ea5e9',
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
  buttonSub: { color: '#dbeafe', fontSize: 12, marginTop: 2 }
});

import type { AiContextMode } from './aiTypes';
import type { QuizMode } from '../../types';

type ChatPromptInput = {
  userText: string;
  contextMode: AiContextMode;
  contextText: string;
  history?: Array<{ role: 'user' | 'assistant' | 'system'; text: string }>;
};

type QuizPromptOptions = {
  questionHints?: string[];
  quizMode?: QuizMode;
  adaptiveDifficulty?: 'basic' | 'standard' | 'advanced' | 'challenge';
  skillLevel?: 'foundation' | 'developing' | 'proficient' | 'advanced';
  questionCount?: number;
  questionMix?: { multipleChoice: number; shortAnswer: number; spokenAnswer: number };
  sourceScope?: string;
};

function languageRule(userText: string): string {
  return isVietnameseText(userText) ? 'Respond in Vietnamese.' : 'Respond in English.';
}

function sharedRules(userText: string): string[] {
  return [
    'You are OnePad Student Multi-Tool Agent.',
    'You support learning, physical readiness, wellbeing support, teacher intervention, parent reporting, and school permission control.',
    languageRule(userText),
    'Keep the answer concise, clear, and supportive.',
    'Use only the provided data.',
    'If data is insufficient, say that clearly.',
    'Do not diagnose medical or mental health conditions.',
    'Do not label the student.',
    'Do not provide weight-loss, body-shape, or appearance-based advice.',
    'Use safe, age-appropriate, school-appropriate language.',
    'For sensitive issues, create role-based safe summaries only.',
    'Do not reveal private reflections unless the student requests support or policy requires escalation.',
    'When giving physical activity suggestions, keep them light to moderate and safe.',
    'Do not mention internal variable names.'
  ];
}

function lessonInsufficientMessage(userText: string): string {
  return isVietnameseText(userText)
    ? 'Mình chưa có đủ thông tin từ trang bài học này để trả lời chính xác.'
    : "I don't have enough lesson information to answer that from this page.";
}

export function buildSummarizePrompt(contextText: string): string {
  return [
    ...sharedRules('summarize'),
    'Task: Summarize the lesson content into concise bullet points.',
    `If lesson information is insufficient, answer exactly: "${lessonInsufficientMessage('en')}"`,
    `Lesson content:\n${contextText}`
  ].join('\n');
}

export function buildExplainPrompt(contextText: string, userText = 'Explain this page'): string {
  return [
    ...sharedRules(userText),
    'Task: Explain the lesson content in simple steps for a student.',
    `If lesson information is insufficient, answer exactly: "${lessonInsufficientMessage(userText)}"`,
    `Lesson content:\n${contextText}`
  ].join('\n');
}

export function buildQuizPrompt(contextText: string, options: QuizPromptOptions = {}): string {
  const quizMode = options.quizMode ?? 'quick';
  const requestedCount = options.questionCount ?? (quizMode === 'test_10' ? 10 : 3);
  const hints = options.questionHints && options.questionHints.length > 0
    ? options.questionHints.join(' | ')
    : 'No question hints';
  const mix = options.questionMix ?? (quizMode === 'test_10'
    ? { multipleChoice: 7, shortAnswer: 3, spokenAnswer: 0 }
    : { multipleChoice: 3, shortAnswer: 0, spokenAnswer: 0 });

  return [
    ...sharedRules('quiz'),
    'Task: Create a quiz from lesson content.',
    `Quiz mode: ${quizMode}`,
    `Target difficulty: ${options.adaptiveDifficulty ?? 'standard'}`,
    `Learner skill level: ${options.skillLevel ?? 'developing'}`,
    `Requested questions: ${requestedCount}`,
    `Question mix target: multiple_choice=${mix.multipleChoice}, short_answer=${mix.shortAnswer}, spoken_answer=${mix.spokenAnswer}`,
    options.sourceScope ? `Source scope: ${options.sourceScope}` : 'Source scope: use only the provided lesson content.',
    'Return ONLY valid JSON. No markdown. No extra text.',
    'JSON schema:',
    '{"questions":[{"id":"q1","type":"multiple_choice","question":"Question text","options":["A","B","C","D"],"correctAnswer":"A","expectedAnswer":"","rubric":"","explanation":"Short explanation","difficulty":"basic"}]}',
    'Rules:',
    '- type must be multiple_choice or short_answer (spoken_answer optional for future).',
    `- Return exactly ${requestedCount} questions when the lesson content is sufficient.`,
    '- Every question must be answerable from the provided lesson content.',
    '- Include sourcePage for every question when page labels are present.',
    '- Keep each question under 180 characters and each option under 90 characters.',
    '- If context is too short, return fewer questions but keep valid JSON.',
    '- For multiple_choice: options must be array with at least 2 items and correctAnswer must match one option.',
    '- For short_answer: include expectedAnswer or rubric.',
    '- difficulty must be basic, standard, or advanced.',
    '- No content outside JSON.',
    `Hints: ${hints}`,
    `Lesson content:\n${contextText}`
  ].join('\n');
}

export function buildGradeAnswerPrompt(input: {
  question: string;
  questionType: 'short_answer' | 'spoken_answer';
  expectedAnswer?: string;
  rubric?: string;
  studentAnswer: string;
  contextText: string;
}): string {
  return [
    ...sharedRules(input.studentAnswer),
    'Task: Grade one student answer fairly using expected answer/rubric/context.',
    'Return ONLY valid JSON. No markdown. No extra text.',
    'JSON schema:',
    '{"isCorrect":true,"score":1,"feedback":"...","correctedAnswer":"...","masterySignal":"understood"}',
    'score must be one of 0, 0.5, 1.',
    'masterySignal must be understood, partially_understood, or needs_review.',
    `Question type: ${input.questionType}`,
    `Question: ${input.question}`,
    `Expected answer: ${input.expectedAnswer ?? ''}`,
    `Rubric: ${input.rubric ?? ''}`,
    `Student answer: ${input.studentAnswer}`,
    `Context:\n${input.contextText}`
  ].join('\n');
}

export function buildGradeAnswerBatchPrompt(input: {
  contextText: string;
  answers: Array<{
    questionId: string;
    question: string;
    expectedAnswer?: string;
    rubric?: string;
    studentAnswer: string;
  }>;
}): string {
  return [
    ...sharedRules('grade answers'),
    'Task: Grade multiple short/spoken answers in one pass.',
    'Return ONLY valid JSON. No markdown. No extra text.',
    'JSON schema:',
    '{"results":[{"questionId":"q1","isCorrect":false,"score":0.5,"feedback":"...","correctedAnswer":"...","masterySignal":"partially_understood"}],"overallFeedback":"...","recommendedReview":["topic 1"]}',
    'score must be 0, 0.5, or 1.',
    'masterySignal must be understood, partially_understood, or needs_review.',
    `Assessment context:\n${input.contextText}`,
    `Answers payload:\n${JSON.stringify(input.answers)}`
  ].join('\n');
}

export function buildChatPrompt(input: ChatPromptInput): string {
  const historyText = (input.history ?? [])
    .slice(-6)
    .map((item) => `${item.role}: ${item.text}`)
    .join('\n');
  const fallback = lessonInsufficientMessage(input.userText);

  if (input.contextMode === 'general') {
    return [
      ...sharedRules(input.userText),
      'Mode: General AI Tutor.',
      'Do not assume a specific lesson unless provided.',
      'If student says they do not understand a lesson, ask which lesson/page they want to review.',
      `Recent chat:\n${historyText || 'No previous messages'}`,
      `Student message: ${input.userText}`
    ].join('\n');
  }

  return [
    ...sharedRules(input.userText),
    'Mode: Lesson AI.',
    `If lesson information is insufficient, answer exactly: "${fallback}"`,
    `Recent chat:\n${historyText || 'No previous messages'}`,
    `Student message: ${input.userText}`,
    `Lesson content:\n${input.contextText}`
  ].join('\n');
}

export function buildDailyTrainingPlanPrompt(input: {
  studentName: string;
  grade: string;
  selectedLessonTitle: string;
  selectedSubject: string;
  recentActivity: string[];
  recentMasteryPercent: number;
  currentLessonSlice: string;
  userText: string;
}): string {
  return [
    ...sharedRules(input.userText),
    'Skill: daily micro training planner for a Grade 8 student.',
    'Task: Create a small study plan for today based on recent learning process and the selected lesson.',
    'The plan must be practical, short, and doable in one day.',
    'Return 4 sections: focus, 3-step plan, quiz strategy, when to ask for help.',
    'Use only the provided recent process and lesson slice.',
    'Do not invent grades, scores, medical state, or private feelings.',
    `Student: ${input.studentName}, Grade ${input.grade}`,
    `Selected lesson: ${input.selectedSubject} - ${input.selectedLessonTitle}`,
    `Recent mastery: ${input.recentMasteryPercent}%`,
    `Recent process:\n${input.recentActivity.map((item) => `- ${item}`).join('\n')}`,
    `Lesson slice for planning:\n${input.currentLessonSlice}`,
    `Student request: ${input.userText}`
  ].join('\n');
}

export function buildArExplainPrompt(contextText: string, userText = 'Explain this model'): string {
  return [
    ...sharedRules(userText),
    'Task: Explain the AR model from provided model and lesson data only.',
    `Model data:\n${contextText}`
  ].join('\n');
}

export function buildTranscriptSummaryPrompt(transcript: string, userText = 'Summarize transcript'): string {
  return [
    ...sharedRules(userText),
    'Task: Summarize the transcript and list key points.',
    `Transcript:\n${transcript}`
  ].join('\n');
}

export function buildBodyReadinessPrompt(contextText: string): string {
  return [
    ...sharedRules('body readiness'),
    'Task: Create a short body readiness explanation for a student.',
    'Use only the provided data.',
    'Do not diagnose.',
    'Do not mention weight or appearance.',
    'Return:',
    '1. Readiness label',
    '2. Why',
    '3. Study recommendation',
    '4. Healthy routine recommendation',
    `Readiness data:\n${contextText}`
  ].join('\n');
}

export function buildMovementPlanPrompt(contextText: string): string {
  return [
    ...sharedRules('movement plan'),
    'Task: Create a safe weekly healthy movement routine for a student.',
    'Use only light to moderate activities.',
    'Do not create weight-loss goals.',
    'Do not compare the student to others.',
    'Consider sleep, energy, fatigue, school workload, and preferences.',
    'Return JSON with weeklyPlan and safetyNote.',
    `Readiness data:\n${contextText}`
  ].join('\n');
}

export function buildWellbeingCheckInPrompt(contextText: string): string {
  return [
    ...sharedRules('wellbeing check-in'),
    'Task: Convert a student wellbeing check-in into a safe support summary.',
    'Do not diagnose.',
    'Do not use clinical labels.',
    'Do not expose private reflection unless the student asks for help or policy requires escalation.',
    'Return JSON with privateSaved, safeSummary, supportNeeded, suggestedAdultRole, recommendedAction.',
    `Check-in data:\n${contextText}`
  ].join('\n');
}

export function buildGuardianReportPrompt(contextText: string): string {
  return [
    ...sharedRules('guardian report'),
    'Task: Create a family-safe weekly report.',
    'Use learning progress, physical readiness summary, and wellbeing safe summary.',
    'Do not include raw private notes.',
    'Do not include raw chat.',
    'Do not diagnose.',
    'Use supportive, practical language.',
    'Return: learning summary, physical readiness summary, safe wellbeing summary, suggested home actions, and what was not shared for privacy.',
    `Report data:\n${contextText}`
  ].join('\n');
}

export function buildTeacherWellbeingInsightPrompt(contextText: string): string {
  return [
    ...sharedRules('teacher wellbeing insight'),
    'Task: Create a teacher-facing safe insight.',
    'Respect the teacher role.',
    'Subject teacher sees subject-level learning support.',
    'Homeroom teacher sees broader safe summary.',
    'Education guardian sees deeper safe summary if authorized.',
    'Do not expose raw private reflection by default.',
    'Return: learning concern, student support signal, suggested school action, hidden fields due to privacy.',
    `Insight data:\n${contextText}`
  ].join('\n');
}

export function buildVoiceCommandPrompt(input: {
  transcript: string;
  currentScreen: string;
  lessonTitle?: string;
  pageNumber?: number;
  availableActions: string[];
}): string {
  return [
    'You are an intent router for a student learning app.',
    'Convert transcript to exactly one allowed app action.',
    'Choose action only from allowlist.',
    'Return JSON only. No markdown. No extra explanation.',
    'If unsure, use action = "unknown".',
    'If student asks to understand the lesson, choose explain_current_page.',
    'If student asks to make a quiz/test, choose create_quiz_from_current_page.',
    'If student asks for schedule, choose show_schedule.',
    'If student asks for grades/scores, choose show_grades.',
    'If student asks for group work, choose open_group_work or summarize_group_discussion.',
    `Current screen: ${input.currentScreen}`,
    `Current lesson title: ${input.lessonTitle ?? ''}`,
    `Current page number: ${input.pageNumber ?? ''}`,
    `Allowlist actions: ${input.availableActions.join(', ')}`,
    `Transcript: ${input.transcript}`,
    'JSON schema:',
    '{"action":"unknown","confidence":0.3,"spokenText":"...","target":null,"params":{},"confirmation":"I am not sure what you want to do. Please try again."}'
  ].join('\n');
}

function isVietnameseText(text: string): boolean {
  const lower = text.toLowerCase();
  return /[ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i.test(lower)
    || /\b(xin chào|không hiểu|bài học|giúp|mình|tôi|em)\b/i.test(lower);
}

import { getOrCreateDeviceId, getSessionId } from './deviceIdentityService';
import { enqueueEvent } from './studentEventQueue';
import { scheduleSyncSoon } from './studentSyncService';
import { StudentEvent, StudentEventSource, StudentEventType } from './studentEventTypes';

const DEMO_STUDENT_ID = 'stu_001';
const mkId = (type: string) => `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

async function push(type: StudentEventType, source: StudentEventSource, payload: Partial<StudentEvent>) {
  const event: StudentEvent = {
    id: mkId(type),
    studentId: DEMO_STUDENT_ID,
    deviceId: await getOrCreateDeviceId(),
    sessionId: await getSessionId(),
    type,
    source,
    severity: payload.severity ?? 'low',
    safeSummary: payload.safeSummary ?? type,
    privacyLevel: payload.privacyLevel ?? 'normal',
    visibleToTeacher: payload.visibleToTeacher ?? true,
    visibleToParent: payload.visibleToParent ?? true,
    visibleToSchoolAggregate: payload.visibleToSchoolAggregate ?? false,
    requiresParentConsent: payload.requiresParentConsent ?? false,
    requiresTeacherGuardianReview: payload.requiresTeacherGuardianReview ?? false,
    createdAt: new Date().toISOString(),
    lessonId: payload.lessonId,
    assignmentId: payload.assignmentId,
    quizId: payload.quizId,
    arAssignmentId: payload.arAssignmentId,
    metadataJson: payload.metadataJson,
    rawPrivateText: payload.rawPrivateText
  };
  await enqueueEvent(event);
  scheduleSyncSoon();
}

export const studentEventCollector = {
  recordLessonStarted: (lessonId?: string, pageNumber?: number) => push('lesson_started', 'lesson', { lessonId, safeSummary: 'Lesson started', metadataJson: { pageNumber } }),
  recordLessonCompleted: (lessonId?: string, pageNumber?: number) => push('lesson_completed', 'lesson', { lessonId, safeSummary: 'Lesson completed', metadataJson: { pageNumber } }),
  recordAiTutorUsed: (metadataJson?: Record<string, unknown>) => push('ai_tutor_used', 'ai_tutor', { safeSummary: 'AI tutor used', metadataJson }),
  recordLocalAiUsed: (metadataJson?: Record<string, unknown>) => push('local_ai_used', 'local_ai', { safeSummary: 'Local AI used', metadataJson }),
  recordCloudAiUsed: (metadataJson?: Record<string, unknown>) => push('cloud_ai_used', 'cloud_ai', { safeSummary: 'Cloud AI used', metadataJson }),
  recordQuizStarted: (quizId?: string, lessonId?: string) => push('quiz_started', 'quiz', { quizId, lessonId, safeSummary: 'Quiz started' }),
  recordQuizCompleted: (metadataJson?: Record<string, unknown>, quizId?: string, lessonId?: string) => push('quiz_completed', 'quiz', { quizId, lessonId, safeSummary: 'Quiz completed', metadataJson }),
  recordShortAnswerSubmitted: (metadataJson?: Record<string, unknown>) => push('short_answer_submitted', 'quiz', { safeSummary: 'Short answer submitted', metadataJson }),
  recordAdaptiveLevelChanged: (metadataJson?: Record<string, unknown>) => push('adaptive_level_changed', 'progress', { safeSummary: 'Adaptive level changed', metadataJson }),
  recordLowConfidenceSignal: (safeSummary = 'Low confidence signal') => push('low_confidence_signal', 'local_ai_signal_engine', { safeSummary, privacyLevel: 'sensitive' }),
  recordFrustrationSignal: (safeSummary = 'Frustration signal') => push('frustration_signal', 'local_ai_signal_engine', { safeSummary, privacyLevel: 'sensitive' }),
  recordSupportRequested: (safeSummary: string, privacyLevel: StudentEvent['privacyLevel'] = 'sensitive') => push('support_requested', 'support', { safeSummary, privacyLevel }),
  recordTeacherHelpRequested: (safeSummary = 'Teacher help requested') => push('teacher_help_requested', 'support', { safeSummary, privacyLevel: 'sensitive' }),
  recordGroupWorkActivity: (metadataJson?: Record<string, unknown>) => push('group_work_activity', 'group_work', { safeSummary: 'Group work activity', metadataJson }),
  recordCollaborationActivity: (metadataJson?: Record<string, unknown>) => push('collaboration_activity', 'group_work', { safeSummary: 'Collaboration activity', metadataJson }),
  recordAssignmentSubmitted: (assignmentId?: string) => push('assignment_submitted', 'group_work', { assignmentId, safeSummary: 'Assignment submitted' }),
  recordLearningDeclineSignal: (safeSummary = 'Learning decline signal') => push('learning_decline_signal', 'progress', { safeSummary, severity: 'medium' }),
  recordHealthSignalReceived: (safeSummary = 'Health signal received') => push('health_signal_received', 'health_app', { safeSummary, privacyLevel: 'parent_controlled', visibleToTeacher: false, requiresParentConsent: true }),
  recordWellbeingSignalReceived: (safeSummary = 'Wellbeing signal received') => push('wellbeing_signal_received', 'support', { safeSummary, privacyLevel: 'sensitive' }),
  recordTrendSignalCreated: (safeSummary = 'Trend signal created', metadataJson?: Record<string, unknown>) =>
    push('learning_decline_signal', 'local_ai_signal_engine', { safeSummary, severity: 'medium', metadataJson }),
  recordSocialIntegrationSignal: (safeSummary = 'Social integration signal') => push('social_integration_signal', 'group_work', { safeSummary }),
  recordArAssignmentReceived: (arAssignmentId?: string) => push('ar_assignment_received', 'ar_lab', { arAssignmentId, safeSummary: 'AR assignment received' }),
  recordArAssignmentOpened: (arAssignmentId?: string) => push('ar_assignment_opened', 'ar_lab', { arAssignmentId, safeSummary: 'AR assignment opened' }),
  recordArAssignmentCompleted: (arAssignmentId?: string) => push('ar_assignment_completed', 'ar_lab', { arAssignmentId, safeSummary: 'AR assignment completed' }),
  recordArModelExplained: (arAssignmentId?: string) => push('ar_model_explained', 'ar_lab', { arAssignmentId, safeSummary: 'AR model explained' }),
  recordArQuizCompleted: (arAssignmentId?: string) => push('ar_quiz_completed', 'ar_lab', { arAssignmentId, safeSummary: 'AR quiz completed' }),
  recordTranscriptSummarized: () => push('transcript_summarized', 'lecture_recorder', { safeSummary: 'Transcript summarized' }),
  recordTranscriptQuizCreated: () => push('transcript_quiz_created', 'lecture_recorder', { safeSummary: 'Transcript quiz created' })
};

import { mockDailyBodyLogs, mockPhysicalHealthProfile } from '../../data/mockPhysicalHealthData';
import { mockSupportSignals } from '../../data/mockSupportSignals';
import { createBodyReadinessSnapshot } from '../health/bodyReadinessEngine';
import { createWeeklyMovementPlan } from '../health/movementPlanEngine';
import { createSleepRecoverySummary } from '../health/sleepRecoveryEngine';
import { createGuardianReport } from '../reports/guardianReportEngine';
import { createTeacherInsightReport } from '../reports/teacherInsightEngine';
import { redactGuardianReport } from '../wellbeing/reportRedactionEngine';
import type { DailyBodyLog, PhysicalHealthProfile } from '../../types/healthTypes';
import type { SupportSignal } from '../../types/wellbeingTypes';

export const studentToolRegistry = {
  getBodyReadiness: (args?: { studentId?: string; bodyLogs?: DailyBodyLog[] }) =>
    createBodyReadinessSnapshot(
      args?.studentId ?? 'student_minh_001',
      args?.bodyLogs ?? mockDailyBodyLogs
    ),
  getMovementPlan: (args?: {
    studentId?: string;
    bodyLogs?: DailyBodyLog[];
    profile?: PhysicalHealthProfile;
  }) => {
    const readiness = createBodyReadinessSnapshot(
      args?.studentId ?? 'student_minh_001',
      args?.bodyLogs ?? mockDailyBodyLogs
    );
    return createWeeklyMovementPlan(args?.profile ?? mockPhysicalHealthProfile, readiness);
  },
  getSleepRecovery: (args?: { bodyLogs?: DailyBodyLog[] }) =>
    createSleepRecoverySummary(args?.bodyLogs ?? mockDailyBodyLogs),
  getGuardianReport: (args?: {
    studentId?: string;
    bodyLogs?: DailyBodyLog[];
    supportSignals?: SupportSignal[];
    learningSummary?: string;
  }) => {
    const readiness = createBodyReadinessSnapshot(
      args?.studentId ?? 'student_minh_001',
      args?.bodyLogs ?? mockDailyBodyLogs
    );
    return createGuardianReport({
      studentId: args?.studentId ?? 'student_minh_001',
      learningSummary: args?.learningSummary
        ?? 'Minh completed most assigned lessons. Math word problems remain the weakest skill area.',
      readiness,
      supportSignals: args?.supportSignals ?? mockSupportSignals
    });
  },
  getParentSafeGuardianReport: (args?: {
    studentId?: string;
    bodyLogs?: DailyBodyLog[];
    supportSignals?: SupportSignal[];
    learningSummary?: string;
  }) =>
    redactGuardianReport(studentToolRegistry.getGuardianReport(args), 'parent'),
  getTeacherInsight: (args?: {
    studentId?: string;
    bodyLogs?: DailyBodyLog[];
    supportSignals?: SupportSignal[];
    subjectSummary?: string;
    teacherRole?: 'subject_teacher' | 'homeroom_teacher';
  }) => {
    const readiness = createBodyReadinessSnapshot(
      args?.studentId ?? 'student_minh_001',
      args?.bodyLogs ?? mockDailyBodyLogs
    );
    return createTeacherInsightReport({
      studentId: args?.studentId ?? 'student_minh_001',
      teacherRole: args?.teacherRole ?? 'homeroom_teacher',
      subjectSummary: args?.subjectSummary
        ?? 'Minh needs support in Math word problems and should review one simpler practice set.',
      readiness,
      supportSignals: args?.supportSignals ?? mockSupportSignals
    });
  }
};

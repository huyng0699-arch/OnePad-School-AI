import type { GuardianReport, TeacherInsightReport } from '../../types/reportTypes';
import type { VisibleRole } from '../../types/wellbeingTypes';

export const redactGuardianReport = (
  report: GuardianReport,
  role: VisibleRole
): GuardianReport => {
  if (role === 'parent' || role === 'education_guardian') return report;
  return {
    ...report,
    wellbeingSafeSummary: undefined,
    redactedFields: [...report.redactedFields, 'wellbeingSafeSummary']
  };
};

export const redactTeacherInsight = (
  report: TeacherInsightReport,
  role: VisibleRole
): TeacherInsightReport => {
  if (role === 'education_guardian' || role === 'homeroom_teacher') return report;
  if (role === 'subject_teacher') {
    return {
      ...report,
      wellbeingSafeSummary: undefined,
      hiddenFields: [...report.hiddenFields, 'wellbeingSafeSummary']
    };
  }
  return {
    ...report,
    wellbeingSafeSummary: undefined,
    suggestedIntervention: report.suggestedIntervention.slice(0, 1),
    hiddenFields: [...report.hiddenFields, 'wellbeingSafeSummary', 'fullSuggestedIntervention']
  };
};

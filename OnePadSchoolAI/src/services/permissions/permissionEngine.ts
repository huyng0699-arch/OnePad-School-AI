export type AppRole =
  | 'student'
  | 'parent'
  | 'subject_teacher'
  | 'homeroom_teacher'
  | 'education_guardian'
  | 'school_admin';

export type DataFieldKey =
  | 'learning_mastery'
  | 'quiz_score'
  | 'body_readiness'
  | 'wellbeing_safe_summary'
  | 'private_reflection'
  | 'raw_ai_chat'
  | 'raw_body_logs'
  | 'support_signal'
  | 'audit_log';

export type PermissionDecision = {
  role: AppRole;
  visibleFields: DataFieldKey[];
  hiddenFields: DataFieldKey[];
  redactedSummary: string;
};

const roleFieldMap: Record<AppRole, DataFieldKey[]> = {
  student: [
    'learning_mastery',
    'quiz_score',
    'body_readiness',
    'wellbeing_safe_summary',
    'support_signal',
  ],
  parent: [
    'learning_mastery',
    'quiz_score',
    'body_readiness',
    'wellbeing_safe_summary',
    'support_signal',
  ],
  subject_teacher: ['learning_mastery', 'quiz_score', 'support_signal'],
  homeroom_teacher: [
    'learning_mastery',
    'quiz_score',
    'body_readiness',
    'wellbeing_safe_summary',
    'support_signal',
  ],
  education_guardian: [
    'learning_mastery',
    'quiz_score',
    'body_readiness',
    'wellbeing_safe_summary',
    'support_signal',
  ],
  school_admin: ['audit_log', 'support_signal'],
};

export const getPermissionDecision = (
  role: AppRole,
  requestedFields: DataFieldKey[],
): PermissionDecision => {
  const allowed = new Set(roleFieldMap[role]);
  const visibleFields = requestedFields.filter((field) => allowed.has(field));
  const hiddenFields = requestedFields.filter((field) => !allowed.has(field));

  return {
    role,
    visibleFields,
    hiddenFields,
    redactedSummary:
      hiddenFields.length === 0
        ? 'All requested fields are visible for this role.'
        : `Hidden fields for ${role.replace('_', ' ')}: ${hiddenFields.join(', ')}.`,
  };
};

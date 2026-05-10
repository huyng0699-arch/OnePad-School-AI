export type MoodLabel = 'calm' | 'okay' | 'tired' | 'stressed' | 'overwhelmed';

export type SupportRole =
  | 'subject_teacher'
  | 'homeroom_teacher'
  | 'parent'
  | 'education_guardian';

export type WellbeingVisibility =
  | 'private'
  | 'student_and_guardian'
  | 'school_safe_summary';

export type WellbeingCheckIn = {
  id: string;
  studentId: string;
  date: string;
  moodLabel?: MoodLabel;
  schoolStressLevel: 1 | 2 | 3 | 4 | 5;
  socialComfortLevel?: 1 | 2 | 3 | 4 | 5;
  wantsAdultSupport: boolean;
  preferredSupportRole?: SupportRole;
  privateReflection?: string;
  safeSummary?: string;
  visibility: WellbeingVisibility;
  rawDataLocked?: boolean;
  visibleToRoles?: VisibleRole[];
  source?: 'live_backend' | 'local_cache' | 'demo_seed';
};

export type SupportSignalType =
  | 'learning_stress'
  | 'low_energy'
  | 'support_request'
  | 'school_connection'
  | 'health_pattern'
  | 'safety_priority';

export type SupportSignalSeverity = 'low' | 'medium' | 'high';

export type SupportSignalSource =
  | 'student_checkin'
  | 'learning_data'
  | 'body_data'
  | 'teacher_note'
  | 'guardian_note';

export type VisibleRole =
  | 'student'
  | 'parent'
  | 'subject_teacher'
  | 'homeroom_teacher'
  | 'education_guardian'
  | 'school_admin';

export type SupportSignal = {
  id: string;
  studentId: string;
  createdAt: string;
  signalType: SupportSignalType;
  severity: SupportSignalSeverity;
  source: SupportSignalSource;
  safeSummary: string;
  recommendedAction: string;
  visibleToRoles: VisibleRole[];
  rawDataLocked: boolean;
  auditLogId: string;
};

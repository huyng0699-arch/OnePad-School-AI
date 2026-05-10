import type { SupportSignal } from '../types/wellbeingTypes';

export const mockSupportSignals: SupportSignal[] = [
  {
    id: 'sig_learning_001',
    studentId: 'student_minh_001',
    createdAt: '2026-05-06T09:00:00.000Z',
    signalType: 'learning_stress',
    severity: 'medium',
    source: 'learning_data',
    safeSummary:
      'Repeated mistakes appeared in Math word problems across recent quizzes. The student may benefit from a shorter remedial task.',
    recommendedAction:
      'Subject teacher should assign one simpler practice set and check understanding before advanced work.',
    visibleToRoles: ['subject_teacher', 'homeroom_teacher', 'education_guardian'],
    rawDataLocked: true,
    auditLogId: 'audit_001'
  },
  {
    id: 'sig_energy_001',
    studentId: 'student_minh_001',
    createdAt: '2026-05-06T10:00:00.000Z',
    signalType: 'low_energy',
    severity: 'low',
    source: 'body_data',
    safeSummary:
      'Energy check-ins were lower than usual this week. The app recommends shorter study sessions and a lighter evening routine.',
    recommendedAction:
      'Family can support a calmer evening routine and avoid long late-night study sessions this week.',
    visibleToRoles: ['parent', 'homeroom_teacher', 'education_guardian'],
    rawDataLocked: true,
    auditLogId: 'audit_002'
  }
];

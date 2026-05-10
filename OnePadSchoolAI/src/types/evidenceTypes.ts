export type EvidenceType =
  | 'quiz_score'
  | 'mastery_weakness'
  | 'repeated_mistake'
  | 'sleep_trend'
  | 'energy_trend'
  | 'movement_trend'
  | 'support_request'
  | 'wellbeing_checkin';

export type EvidenceItem = {
  id: string;
  eventId: string;
  studentId: string;
  type: EvidenceType;
  label: string;
  value: string;
  interpretation: string;
  createdAt: string;
};

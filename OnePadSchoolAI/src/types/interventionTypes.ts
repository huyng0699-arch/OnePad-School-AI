export type InterventionPlan = {
  id: string;
  eventId: string;
  studentId: string;
  createdAt: string;
  studentActions: string[];
  teacherActions: string[];
  parentActions: string[];
  adminActions: string[];
  safetyNote: string;
};

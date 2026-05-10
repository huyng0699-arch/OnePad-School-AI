import type {
  DailyBodyLog,
  PhysicalHealthProfile,
  WeeklyMovementPlan
} from '../types/healthTypes';

export const mockPhysicalHealthProfile: PhysicalHealthProfile = {
  studentId: 'student_minh_001',
  age: 13,
  grade: 'Grade 8',
  heightCm: 158,
  weightKg: 47,
  restingHeartRateBaseline: 78,
  activityPreference: ['walking', 'stretching', 'sports'],
  dataConsent: {
    studentAssent: true,
    guardianConsent: true,
    schoolHealthAccess: false,
    wearableAccess: false
  },
  updatedAt: '2026-05-08T08:00:00.000Z'
};

export const mockDailyBodyLogs: DailyBodyLog[] = [
  { id: 'body_2026_04_25', studentId: 'student_minh_001', date: '2026-04-25', sleepHours: 7.8, sleepQuality: 'good', energyLevel: 4, fatigueLevel: 2, steps: 6800, activeMinutes: 52, movementBreaks: 4, restingHeartRate: 76, studyMinutes: 45 },
  { id: 'body_2026_04_26', studentId: 'student_minh_001', date: '2026-04-26', sleepHours: 8.0, sleepQuality: 'good', energyLevel: 5, fatigueLevel: 1, steps: 7400, activeMinutes: 60, movementBreaks: 4, restingHeartRate: 75, studyMinutes: 35 },
  { id: 'body_2026_04_27', studentId: 'student_minh_001', date: '2026-04-27', sleepHours: 7.2, sleepQuality: 'okay', energyLevel: 4, fatigueLevel: 2, steps: 5900, activeMinutes: 40, movementBreaks: 3, restingHeartRate: 78, studyMinutes: 55 },
  { id: 'body_2026_04_28', studentId: 'student_minh_001', date: '2026-04-28', sleepHours: 7.4, sleepQuality: 'good', energyLevel: 4, fatigueLevel: 2, steps: 6500, activeMinutes: 47, movementBreaks: 3, restingHeartRate: 77, studyMinutes: 50 },
  { id: 'body_2026_04_29', studentId: 'student_minh_001', date: '2026-04-29', sleepHours: 7.0, sleepQuality: 'okay', energyLevel: 4, fatigueLevel: 2, steps: 6100, activeMinutes: 44, movementBreaks: 3, restingHeartRate: 78, studyMinutes: 60 },
  { id: 'body_2026_04_30', studentId: 'student_minh_001', date: '2026-04-30', sleepHours: 7.6, sleepQuality: 'good', energyLevel: 4, fatigueLevel: 2, steps: 7000, activeMinutes: 55, movementBreaks: 4, restingHeartRate: 76, studyMinutes: 42 },
  { id: 'body_2026_05_01', studentId: 'student_minh_001', date: '2026-05-01', sleepHours: 7.5, sleepQuality: 'good', energyLevel: 4, fatigueLevel: 2, steps: 6200, activeMinutes: 48, movementBreaks: 3, restingHeartRate: 77, studyMinutes: 45 },
  { id: 'body_2026_05_02', studentId: 'student_minh_001', date: '2026-05-02', sleepHours: 7.0, sleepQuality: 'okay', energyLevel: 4, fatigueLevel: 2, steps: 7100, activeMinutes: 55, movementBreaks: 4, restingHeartRate: 78, studyMinutes: 55 },
  { id: 'body_2026_05_03', studentId: 'student_minh_001', date: '2026-05-03', sleepHours: 6.5, sleepQuality: 'okay', energyLevel: 3, fatigueLevel: 3, steps: 4800, activeMinutes: 32, movementBreaks: 2, restingHeartRate: 80, studyMinutes: 60 },
  { id: 'body_2026_05_04', studentId: 'student_minh_001', date: '2026-05-04', sleepHours: 5.8, sleepQuality: 'low', energyLevel: 2, fatigueLevel: 4, steps: 3500, activeMinutes: 18, movementBreaks: 1, restingHeartRate: 83, studyMinutes: 80 },
  { id: 'body_2026_05_05', studentId: 'student_minh_001', date: '2026-05-05', sleepHours: 6.0, sleepQuality: 'low', energyLevel: 2, fatigueLevel: 4, steps: 3900, activeMinutes: 22, movementBreaks: 1, restingHeartRate: 84, studyMinutes: 75 },
  { id: 'body_2026_05_06', studentId: 'student_minh_001', date: '2026-05-06', sleepHours: 6.2, sleepQuality: 'okay', energyLevel: 3, fatigueLevel: 3, steps: 5200, activeMinutes: 35, movementBreaks: 2, restingHeartRate: 81, studyMinutes: 50 },
  { id: 'body_2026_05_07', studentId: 'student_minh_001', date: '2026-05-07', sleepHours: 6.8, sleepQuality: 'okay', energyLevel: 3, fatigueLevel: 3, steps: 6000, activeMinutes: 42, movementBreaks: 3, restingHeartRate: 79, studyMinutes: 40 },
  { id: 'body_2026_05_08', studentId: 'student_minh_001', date: '2026-05-08', sleepHours: 6.4, sleepQuality: 'okay', energyLevel: 3, fatigueLevel: 3, steps: 5400, activeMinutes: 34, movementBreaks: 2, restingHeartRate: 80, studyMinutes: 52 }
];

export const mockWeeklyMovementPlan: WeeklyMovementPlan = {
  studentId: 'student_minh_001',
  weekStartDate: '2026-05-04',
  safetyNote:
    'This plan uses light to moderate school-appropriate movement. It is not a medical prescription.',
  items: [
    { id: 'move_mon', day: 'Monday', title: 'Short walk after study', durationMinutes: 10, intensity: 'light', description: 'Walk comfortably after finishing the main lesson.', completed: true },
    { id: 'move_tue', day: 'Tuesday', title: 'Stretching break', durationMinutes: 5, intensity: 'light', description: 'Gentle stretching between two study sessions.', completed: true },
    { id: 'move_wed', day: 'Wednesday', title: 'PE activity log', durationMinutes: 30, intensity: 'moderate', description: 'Log activity from PE class.', completed: false }
  ]
};

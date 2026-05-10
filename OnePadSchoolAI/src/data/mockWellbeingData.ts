import type { WellbeingCheckIn } from '../types/wellbeingTypes';

export const mockWellbeingCheckIns: WellbeingCheckIn[] = [
  {
    id: 'well_2026_05_01',
    studentId: 'student_minh_001',
    date: '2026-05-01',
    moodLabel: 'okay',
    schoolStressLevel: 2,
    socialComfortLevel: 4,
    wantsAdultSupport: false,
    visibility: 'private'
  },
  {
    id: 'well_2026_05_04',
    studentId: 'student_minh_001',
    date: '2026-05-04',
    moodLabel: 'tired',
    schoolStressLevel: 4,
    socialComfortLevel: 3,
    wantsAdultSupport: true,
    preferredSupportRole: 'homeroom_teacher',
    privateReflection: 'Math felt too much today. I want a shorter task.',
    safeSummary:
      'The student reports school workload feeling too heavy today and asks for a shorter support task.',
    visibility: 'school_safe_summary'
  },
  {
    id: 'well_2026_05_06',
    studentId: 'student_minh_001',
    date: '2026-05-06',
    moodLabel: 'stressed',
    schoolStressLevel: 4,
    socialComfortLevel: 3,
    wantsAdultSupport: true,
    preferredSupportRole: 'subject_teacher',
    privateReflection: 'I do not understand word problems.',
    safeSummary:
      'The student asks for help with Math word problems and may benefit from simpler practice.',
    visibility: 'school_safe_summary'
  }
];

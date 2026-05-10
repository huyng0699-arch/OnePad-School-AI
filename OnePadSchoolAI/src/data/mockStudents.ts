export type DemoStudent = {
  id: string;
  name: string;
  classId: string;
  profile: string;
};

export const mockStudents: DemoStudent[] = [
  {
    id: 'student_minh_001',
    name: 'Minh Nguyen',
    classId: 'class_8a',
    profile: 'Math weak + low energy',
  },
  {
    id: 'student_an_002',
    name: 'An Tran',
    classId: 'class_8a',
    profile: 'Advanced learner',
  },
  {
    id: 'student_linh_003',
    name: 'Linh Pham',
    classId: 'class_8a',
    profile: 'Balanced learner',
  },
  {
    id: 'student_khoa_004',
    name: 'Khoa Le',
    classId: 'class_8a',
    profile: 'Reading comprehension weak',
  },
];

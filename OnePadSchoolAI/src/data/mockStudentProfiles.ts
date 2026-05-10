import { mockStudents } from './mockStudents';

export const mockStudentProfiles = mockStudents.map((student) => ({
  studentId: student.id,
  studentName: student.name,
  classId: student.classId,
  profileSummary: student.profile,
}));

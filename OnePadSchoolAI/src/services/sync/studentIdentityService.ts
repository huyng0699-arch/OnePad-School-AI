import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBackendBaseUrl } from './syncConfig';

export type StudentIdentity = {
  studentId: string;
  classId: string;
  schoolId: string;
  name?: string;
};

const IDENTITY_KEY = 'onepad_student_identity_v1';
const DEFAULT_IDENTITY: StudentIdentity = {
  studentId: process.env.EXPO_PUBLIC_ONEPAD_STUDENT_ID?.trim() || 'stu_001',
  classId: process.env.EXPO_PUBLIC_ONEPAD_CLASS_ID?.trim() || 'class_8a',
  schoolId: process.env.EXPO_PUBLIC_ONEPAD_SCHOOL_ID?.trim() || 'school_001'
};

export async function getStudentIdentity(): Promise<StudentIdentity> {
  try {
    const raw = await AsyncStorage.getItem(IDENTITY_KEY);
    if (raw) {
      return { ...DEFAULT_IDENTITY, ...JSON.parse(raw) as Partial<StudentIdentity> };
    }
  } catch {
    // fall through to env/demo identity
  }
  return DEFAULT_IDENTITY;
}

export async function saveStudentIdentity(identity: StudentIdentity): Promise<void> {
  await AsyncStorage.setItem(IDENTITY_KEY, JSON.stringify(identity));
}

export async function buildStudentAuthHeaders(): Promise<Record<string, string>> {
  const identity = await getStudentIdentity();
  return {
    'x-student-user-id': identity.studentId,
    'x-student-role': 'student',
    'x-demo-user-id': identity.studentId,
    'x-demo-role': 'student'
  };
}

export async function refreshStudentIdentityFromBootstrap(): Promise<StudentIdentity> {
  const baseUrl = getBackendBaseUrl();
  if (!baseUrl) {
    return getStudentIdentity();
  }

  const current = await getStudentIdentity();
  let json: unknown;
  try {
    const headers = await buildStudentAuthHeaders();
    const response = await fetch(`${baseUrl}/v1/student/bootstrap?studentId=${encodeURIComponent(current.studentId)}`, { headers });
    json = await response.json();
  } catch {
    return current;
  }
  const typed = json as { profile?: Partial<StudentIdentity> };
  const profile = typed.profile;
  if (!profile?.studentId || !profile?.classId || !profile?.schoolId) {
    return current;
  }

  const next: StudentIdentity = {
    studentId: String(profile.studentId),
    classId: String(profile.classId),
    schoolId: String(profile.schoolId),
    name: typeof profile.name === 'string' ? profile.name : undefined
  };
  await saveStudentIdentity(next);
  return next;
}

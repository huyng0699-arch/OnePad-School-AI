import { Platform } from "react-native";
import { buildStudentAuthHeaders, getStudentIdentity } from "../sync/studentIdentityService";

const API_BASE = (process.env.EXPO_PUBLIC_ONEPAD_API_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

function resolveBase() {
  if (Platform.OS === "android" && API_BASE.includes("localhost")) {
    return API_BASE.replace("localhost", "10.0.2.2");
  }
  return API_BASE;
}

export async function getStudentBootstrap() {
  const identity = await getStudentIdentity();
  const res = await fetch(`${resolveBase()}/v1/student/bootstrap?studentId=${encodeURIComponent(identity.studentId)}`, { headers: await buildStudentAuthHeaders() });
  return await res.json();
}

export async function getPublishedLessons(classId: string) {
  const res = await fetch(`${resolveBase()}/v1/student/lessons?classId=${encodeURIComponent(classId)}`, { headers: await buildStudentAuthHeaders() });
  return await res.json();
}

export async function getPublishedLessonDetail(lessonId: string) {
  const res = await fetch(`${resolveBase()}/v1/student/lessons/${encodeURIComponent(lessonId)}`, { headers: await buildStudentAuthHeaders() });
  return await res.json();
}

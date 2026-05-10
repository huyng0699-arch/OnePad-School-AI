import { class8AStudents, guardianCases, protectedStudentProfiles, teacherCurrentUser } from "./demoData";

export const API_BASE = process.env.NEXT_PUBLIC_ONEPAD_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000";
const DEMO_HEADERS = { "x-demo-user-id": "teacher_001", "x-demo-role": "teacher" };

async function tryGetJson<T>(path: string): Promise<T | null> {
  try {
    const r = await fetch(`${API_BASE}${path}`, { cache: "no-store", headers: DEMO_HEADERS });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

async function tryPostJson<T>(url: string, payload: unknown): Promise<T | null> {
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...DEMO_HEADERS },
      body: JSON.stringify(payload),
    });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

export const onepadApi = {
  async teacherClassDashboard() {
    const backend = await tryGetJson<any>("/v1/teacher/classes/class_8a/dashboard");
    return backend?.ok ? { source: "backend", data: backend } : { source: "demo", data: { classId: "class_8a", students: class8AStudents } };
  },
  async teacherStudentReport(studentId = "stu_001") {
    const backend = await tryGetJson<any>(`/v1/teacher/students/${studentId}/report`);
    return backend?.ok ? { source: "backend", data: backend } : { source: "demo", data: class8AStudents.find((s) => s.id === studentId) ?? class8AStudents[0] };
  },
  async guardianSharedSignals(studentId = "stu_001") {
    const backend = await tryGetJson<any>(`/v1/teacher/students/${studentId}/support-summary`);
    return backend?.ok ? { source: "backend", data: backend } : { source: "demo", data: guardianCases.find((g) => g.studentId === studentId) ?? guardianCases[0] };
  },
  async wellbeingClassSummary(classId = "class_8a") {
    const backend = await tryGetJson<any>(`/v1/teacher/classes/${classId}/wellbeing-summary`);
    return backend?.ok ? { source: "live_backend", data: backend } : { source: "demo_seed", data: { ok: true, items: [] } };
  },
  async supportQueue() {
    const backend = await tryGetJson<any>("/v1/teacher/support-queue");
    return backend?.ok ? { source: "live_backend", data: backend.queue } : { source: "demo_seed", data: [] };
  },
  async teacherTrendSummary(studentId = "stu_001") {
    const backend = await tryGetJson<any>(`/v1/teacher/students/${studentId}/trend-summary`);
    return backend?.ok ? { source: "live_backend", data: backend } : { source: "demo_seed", data: null };
  },
  async adminAiUsage() { return { localAiEvents: class8AStudents.reduce((a, s) => a + s.localAiEvents, 0), cloudAiEvents: 24, models: [{ modelId: "gemma-4-e2b-it", quantization: "int4", count: 220, success: 216, error: 4 }, { modelId: "gemini-2.5-flash", quantization: "cloud", count: 12, success: 12, error: 0 }] }; },
  async dbStats() { return { stats: { events: class8AStudents.reduce((a, s) => a + s.localAiEvents, 0) } }; },
  async teacherAiAssist(payload?: any): Promise<any> {
    const local = await tryPostJson<any>("/api/teacher-ai", payload);
    if (local?.ok) return local;
    const backend = await tryPostJson<any>(`${API_BASE}/v1/teacher/ai/assist`, payload);
    if (backend?.ok) return backend;
    return { ok: false, text: "", error: local?.error || backend?.error || "AI service is unavailable." };
  },
  async ingestStudentLogBatch(events: any[]): Promise<any> {
    const backend = await tryPostJson<any>(`${API_BASE}/v1/student/events/batch`, { events });
    return backend || { ok: true, accepted: events.map((event) => event.id), rejected: [], source: "teacher-local-demo" };
  },
  async syncedStudentSupportEvents(studentId = "student_minh_001"): Promise<any> {
    const backend = await tryGetJson<any>(`/api/students/${studentId}/support-events`);
    return backend?.ok ? { source: "backend", data: backend.events } : { source: "demo", data: [] };
  },
  async syncedTeacherSummary(studentId = "student_minh_001"): Promise<any> {
    const backend = await tryGetJson<any>(`/api/students/${studentId}/teacher-summary`);
    return backend?.ok ? { source: "backend", summary: backend.summary } : { source: "demo", summary: "No synced summary yet." };
  },
  async createAuthoringProject(_payload?: any): Promise<any> { return { ok: true, project: { id: "demo_project_001" } }; },
  async standardizeAuthoringProject(_id?: string, _payload?: any): Promise<any> { return { ok: true }; },
  async publishAuthoringProject(_id?: string, _payload?: any): Promise<any> { return { ok: true, lessonId: "lesson_demo_001" }; },
  async getAuthoringProject(_id?: string): Promise<any> { return { ok: true, project: { id: "demo_project_001" }, lesson: { structuredJson: {} } }; },
  async listAuthoringProjects(_teacherId?: string): Promise<any> { return { ok: true, projects: [] }; },
  async teacherPublishedLessons(_teacherId?: string): Promise<any> { return { ok: true, lessons: [] }; },
  async teacherLearningSignals(_studentId?: string): Promise<any> { return { ok: true, signals: [] }; },
  async setTeacherSingleClassBiology(_enabled: boolean): Promise<any> { return { ok: true }; },
  async dataset() { return { teacher: teacherCurrentUser, class8AStudents, guardianCases, protectedStudentProfiles }; },
};


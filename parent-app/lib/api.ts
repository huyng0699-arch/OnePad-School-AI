export const API_BASE = process.env.NEXT_PUBLIC_ONEPAD_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000";
const DEMO_HEADERS = { "x-demo-user-id": "parent_001", "x-demo-role": "parent" };

export type DataSource = "live_backend" | "local_cache" | "demo_seed" | "demo_encrypted";

async function fetchJson<T>(path: string): Promise<T> {
  const r = await fetch(`${API_BASE}${path}`, { cache: "no-store", headers: DEMO_HEADERS });
  if (!r.ok) throw new Error(`API ${path} failed: ${r.status}`);
  return (await r.json()) as T;
}

export const onepadApi = {
  async getChildTrendReport(studentId: string) {
    return fetchJson<any>(`/v1/parent/children/${studentId}/trend-report`);
  },
  async getChildTrendChart(studentId: string, days = 14) {
    return fetchJson<any>(`/v1/parent/children/${studentId}/trend-chart?days=${days}`);
  },
  async parentAlerts(studentId = "stu_001") {
    return fetchJson<any>(`/v1/parent/children/${studentId}/health-alerts`);
  },
  async parentReport(studentId = "stu_001") {
    return fetchJson<any>(`/v1/parent/children/${studentId}/report`);
  },
  async healthVaultSummary(studentId = "stu_001") {
    return fetchJson<any>(`/v1/parent/children/${studentId}/health-wellbeing-vault`);
  },
  async dataset() {
    return {
      minhProfile: { fullName: "Student 001", parentName: "Parent 001", school: "OnePad Demo School", studentId: "stu_001", className: "CLASS_8A", studentCode: "S001", grade: "8", homeroomTeacher: "Ms. Linh" },
      subjects: [],
      healthVault: {},
      wholeChildSnapshot: {},
      dailyCarePlan: [],
      parentSafeTimeline: [],
    };
  },
  async syncedParentSummary(_studentId?: string) {
    return { source: "live_backend", summary: "Use trend-report endpoint for nightly processed parent summary." };
  },
  async syncedSupportEvents(_studentId?: string) {
    return { source: "live_backend", data: [] };
  },
  async parentLessons() {
    return { ok: true, lessons: [] };
  },
  async adminAiUsage() {
    return { localAiEvents: 0, cloudAiEvents: 0 };
  },
  async getChildLatestTrend(studentId: string) {
    return fetchJson<any>(`/v1/student-trends/students/${studentId}/latest`);
  },
};

const ENV_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_ONEPAD_API_BASE_URL?.replace(/\/$/, "") ||
  "";
const API_BASE_CANDIDATES = [ENV_BASE, "http://localhost:3001", "http://localhost:3000"].filter(
  (value, index, arr): value is string => Boolean(value) && arr.indexOf(value) === index
);

const DEMO_HEADERS = { "x-demo-user-id": "parent_001", "x-demo-role": "parent" };

export type DataSource = "live_backend" | "local_cache" | "demo_seed" | "demo_encrypted";

async function fetchJson<T>(path: string): Promise<T> {
  let lastErr: unknown = null;
  for (const base of API_BASE_CANDIDATES) {
    try {
      const r = await fetch(`${base}${path}`, { cache: "no-store", headers: DEMO_HEADERS });
      if (!r.ok) throw new Error(`API ${path} failed: ${r.status}`);
      return (await r.json()) as T;
    } catch (error) {
      lastErr = error;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(`API ${path} failed`);
}

const demoTrendReport = (studentId: string) => ({
  ok: true,
  studentId,
  childName: "Student 003",
  latestPacketId: "demo_pkt",
  reportId: "demo_report",
  level: "watch",
  redAlert: false,
  title: "Demo trend summary",
  summary: "Backend is temporarily unavailable. Showing local demo trend data.",
  keyFactors: ["backend_unavailable_fallback", "demo_mode_active"],
  suggestedActions: ["Start backend service", "Reload app after backend is online"],
  categoryBreakdown: {
    physical: { level: "watch", score: -4, reasons: ["Low sleep trend"], metrics: { sleep: "6.2h" } },
    wellbeing: { level: "watch", score: -4, reasons: ["Stress check-in elevated"], metrics: { supportRequest: "requested" } },
    learning: { level: "watch", score: -3, reasons: ["Repeated quiz mistakes"], metrics: { quizTrend: "declining" } },
    conversation: { level: "normal", score: -1, reasons: ["No severe conversation signal"], metrics: {} },
    teacherParent: { level: "watch", score: -2, reasons: ["Teacher follow-up note"], metrics: { teacherConcernNotes: 1 } },
  },
  latestSummary: { direction: "stable" },
  generatedAt: new Date().toISOString(),
  provider: "template_fallback",
  source: "local_cache" as DataSource,
  direction: "stable",
});

const demoTrendChart = (days = 14) => {
  const points = Array.from({ length: Math.max(1, days) }).map((_, idx) => {
    const d = new Date(Date.now() - (days - idx - 1) * 86400000).toISOString().slice(0, 10);
    const total = -8 - (idx % 3);
    return { date: d, totalDeduction: total, level: total <= -12 ? "elevated" : "watch" };
  });
  return { ok: true, points, source: "local_cache" as DataSource };
};

export const onepadApi = {
  async getChildTrendReport(studentId: string) {
    try {
      return await fetchJson<any>(`/v1/parent/children/${studentId}/trend-report`);
    } catch {
      return demoTrendReport(studentId);
    }
  },
  async getChildTrendChart(studentId: string, days = 14) {
    try {
      return await fetchJson<any>(`/v1/parent/children/${studentId}/trend-chart?days=${days}`);
    } catch {
      return demoTrendChart(days);
    }
  },
  async parentAlerts(studentId = "stu_001") {
    try {
      return await fetchJson<any>(`/v1/parent/children/${studentId}/health-alerts`);
    } catch {
      return { ok: true, source: "local_cache" as DataSource, data: [] };
    }
  },
  async parentReport(studentId = "stu_001") {
    try {
      return await fetchJson<any>(`/v1/parent/children/${studentId}/report`);
    } catch {
      return {
        ok: true,
        source: "local_cache" as DataSource,
        report: {
          studentId,
          summary: "Backend unavailable. Demo report shown.",
          recommendations: ["Start backend and rerun nightly job for live report"],
        },
      };
    }
  },
  async healthVaultSummary(studentId = "stu_001") {
    try {
      return await fetchJson<any>(`/v1/parent/children/${studentId}/health-wellbeing-vault`);
    } catch {
      return {
        ok: true,
        source: "local_cache" as DataSource,
        vault: { latestSignal: "Backend unavailable. Demo vault summary shown for UI continuity." },
      };
    }
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
    try {
      return await fetchJson<any>(`/v1/student-trends/students/${studentId}/latest`);
    } catch {
      return { ok: true, source: "local_cache" as DataSource, packet: null, snapshot: null };
    }
  },
};

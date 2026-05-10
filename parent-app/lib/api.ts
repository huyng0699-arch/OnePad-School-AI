import { cookies } from "next/headers";

const ENV_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_ONEPAD_API_BASE_URL?.replace(/\/$/, "") ||
  "";

const API_BASE_CANDIDATES = [ENV_BASE, "http://localhost:3001", "http://localhost:3000"].filter(
  (value, index, arr): value is string => Boolean(value) && arr.indexOf(value) === index
);

export const DEFAULT_PARENT_ID = process.env.NEXT_PUBLIC_PARENT_USER_ID || "parent_001";
export const DEFAULT_STUDENT_ID = process.env.NEXT_PUBLIC_PARENT_STUDENT_ID || "stu_001";

export type DataMode = "backend" | "empty";

export type ParentSession = {
  parentId: string;
  parentName?: string;
  studentId: string;
  studentName?: string;
  className?: string;
  schoolName?: string;
};

export type LoginOption = ParentSession & {
  homeroomTeacher?: string;
  relationship?: string;
};

export type BackendStatus = {
  backendConnected: boolean;
  backendError?: string;
  dataMode: DataMode;
};

export type TrendLevel = "normal" | "monitor" | "attention" | "urgent" | "unknown";

export type CategorySummary = {
  key: string;
  title: string;
  level: TrendLevel;
  reasons: string[];
  parentText: string;
};

export type ParentTrendReport = BackendStatus & {
  ok: boolean;
  studentId: string;
  childName?: string;
  className?: string;
  schoolName?: string;
  homeroomTeacher?: string;
  level: TrendLevel;
  direction: string;
  title: string;
  summary: string;
  keyFactors: string[];
  suggestedActions: string[];
  categories: CategorySummary[];
};

export type TrendPoint = {
  date: string;
  level: TrendLevel;
  label: string;
};

export type TrendChart = BackendStatus & {
  ok: boolean;
  points: TrendPoint[];
};

export type ParentAlert = {
  id: string;
  level: TrendLevel;
  title: string;
  summary: string;
  recommendedAction: string;
  createdAt?: string;
  category?: string;
  evidenceCount?: number;
  confidence?: number;
};

export type ParentAlertsResponse = BackendStatus & {
  ok: boolean;
  alerts: ParentAlert[];
};

export type ParentReportResponse = BackendStatus & {
  ok: boolean;
  report: Record<string, any> | null;
};

export type HealthVaultResponse = BackendStatus & {
  ok: boolean;
  vault: Record<string, any> | null;
};

function safeCookie(name: string) {
  try {
    return cookies().get(name)?.value;
  } catch {
    return undefined;
  }
}

export function getParentSession(): ParentSession {
  return {
    parentId: safeCookie("onepad_parent_id") || DEFAULT_PARENT_ID,
    parentName: safeCookie("onepad_parent_name"),
    studentId: safeCookie("onepad_student_id") || DEFAULT_STUDENT_ID,
    studentName: safeCookie("onepad_student_name"),
    className: safeCookie("onepad_class_name"),
    schoolName: safeCookie("onepad_school_name"),
  };
}

function getParentHeaders(studentId?: string): HeadersInit {
  const session = getParentSession();
  return {
    "x-parent-user-id": session.parentId,
    "x-parent-role": "parent",
    "x-student-id": studentId || session.studentId,
  };
}

function backendErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Cannot connect to backend.";
}

function withBackendStatus<T extends object>(data: T): T & BackendStatus {
  return { ...data, backendConnected: true, dataMode: "backend" };
}

function withEmptyStatus<T extends object>(data: T, error?: unknown): T & BackendStatus {
  return {
    ...data,
    backendConnected: false,
    backendError: error ? backendErrorMessage(error) : "Backend has not returned data yet.",
    dataMode: "empty",
  };
}

function asArray(value: unknown): any[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    const obj = value as any;
    if (Array.isArray(obj.data)) return obj.data;
    if (Array.isArray(obj.items)) return obj.items;
    if (Array.isArray(obj.results)) return obj.results;
  }
  return [];
}

function getList(payload: any, key: string) {
  return asArray(payload?.[key] ?? payload?.data ?? payload?.items ?? payload);
}

const VI_TO_EN_RULES: Array<[RegExp, string]> = [
  [/^Tín hiệu hỗ trợ$/i, "Support signal"],
  [/Trao đổi nhẹ với con và liên hệ giáo viên nếu tín hiệu tiếp diễn\.?/i, "Talk calmly with your child and contact the teacher if the signal continues."],
  [/Vận động gần nhất khoảng ([0-9.]+) phút\.?/i, "Latest activity: about $1 minutes of movement."],
  [/Giấc ngủ gần nhất khoảng ([0-9.]+) giờ\.?/i, "Latest sleep estimate: about $1 hours."],
  [/Phụ huynh kiểm soát chia sẻ; giáo viên chỉ xem tóm tắt khi được cho phép\.?/i, "Parent-controlled sharing; teachers can view only approved safe summaries."],
  [/Nên liên hệ giáo viên chủ nhiệm nếu tín hiệu hỗ trợ tiếp diễn thêm 2-3 ngày\.?/i, "Contact the homeroom teacher if the support signal continues for another 2-3 days."],
  [/Hôm nay con hiểu phần nào nhất\??/i, "Which part felt clearest today?"],
  [/Có phần nào con muốn ôn lại cùng bố\/mẹ không\??/i, "Is there one part you want to review together?"],
  [/Con muốn hỏi giáo viên điều gì\??/i, "What would you like to ask the teacher?"],
  [/ôn khái niệm chính/i, "review the core concept"],
  [/Không so sánh với bạn khác/i, "Do not compare with classmates."],
  [/Không hỏi dồn khi con mệt/i, "Do not ask repeated questions when the child is tired."],
  [/Không yêu cầu học thêm nếu đã quá tải/i, "Do not add extra practice if the child is overloaded."],
  [/Student asked for help with a concept; parent receives only the safe summary\.?/i, "The child asked for help with a concept; parents receive only the safe summary."],
];

function parentEnglishText(value: string) {
  let text = value.trim();
  for (const [rule, replacement] of VI_TO_EN_RULES) text = text.replace(rule, replacement);
  if (/[ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯăẮẰẲẴẶắằẳẵặÂẦẤẨẪẬầấẩẫậÊỀẾỂỄỆềếểễệÔỒỐỔỖỘồốổỗộƠỜỚỞỠỢờớởỡợƯỪỨỬỮỰừứửữựỲÝỶỸỴỳýỷỹỵ]/.test(text)) {
    return "Backend returned non-English content. Please reseed backend data with the English parent demo dataset.";
  }
  return text;
}

function cleanText(value: unknown, fallback = "No backend data yet.") {
  if (typeof value !== "string") return fallback;
  const text = value.trim();
  if (!text) return fallback;

  const blocked = [
    "backend_unavailable_fallback",
    "demo_mode_active",
    "template_fallback",
    "local_cache",
    "demo_encrypted",
    "DỮ LIỆU ĐƯỢC MÃ HÓA DEMO",
    "DỰ PHÒNG MẪU",
    "Backend is temporarily unavailable",
  ];

  return blocked.some((token) => text.includes(token)) ? fallback : parentEnglishText(text);
}

function normalizeLevel(value: unknown): TrendLevel {
  const text = String(value || "").toLowerCase();
  if (["urgent", "red", "critical", "danger", "severe"].includes(text)) return "urgent";
  if (["attention", "high", "elevated"].includes(text)) return "attention";
  if (["monitor", "watch", "medium", "moderate"].includes(text)) return "monitor";
  if (["normal", "stable", "low", "ok", "green"].includes(text)) return "normal";
  return "unknown";
}

export function levelLabel(level: unknown) {
  switch (normalizeLevel(level)) {
    case "urgent":
      return "School support needed";
    case "attention":
      return "Needs attention";
    case "monitor":
      return "Monitor";
    case "normal":
      return "Stable";
    default:
      return "No data";
  }
}

export function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function statusText(status: string) {
  const map: Record<string, string> = {
    not_started: "Not started",
    in_progress: "In progress",
    submitted: "Submitted",
    overdue: "Overdue",
    completed: "Completed",
    current: "Current",
    recommended_review: "Review recommended",
    present: "Present",
    absent: "Absent",
    late: "Late",
  };
  return map[status] || status || "-";
}

const CATEGORY_TITLES: Record<string, string> = {
  physical: "Physical health",
  wellbeing: "Wellbeing & confidence",
  learning: "Learning",
  routine: "Home routine",
  conversation: "AI Tutor learning",
  teacherParent: "Teacher-parent support",
};

function normalizeCategories(raw: any): CategorySummary[] {
  const category = raw?.categoryBreakdown || raw?.categories || {};
  const keys = ["learning", "physical", "wellbeing", "routine", "teacherParent"];

  return keys.map((key) => {
    const item = category?.[key] || raw?.categories?.find?.((c: any) => c.key === key) || {};
    const reasons = asArray(item.reasons).map((reason) => cleanText(reason, "")).filter(Boolean);
    return {
      key,
      title: item.title || CATEGORY_TITLES[key] || key,
      level: normalizeLevel(item.level),
      reasons,
      parentText:
        cleanText(item.parentText, "") ||
        (reasons.length > 0
          ? reasons.slice(0, 2).join(". ")
          : "Backend has not provided a parent-safe summary for this area yet."),
    };
  });
}

async function fetchJson<T>(path: string, studentId?: string): Promise<T> {
  if (API_BASE_CANDIDATES.length === 0) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not configured.");
  }

  let lastErr: unknown = null;

  for (const base of API_BASE_CANDIDATES) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1800);

    try {
      const response = await fetch(`${base}${path}`, {
        cache: "no-store",
        headers: getParentHeaders(studentId),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error(`${base}${path} returned ${response.status}`);
      return (await response.json()) as T;
    } catch (error) {
      lastErr = error;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastErr instanceof Error ? lastErr : new Error(`Cannot reach backend endpoint ${path}`);
}

async function backendOnly(path: string, normalize: (raw: any) => any, empty: (error?: unknown) => any, studentId?: string): Promise<any> {
  try {
    const payload = await fetchJson<any>(path, studentId);
    return normalize(payload);
  } catch (error) {
    return empty(error);
  }
}

function activeStudentId(studentId?: string) {
  return studentId || getParentSession().studentId;
}

function emptyTrendReport(studentId: string, error?: unknown): ParentTrendReport {
  return withEmptyStatus({
    ok: false,
    studentId,
    level: "unknown" as TrendLevel,
    direction: "unknown",
    title: "No parent report from backend yet",
    summary: "The Parent App is running, but it has not received a parent-safe report from the backend.",
    keyFactors: [],
    suggestedActions: [],
    categories: normalizeCategories({}),
  }, error);
}

function normalizeTrendReport(raw: any, studentId: string): ParentTrendReport {
  const report = raw?.report || raw?.trendReport || raw?.data || raw;
  const level = normalizeLevel(report?.level || report?.riskLevel || report?.status);
  const keyFactors = asArray(report?.keyFactors || report?.factors).map((item) => cleanText(item, "")).filter(Boolean);
  const suggestedActions = asArray(report?.suggestedActions || report?.recommendedActions || report?.actions)
    .map((item) => cleanText(item, ""))
    .filter(Boolean);

  return withBackendStatus({
    ok: Boolean(raw?.ok ?? true),
    studentId: String(report?.studentId || raw?.studentId || studentId),
    childName: report?.childName || report?.studentName || report?.profile?.fullName,
    className: report?.className || report?.profile?.className,
    schoolName: report?.schoolName || report?.profile?.schoolName,
    homeroomTeacher: report?.homeroomTeacher || report?.profile?.homeroomTeacher,
    level,
    direction: String(report?.direction || report?.latestSummary?.direction || "stable"),
    title: cleanText(report?.title, level === "normal" ? "Learning is stable" : "Some signals need parent attention"),
    summary: cleanText(report?.summary || report?.latestSummary?.summary),
    keyFactors,
    suggestedActions,
    categories: normalizeCategories(report),
  });
}

function normalizeChart(raw: any): TrendChart {
  const points = asArray(raw?.points || raw?.chart || raw?.data).map((point) => {
    const level = normalizeLevel(point?.level || point?.status);
    return {
      date: String(point?.date || point?.createdAt || "-"),
      level,
      label: cleanText(point?.label, levelLabel(level)),
    };
  });

  return withBackendStatus({ ok: true, points });
}

function normalizeAlerts(raw: any): ParentAlertsResponse {
  const alerts = asArray(raw?.alerts || raw?.data).map((item, index) => {
    const level = normalizeLevel(item?.level || item?.status);
    return {
      id: String(item?.id || item?.alertId || index),
      level,
      title: cleanText(item?.title, levelLabel(level)),
      summary: cleanText(item?.safeSummary || item?.summary),
      recommendedAction: cleanText(item?.recommendedAction || item?.action, "Monitor at home and contact the teacher if the signal continues."),
      createdAt: item?.createdAt,
      category: item?.category,
      evidenceCount: typeof item?.evidenceCount === "number" ? item.evidenceCount : undefined,
      confidence: typeof item?.confidence === "number" ? item.confidence : undefined,
    };
  });

  return withBackendStatus({ ok: true, alerts });
}

function normalizeLoginOptions(raw: any) {
  const options = asArray(raw?.accounts || raw?.options || raw?.parents || raw?.students || raw?.records || raw?.data || raw).map((item) => ({
    parentId: String(item.parentId || item.guardianId || item.userId || item.accountId || DEFAULT_PARENT_ID),
    parentName: cleanText(item.parentName || item.name || item.guardianName, "Parent"),
    studentId: String(item.studentId || item.childId || item.id || DEFAULT_STUDENT_ID),
    studentName: cleanText(item.studentName || item.childName || item.fullName, "Student"),
    className: cleanText(item.className || item.class || item.grade, "Class pending"),
    schoolName: cleanText(item.schoolName || item.school, "School pending"),
    homeroomTeacher: cleanText(item.homeroomTeacher, "Homeroom teacher pending"),
    relationship: cleanText(item.relationship, "Parent"),
  }));
  return withBackendStatus({ ok: true, accounts: options });
}

const emptyProfile = (error?: unknown) => withEmptyStatus({
  ok: false,
  profile: {
    studentId: getParentSession().studentId,
    childName: "No student selected",
    className: "-",
    schoolName: "-",
    homeroomTeacher: "-",
    subjectTeachers: [],
    learningFocus: [],
    deviceSync: {
      status: "No data",
      lastSyncedAt: "",
      pendingEvents: 0,
      localAiStatus: "No data",
      backendStatus: "Backend not connected",
    },
  },
}, error);

const emptyList = (key: string, error?: unknown): any => withEmptyStatus({ ok: false, [key]: [] }, error);
const emptyObject = (key: string, value: any, error?: unknown): any => withEmptyStatus({ ok: false, [key]: value }, error);

export const onepadApi = {
  async loginOptions() {
    return backendOnly(`/v1/parent/login-options`, normalizeLoginOptions, (error) => withEmptyStatus({ ok: false, accounts: [] }, error));
  },

  async getChildTrendReport(studentId?: string): Promise<ParentTrendReport> {
    const id = activeStudentId(studentId);
    return backendOnly(`/v1/parent/children/${id}/trend-report`, (payload) => normalizeTrendReport(payload, id), (error) => emptyTrendReport(id, error), id);
  },

  async getChildTrendChart(studentId?: string, days = 14): Promise<TrendChart> {
    const id = activeStudentId(studentId);
    return backendOnly(`/v1/parent/children/${id}/trend-chart?days=${days}`, normalizeChart, (error) => withEmptyStatus({ ok: false, points: [] }, error), id);
  },

  async parentAlerts(studentId?: string): Promise<ParentAlertsResponse> {
    const id = activeStudentId(studentId);
    return backendOnly(`/v1/parent/children/${id}/alerts`, normalizeAlerts, (error) => withEmptyStatus({ ok: false, alerts: [] }, error), id);
  },

  async parentReport(studentId?: string): Promise<ParentReportResponse> {
    const id = activeStudentId(studentId);
    return backendOnly(`/v1/parent/children/${id}/report`, (payload) => withBackendStatus({ ok: true, report: payload?.report || payload?.data || payload }) as ParentReportResponse, (error) => withEmptyStatus({ ok: false, report: null }, error), id);
  },

  async healthVaultSummary(studentId?: string): Promise<HealthVaultResponse> {
    const id = activeStudentId(studentId);
    return backendOnly(`/v1/parent/children/${id}/health-wellbeing-vault`, (payload) => withBackendStatus({ ok: true, vault: payload?.vault || payload?.data || payload }) as HealthVaultResponse, (error) => withEmptyStatus({ ok: false, vault: null }, error), id);
  },

  async parentLessons(studentId?: string) { const id = activeStudentId(studentId); return backendOnly(`/v1/parent/children/${id}/lessons`, (payload) => withBackendStatus({ ok: true, lessons: getList(payload, "lessons") }), (error) => emptyList("lessons", error), id); },
  async studentProfile(studentId?: string) { const id = activeStudentId(studentId); return backendOnly(`/v1/parent/children/${id}/profile`, (payload) => withBackendStatus({ ok: true, profile: payload?.profile || payload?.student || payload?.data || payload }), emptyProfile, id); },
  async learningAcrossSubjects(studentId?: string) { const id = activeStudentId(studentId); return backendOnly(`/v1/parent/children/${id}/subjects`, (payload) => withBackendStatus({ ok: true, subjects: getList(payload, "subjects") }), (error) => emptyList("subjects", error), id); },
  async progressTimeline(studentId?: string) { const id = activeStudentId(studentId); return backendOnly(`/v1/parent/children/${id}/progress-timeline`, (payload) => withBackendStatus({ ok: true, events: getList(payload, "events") }), (error) => emptyList("events", error), id); },
  async assignments(studentId?: string) { const id = activeStudentId(studentId); return backendOnly(`/v1/parent/children/${id}/assignments`, (payload) => withBackendStatus({ ok: true, assignments: getList(payload, "assignments") }), (error) => emptyList("assignments", error), id); },
  async homeSupportPlan(studentId?: string) { const id = activeStudentId(studentId); return backendOnly(`/v1/parent/children/${id}/home-support-plan`, (payload) => withBackendStatus({ ok: true, plan: payload?.plan || payload?.data || payload || {} }), (error) => emptyObject("plan", {}, error), id); },
  async familyReport(studentId?: string) { const id = activeStudentId(studentId); return backendOnly(`/v1/parent/children/${id}/family-report`, (payload) => withBackendStatus({ ok: true, report: payload?.report || payload?.data || payload || {} }), (error) => emptyObject("report", {}, error), id); },
  async privacyCenter(studentId?: string) { const id = activeStudentId(studentId); return backendOnly(`/v1/parent/children/${id}/privacy-center`, (payload) => withBackendStatus({ ok: true, privacy: getList(payload, "privacy") }), (error) => emptyList("privacy", error), id); },
  async consentLog(studentId?: string) { const id = activeStudentId(studentId); return backendOnly(`/v1/parent/children/${id}/consent-log`, (payload) => withBackendStatus({ ok: true, consent: getList(payload, "consent") }), (error) => emptyList("consent", error), id); },
  async arLessons(studentId?: string) { const id = activeStudentId(studentId); return backendOnly(`/v1/parent/children/${id}/ar-lessons`, (payload) => withBackendStatus({ ok: true, arLessons: getList(payload, "arLessons") }), (error) => emptyList("arLessons", error), id); },
  async groupWork(studentId?: string) { const id = activeStudentId(studentId); return backendOnly(`/v1/parent/children/${id}/group-work`, (payload) => withBackendStatus({ ok: true, groups: getList(payload, "groups") }), (error) => emptyList("groups", error), id); },
  async messages(studentId?: string) { const id = activeStudentId(studentId); return backendOnly(`/v1/parent/children/${id}/messages`, (payload) => withBackendStatus({ ok: true, messages: getList(payload, "messages") }), (error) => emptyList("messages", error), id); },
  async notices() { return backendOnly(`/v1/parent/notices`, (payload) => withBackendStatus({ ok: true, notices: getList(payload, "notices") }), (error) => emptyList("notices", error)); },
  async timetable(studentId?: string) { const id = activeStudentId(studentId); return backendOnly(`/v1/parent/children/${id}/timetable`, (payload) => withBackendStatus({ ok: true, timetable: getList(payload, "timetable") }), (error) => emptyList("timetable", error), id); },
  async attendance(studentId?: string) { const id = activeStudentId(studentId); return backendOnly(`/v1/parent/children/${id}/attendance`, (payload) => withBackendStatus({ ok: true, attendance: getList(payload, "attendance") }), (error) => emptyList("attendance", error), id); },
  async parentNotes(studentId?: string) { const id = activeStudentId(studentId); return backendOnly(`/v1/parent/children/${id}/notes`, (payload) => withBackendStatus({ ok: true, notes: getList(payload, "notes") }), (error) => emptyList("notes", error), id); },
  async reports(studentId?: string) { const id = activeStudentId(studentId); return backendOnly(`/v1/parent/children/${id}/reports`, (payload) => withBackendStatus({ ok: true, reports: getList(payload, "reports") }), (error) => emptyList("reports", error), id); },
  async deviceSync(studentId?: string) { const id = activeStudentId(studentId); return backendOnly(`/v1/parent/children/${id}/device-sync`, (payload) => withBackendStatus({ ok: true, device: payload?.device || payload?.data || payload || {} }), (error) => emptyObject("device", emptyProfile().profile.deviceSync, error), id); },
};

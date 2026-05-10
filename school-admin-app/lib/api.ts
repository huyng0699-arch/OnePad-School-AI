import {
  demoAiUsage,
  demoArContent,
  demoAssignments,
  demoAuditLogs,
  demoClasses,
  demoLessons,
  demoParents,
  demoPrivacyReadiness,
  demoSchool,
  demoStudents,
  demoTeachers,
  guardianCases,
  schoolAccounts,
  teachingAssignments,
} from "./adminData";

export const API_BASE = process.env.NEXT_PUBLIC_ONEPAD_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000";
const DEMO_HEADERS = { "x-demo-user-id": "admin_001", "x-demo-role": "school_admin" };

async function tryGetJson<T>(path: string): Promise<T | null> {
  try {
    const r = await fetch(`${API_BASE}${path}`, { cache: "no-store", headers: DEMO_HEADERS });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

export const onepadApi = {
  async adminOverview() {
    const backend = await tryGetJson<any>("/v1/admin/schools/school_001/overview");
    return {
      source: backend?.ok ? "backend" : "demo",
      data: backend?.ok ? backend.overview : { school: demoSchool, classes: demoClasses },
    };
  },
  async classAggregate(classId = "class_8a") {
    const backend = await tryGetJson<any>(`/v1/admin/classes/${classId}/aggregate`);
    const cls = demoClasses.find((c) => c.id === classId) ?? demoClasses[0];
    return {
      source: backend?.ok ? "backend" : "demo",
      data: backend?.ok ? backend.aggregate : {
        className: cls.name,
        students: cls.students,
        completionRate: cls.completionRate,
        aiUsage: cls.localAiEvents,
      },
    };
  },
  async aiUsage() {
    const backend = await tryGetJson<any>("/v1/admin/ai-usage");
    return { source: backend?.ok ? "backend" : "demo", data: backend?.ok ? backend : demoAiUsage };
  },
  async privacyReadiness() {
    const backend = await tryGetJson<any>("/v1/admin/privacy-readiness");
    return { source: backend?.ok ? "backend" : "demo", data: backend?.ok ? backend.readiness ?? backend : demoPrivacyReadiness };
  },
  async syncedAuditEvents() {
    const backend = await tryGetJson<any>("/v1/admin/audit-logs");
    return backend?.ok ? { source: "live_backend", data: backend.items } : { source: "demo_seed", data: demoAuditLogs };
  },
  async healthWellbeingOverview(schoolId = "school_001") {
    const backend = await tryGetJson<any>(`/v1/admin/schools/${schoolId}/wellbeing-overview`);
    return backend?.ok ? { source: "live_backend", data: backend } : { source: "demo_seed", data: { ok: true } };
  },
  async trendOverview(schoolId = "school_001") {
    const backend = await tryGetJson<any>(`/v1/admin/schools/${schoolId}/trend-overview`);
    return backend?.ok ? { source: "live_backend", data: backend } : { source: "demo_seed", data: { ok: false } };
  },
  async dataset() {
    return {
      school: demoSchool,
      classes: demoClasses,
      students: demoStudents,
      teachers: demoTeachers,
      parents: demoParents,
      aiUsage: demoAiUsage,
      privacy: demoPrivacyReadiness,
      arContent: demoArContent,
      auditLogs: demoAuditLogs,
      assignments: teachingAssignments,
      assignmentOperations: demoAssignments,
      guardianCases,
      lessons: demoLessons,
      accounts: schoolAccounts,
    };
  },
};


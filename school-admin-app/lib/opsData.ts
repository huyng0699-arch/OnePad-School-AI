export type StudentTimelineEvent = {
  time: string;
  type: "attendance" | "assignment" | "device" | "support" | "ai";
  title: string;
  summary: string;
};

export type InterventionTask = {
  id: string;
  owner: string;
  task: string;
  dueDate: string;
  status: "Planned" | "In Progress" | "Done";
  priority: "High" | "Medium" | "Low";
};

export type TeacherRoleHistory = {
  effectiveDate: string;
  role: string;
  classScope: string;
  subjectScope: string;
  actor: string;
  reason: string;
};

export type PermissionExpiryItem = {
  id: string;
  teacherId: string;
  permissionSet: string;
  expiresAt: string;
  daysLeft: number;
  impact: string;
};

export type ApprovalItem = {
  id: string;
  category: "Privacy" | "AR Content" | "Permission";
  title: string;
  requestedBy: string;
  target: string;
  submittedAt: string;
  slaHours: number;
  status: "New" | "In Review" | "Approved" | "Rejected";
  riskLevel: "Low" | "Medium" | "High";
};

function addHours(base: Date, h: number) {
  const d = new Date(base);
  d.setHours(d.getHours() + h);
  return d;
}

export function getStudentTimeline(studentId: string): StudentTimelineEvent[] {
  const now = new Date();
  const idx = Number(studentId.replace("stu_", "")) || 1;
  return [
    { time: addHours(now, -2).toISOString(), type: "assignment", title: "Assignment progress updated", summary: "Class worksheet completion synced to aggregate tracker." },
    { time: addHours(now, -5).toISOString(), type: "ai", title: "Local AI usage recorded", summary: `Student triggered ${8 + (idx % 6)} local AI support events.` },
    { time: addHours(now, -9).toISOString(), type: "device", title: "Device health check", summary: idx % 4 === 0 ? "Client app update is pending." : "Device readiness is healthy." },
    { time: addHours(now, -18).toISOString(), type: "support", title: "Support coordinator review", summary: "School-safe intervention recommendation published (aggregate only)." },
    { time: addHours(now, -26).toISOString(), type: "attendance", title: "Attendance sync", summary: "Attendance trend included in class-level operation snapshot." },
  ];
}

export function getInterventionPlan(studentId: string): InterventionTask[] {
  return [
    { id: `${studentId}-task-1`, owner: "Homeroom Teacher", task: "Run 15-minute weekly learning checkpoint", dueDate: "2026-05-10", status: "In Progress", priority: "High" },
    { id: `${studentId}-task-2`, owner: "Subject Teacher", task: "Assign scaffolded revision worksheet", dueDate: "2026-05-12", status: "Planned", priority: "Medium" },
    { id: `${studentId}-task-3`, owner: "Parent", task: "Confirm home study routine in parent app", dueDate: "2026-05-14", status: "Planned", priority: "Medium" },
    { id: `${studentId}-task-4`, owner: "School Operations", task: "Verify device update and sync stability", dueDate: "2026-05-09", status: "Done", priority: "Low" },
  ];
}

export function getTeacherRoleHistory(teacherId: string): TeacherRoleHistory[] {
  return [
    { effectiveDate: "2026-01-10", role: "Subject Teacher", classScope: "8A", subjectScope: "Biology", actor: "School Admin Demo", reason: "Semester staffing plan" },
    { effectiveDate: "2026-02-18", role: "Subject Teacher", classScope: "8A, 8B", subjectScope: "Biology", actor: "School Admin Demo", reason: "Coverage extension" },
    { effectiveDate: "2026-04-02", role: "Education Guardian", classScope: "8A", subjectScope: "Consent-shared summaries only", actor: "School Admin Demo", reason: "Guardian case coverage" },
    { effectiveDate: "2026-04-22", role: "Subject Teacher", classScope: "8A", subjectScope: "Biology", actor: "School Admin Demo", reason: `Role normalization for ${teacherId}` },
  ];
}

export function getPermissionExpiryQueue(teacherId: string): PermissionExpiryItem[] {
  return [
    { id: `${teacherId}-exp-1`, teacherId, permissionSet: "Biology class scope", expiresAt: "2026-05-30", daysLeft: 24, impact: "Class 8A weekly lesson operations" },
    { id: `${teacherId}-exp-2`, teacherId, permissionSet: "Guardian shared summary", expiresAt: "2026-05-14", daysLeft: 8, impact: "Consent-based support coordination" },
    { id: `${teacherId}-exp-3`, teacherId, permissionSet: "AR assignment publish", expiresAt: "2026-05-21", daysLeft: 15, impact: "AR lesson rollout timeline" },
  ];
}

export function getApprovalInbox(): ApprovalItem[] {
  return [
    { id: "appr_001", category: "Privacy", title: "Guardian shared summary renewal", requestedBy: "Ms. Linh", target: "Class 8A consent group", submittedAt: "2026-05-06T08:10:00.000Z", slaHours: 24, status: "In Review", riskLevel: "High" },
    { id: "appr_002", category: "AR Content", title: "Solar System Model review", requestedBy: "Mr. Bao", target: "AR Library", submittedAt: "2026-05-06T09:05:00.000Z", slaHours: 48, status: "New", riskLevel: "Medium" },
    { id: "appr_003", category: "Permission", title: "Grant Class 8B Math access", requestedBy: "Mr. An", target: "Permission matrix", submittedAt: "2026-05-06T09:40:00.000Z", slaHours: 12, status: "In Review", riskLevel: "High" },
    { id: "appr_004", category: "Privacy", title: "Revoke expired guardian consent", requestedBy: "School Admin Demo", target: "stu_023", submittedAt: "2026-05-06T10:05:00.000Z", slaHours: 8, status: "New", riskLevel: "Medium" },
    { id: "appr_005", category: "AR Content", title: "Molecule Bonding Studio assignment", requestedBy: "Mr. An", target: "Classes 8B/8C", submittedAt: "2026-05-06T10:25:00.000Z", slaHours: 24, status: "Approved", riskLevel: "Low" },
  ];
}

export type Subject = "Biology" | "Math" | "Literature" | "English" | "Science" | "History";

export type SchoolProfile = { id: string; name: string; domain: string; academicYear: string; totalStudents: number; totalTeachers: number; totalParents: number; totalClasses: number; subjects: Subject[] };
export type SchoolClass = { id: "class_8a" | "class_8b" | "class_8c"; name: string; homeroomTeacherId: string; homeroomTeacherName: string; students: number; subjectsCovered: Subject[]; completionRate: number; localAiEvents: number; arAssignments: number };
export type SchoolStudent = { id: string; fullName: string; classId: SchoolClass["id"]; className: string; parentAccountId: string; assignedTeachersBySubject: Record<Subject, string>; homeroomTeacherId: string; deviceStatus: "Ready" | "Needs update" | "Offline"; lastSyncAt: string; assignmentCompletionRate: number; aggregateLearningStatus: "On track" | "Needs review" | "At risk"; localAiEvents: number };
export type TeacherAccount = { id: string; name: string; subjects: Subject[]; classesTaught: SchoolClass["id"][]; classes?: string[]; role?: string; homeroomClassId: SchoolClass["id"] | null; status: "Active" };
export type TeachingAssignment = { id: string; teacherId: string; classId: SchoolClass["id"]; subject: Subject; studentIds: "all_class" | string[]; startDate: string; status: "Active" | "Scheduled" };
export type GuardianCase = { studentId: string; assignedGuardianTeacherId: string; consentStatus: "consent_required" | "active"; summaryLevel: "school_safe"; active: boolean; lastReviewedAt: string };
export type SchoolAccount = { id: string; displayName: string; username: string; role: "School Admin" | "Teacher" | "Parent" | "Student"; scope: string; status: "Active" | "Pending setup" | "Locked" | "Suspended"; lastLogin: string; passwordPolicy: string };

function ago(hours: number) { const d = new Date(); d.setHours(d.getHours() - hours); return d.toISOString(); }
const names8A = ["Minh Nguyen","An Bui","Khoa Tran","Lan Pham","Duy Le","Vy Hoang","Nhi Do","Bao Vo","Hieu Dang","Trang Bui","Linh Tran","Quan Nguyen","Thu Pham","Giang Le","Nam Vo","Mai Hoang","Tuan Tran","Khanh Nguyen","Phuc Le","Yen Do"];
const names8B = ["An Tran","Hanh Nguyen","Phuoc Le","My Pham","Kiet Tran","Ha Nguyen","Quynh Le","Son Bui","Ngan Vo","Truc Tran","Dat Nguyen","Thao Le","Long Pham","Nhat Bui","Van Tran","Diem Nguyen","Khoi Le","Loan Pham","Vinh Tran","Nga Nguyen"];
const names8C = ["Hoa Nguyen","Tam Le","Binh Tran","Ly Pham","Tuyet Vo","Khang Nguyen","Dao Tran","My Linh Le","Thanh Pham","Quoc Tran","Nhu Nguyen","Anh Le","Huy Pham","Toan Tran","Kim Nguyen","Phuong Le","Nghia Tran","Uyen Nguyen","Tung Le","Bao Han Tran"];

export const demoSchool: SchoolProfile = { id: "school_001", name: "Truong THCS Nguyen Trai", domain: "nguyentrai.onepad.school", academicYear: "2026", totalStudents: 60, totalTeachers: 9, totalParents: 60, totalClasses: 3, subjects: ["Biology","Math","Literature","English","Science","History"] };
export const demoTeachers: TeacherAccount[] = [
  { id: "teacher_001", name: "Ms. Linh", subjects: ["Biology"], classesTaught: ["class_8a"], homeroomClassId: "class_8a", status: "Active" },
  { id: "teacher_002", name: "Mr. An", subjects: ["Math"], classesTaught: ["class_8a","class_8b"], homeroomClassId: "class_8b", status: "Active" },
  { id: "teacher_003", name: "Ms. Hoa", subjects: ["Literature"], classesTaught: ["class_8c"], homeroomClassId: "class_8c", status: "Active" },
  { id: "teacher_004", name: "Mr. Bao", subjects: ["Science"], classesTaught: ["class_8a","class_8b","class_8c"], homeroomClassId: null, status: "Active" },
  { id: "teacher_005", name: "Ms. Trang", subjects: ["English"], classesTaught: ["class_8a","class_8b"], homeroomClassId: null, status: "Active" },
  { id: "teacher_006", name: "Mr. Minh", subjects: ["History"], classesTaught: ["class_8a","class_8c"], homeroomClassId: null, status: "Active" },
  { id: "teacher_007", name: "Ms. Lan", subjects: ["Math"], classesTaught: ["class_8c"], homeroomClassId: null, status: "Active" },
  { id: "teacher_008", name: "Mr. Phuc", subjects: ["Biology"], classesTaught: ["class_8b","class_8c"], homeroomClassId: null, status: "Active" },
  { id: "teacher_009", name: "Ms. Mai", subjects: ["English"], classesTaught: ["class_8c"], homeroomClassId: null, status: "Active" },
];

function classTeacher(subject: Subject, classId: SchoolClass["id"]) { return demoTeachers.find((t) => t.subjects.includes(subject) && t.classesTaught.includes(classId))?.id ?? "teacher_001"; }
function createClassStudents(classId: SchoolClass["id"], names: string[], offset: number, homeroomTeacherId: string): SchoolStudent[] {
  return names.map((fullName, idx) => {
    const n = offset + idx + 1;
    return {
      id: `stu_${String(n).padStart(3, "0")}`,
      fullName,
      classId,
      className: classId.replace("class_", "").toUpperCase(),
      parentAccountId: `parent_${String(n).padStart(3, "0")}`,
      assignedTeachersBySubject: { Biology: classTeacher("Biology", classId), Math: classTeacher("Math", classId), Literature: classTeacher("Literature", classId), English: classTeacher("English", classId), Science: classTeacher("Science", classId), History: classTeacher("History", classId) },
      homeroomTeacherId,
      deviceStatus: n % 11 === 0 ? "Offline" : n % 4 === 0 ? "Needs update" : "Ready",
      lastSyncAt: ago((n % 24) + 1),
      assignmentCompletionRate: Number((0.62 + ((n * 7) % 32) / 100).toFixed(2)),
      aggregateLearningStatus: n % 9 === 0 ? "At risk" : n % 4 === 0 ? "Needs review" : "On track",
      localAiEvents: 12 + (n % 41),
    };
  });
}

export const demoStudents: SchoolStudent[] = [...createClassStudents("class_8a", names8A, 0, "teacher_001"), ...createClassStudents("class_8b", names8B, 20, "teacher_002"), ...createClassStudents("class_8c", names8C, 40, "teacher_003")];
export const demoClasses: SchoolClass[] = [
  { id: "class_8a", name: "8A", homeroomTeacherId: "teacher_001", homeroomTeacherName: "Ms. Linh", students: 20, subjectsCovered: demoSchool.subjects, completionRate: 0.82, localAiEvents: 450, arAssignments: 2 },
  { id: "class_8b", name: "8B", homeroomTeacherId: "teacher_002", homeroomTeacherName: "Mr. An", students: 20, subjectsCovered: demoSchool.subjects, completionRate: 0.77, localAiEvents: 388, arAssignments: 1 },
  { id: "class_8c", name: "8C", homeroomTeacherId: "teacher_003", homeroomTeacherName: "Ms. Hoa", students: 20, subjectsCovered: demoSchool.subjects, completionRate: 0.86, localAiEvents: 512, arAssignments: 3 },
];

export const teachingAssignments: TeachingAssignment[] = demoClasses.flatMap((c) => demoSchool.subjects.map((subject) => ({ id: `ta_${c.id}_${subject.toLowerCase()}`, teacherId: classTeacher(subject, c.id), classId: c.id, subject, studentIds: "all_class" as const, startDate: "2026-01-15", status: "Active" as const })));
teachingAssignments.push({ id: "ta_8a_bio_focus_group", teacherId: "teacher_001", classId: "class_8a", subject: "Biology", studentIds: ["stu_001","stu_014","stu_019"], startDate: "2026-03-20", status: "Active" });

export const guardianCases: GuardianCase[] = [
  { studentId: "stu_001", assignedGuardianTeacherId: "teacher_001", consentStatus: "active", summaryLevel: "school_safe", active: true, lastReviewedAt: "2026-05-07T01:48:00.000Z" },
  { studentId: "stu_014", assignedGuardianTeacherId: "teacher_001", consentStatus: "active", summaryLevel: "school_safe", active: true, lastReviewedAt: "2026-05-06T17:22:00.000Z" },
];

export const demoParents = demoStudents.map((s) => ({ id: s.parentAccountId, name: `Parent of ${s.fullName}`, linkedStudent: s.fullName, relationship: "Guardian" as const, consentStatus: guardianCases.some((g) => g.studentId === s.id) ? "Active" as const : "Pending" as const, lastActive: "Today, 08:00", communicationStatus: "Healthy" as const }));
export const demoAiUsage = { apiRequests: 39100, estimatedCloudCost: 0.01, localAiEvents: demoStudents.reduce((sum, s) => sum + s.localAiEvents, 0), cloudFallbackEvents: 226, tokenEstimate: 120430, averageLatencyMs: 128, failedRequests: 18, deviceCount: 60 };
export const demoPrivacyReadiness = { activeParentConsents: 58, revokedConsents: 2, guardianCases: guardianCases.length, blockedAccessAttempts: 12, rawDataProtectionStatus: "Protected" };
export const demoArContent = [
  { id: "ar_cell_001", title: "Cell Structure 3D Lab", subject: "Biology", uploadedBy: "Ms. Linh", status: "Approved", assignedClasses: ["8A", "8B"], completionRate: 0.84 },
  { id: "ar_solar_001", title: "Solar System Scale Model", subject: "Science", uploadedBy: "Mr. Bao", status: "Pending review", assignedClasses: [], completionRate: 0 },
  { id: "ar_molecule_001", title: "Molecule Bonding Studio", subject: "Science", uploadedBy: "Mr. Bao", status: "Approved", assignedClasses: ["8C"], completionRate: 0.71 },
  { id: "ar_history_001", title: "Ancient Citadel Walkthrough", subject: "History", uploadedBy: "Mr. Minh", status: "Needs revision", assignedClasses: ["8A"], completionRate: 0.43 },
];
export const demoAuditLogs = [
  { time: "2026-05-07 08:20", actor: "Principal Admin", role: "School Admin", action: "Reset password", targetType: "Account", target: "linh.tran@nguyentrai.edu.vn", result: "Success", reason: "Teacher requested reset", details: "Forced password change on next login" },
  { time: "2026-05-07 08:35", actor: "Principal Admin", role: "School Admin", action: "Approve AR content", targetType: "AR Content", target: "Cell Structure 3D Lab", result: "Success", reason: "Curriculum aligned", details: "Available for classes 8A and 8B" },
  { time: "2026-05-07 09:10", actor: "System Policy", role: "Policy Engine", action: "Block access", targetType: "Student privacy", target: "Private wellbeing detail", result: "Blocked", reason: "Insufficient role scope", details: "Teacher can view aggregate only" },
  { time: "2026-05-07 10:05", actor: "Academic Office", role: "School Admin", action: "Assign teacher", targetType: "Class", target: "Science 8C", result: "Success", reason: "Semester coverage update", details: "Mr. Bao assigned through 2026-12-31" },
  { time: "2026-05-07 11:40", actor: "Data Officer", role: "School Admin", action: "Export report", targetType: "Report", target: "Monthly AI usage", result: "Success", reason: "Internal review", details: "Aggregate export only" },
];
export const demoAssignments = [
  { id: "assign_bio_8a_cell", name: "Cell Structure Review", type: "Lesson quiz", subject: "Biology", class: "8A", teacher: "Ms. Linh", dueDate: "2026-05-10", completionRate: 0.86, missingCount: 3 },
  { id: "assign_math_8b_linear", name: "Linear Equation Practice", type: "Practice set", subject: "Math", class: "8B", teacher: "Mr. An", dueDate: "2026-05-11", completionRate: 0.79, missingCount: 5 },
  { id: "assign_eng_8c_speaking", name: "Speaking Reflection", type: "Teacher review", subject: "English", class: "8C", teacher: "Ms. Mai", dueDate: "2026-05-12", completionRate: 0.91, missingCount: 2 },
  { id: "assign_sci_8c_ar", name: "Molecule AR Exploration", type: "AR activity", subject: "Science", class: "8C", teacher: "Mr. Bao", dueDate: "2026-05-14", completionRate: 0.71, missingCount: 6 },
];
export const demoLessons = [
  { id: "lesson_cell_001", title: "Cell Structure Lab", subject: "Biology", grade: "8", owner: "Ms. Linh", createdBy: "Ms. Linh", status: "Published", publishedTo: ["8A", "8B"], arLinked: true },
  { id: "lesson_solar_001", title: "Solar System Model", subject: "Science", grade: "8", owner: "Mr. Bao", createdBy: "Mr. Bao", status: "Scheduled", publishedTo: ["8B"], arLinked: true },
  { id: "lesson_literature_001", title: "Narrative Writing Workshop", subject: "Literature", grade: "8", owner: "Ms. Hoa", createdBy: "Ms. Hoa", status: "Draft review", publishedTo: [], arLinked: false },
];
export const schoolAccounts: SchoolAccount[] = [
  { id: "acc_admin_001", displayName: "Principal Office", username: "admin@nguyentrai.edu.vn", role: "School Admin", scope: "Whole school", status: "Active", lastLogin: "Today, 08:00", passwordPolicy: "MFA required, 90-day rotation" },
  { id: "acc_teacher_001", displayName: "Tran Thi Linh", username: "linh.tran@nguyentrai.edu.vn", role: "Teacher", scope: "Biology 8A, Homeroom 8A", status: "Active", lastLogin: "Today, 07:45", passwordPolicy: "Managed by school admin" },
  { id: "acc_teacher_002", displayName: "Nguyen Van An", username: "an.nguyen@nguyentrai.edu.vn", role: "Teacher", scope: "Math 8A, Math 8B", status: "Active", lastLogin: "Yesterday, 16:20", passwordPolicy: "Managed by school admin" },
  { id: "acc_parent_001", displayName: "Parent of Minh Nguyen", username: "parent001@nguyentrai.edu.vn", role: "Parent", scope: "Student STU-8A-001", status: "Pending setup", lastLogin: "Never", passwordPolicy: "Temporary password issued" },
  { id: "acc_student_001", displayName: "Minh Nguyen", username: "stu001@nguyentrai.edu.vn", role: "Student", scope: "Class 8A tablet profile", status: "Active", lastLogin: "Today, 07:35", passwordPolicy: "Device-bound login" },
  { id: "acc_parent_locked", displayName: "Parent of An Bui", username: "parent002@nguyentrai.edu.vn", role: "Parent", scope: "Student STU-8A-002", status: "Locked", lastLogin: "2026-05-05 19:10", passwordPolicy: "Locked after failed attempts" },
];



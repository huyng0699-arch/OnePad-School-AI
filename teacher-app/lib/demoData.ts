export const teacherCurrentUser = {
  id: "teacher_001",
  name: "Ms. Linh",
  subjects: ["Biology"],
  subjectClasses: ["class_8a"],
  homeroomClassId: "class_8a",
  guardianStudentIds: ["stu_001", "stu_014"],
};

const names = [
  "Minh Nguyen", "Linh Pham", "Khoa Tran", "Vy Hoang", "Bao Le", "Nhi Dang", "Duc Vo", "Mai Bui", "Huy Do", "Trang Phan",
  "Quang Lam", "Gia Han", "Tuan Anh", "An Tran", "Ngoc Mai", "Phuc Nguyen", "Thao Nguyen", "Long Huynh", "Yen Nhi", "Nam Cao",
];

export const class8AStudents = Array.from({ length: 20 }).map((_, i) => {
  const id = `stu_${String(i + 1).padStart(3, "0")}`;
  const biology = i === 0 ? 72 : i === 13 ? 58 : 62 + ((i * 3) % 22);
  const supportCount = i === 0 ? 2 : i === 13 ? 3 : i % 5 === 0 ? 1 : 0;
  const attendance = i === 13 ? "Late" : i === 5 ? "Absent" : i % 7 === 0 ? "Excused" : "Present";
  return {
    id,
    studentId: id,
    fullName: names[i],
    biologyMastery: biology,
    masteryOverall: Math.round((biology + (60 + ((i * 5) % 20)) + (68 + ((i * 4) % 18))) / 3),
    mathMastery: i === 0 ? 64 : i === 13 ? 69 : 60 + ((i * 5) % 20),
    literatureMastery: i === 0 ? 81 : i === 13 ? 70 : 68 + ((i * 4) % 18),
    englishMastery: i === 0 ? 76 : i === 13 ? 73 : 65 + ((i * 6) % 17),
    supportSignals: supportCount,
    supportSignal: supportCount > 0 ? "learning_support" : "none",
    supportSeverityForTeacher: supportCount > 1 ? "medium" : supportCount > 0 ? "low" : "none",
    guardianCase: i === 0 || i === 13,
    parentConsent: i === 0 ? "active for safe wellbeing summary" : i === 13 ? "active for learning + wellbeing safe summary" : "not granted",
    arProgress: i === 0 ? "opened cell model" : i === 13 ? "cell model assigned" : i % 3 === 0 ? "completed lab" : "pending",
    localAiEvents: i === 0 ? 38 : i === 13 ? 31 : 14 + i,
    cloudAiEvents: i % 4 === 0 ? 2 : 1,
    missingAssignments: i % 4,
    trend: i % 6 === 0 ? "Needs review" : i % 5 === 0 ? "Improving" : "Stable",
    lastSync: `Today, 0${(i % 8) + 1}:2${i % 6}`,
    strongestSkill: ["visual reasoning", "lab observation", "vocabulary recall", "data reading"][i % 4],
    weakestSkill: ["cell membrane transport", "scientific explanation", "graph reading", "homework routine"][i % 4],
    safeSummary: supportCount ? "Needs a short, structured follow-up without exposing private raw text." : "On track with normal teacher-visible signals.",
    attendance,
    group: ["A - Lab captains", "B - Diagram builders", "C - Explain-back", "D - Review crew"][i % 4],
  };
});

export const assignments = [
  { id: "as_001", title: "Cell Organelle Map", type: "Practice", className: "8A", due: "Today 16:00", status: "Open", completion: 78, needsReview: 4, aiAllowed: "Local AI hints", difficulty: "Core" },
  { id: "as_002", title: "Membrane Transport Exit Ticket", type: "Quiz", className: "8A", due: "Tomorrow 08:00", status: "Draft", completion: 0, needsReview: 0, aiAllowed: "No AI", difficulty: "Standard" },
  { id: "as_003", title: "AR Cell Lab Reflection", type: "AR Lab", className: "8A", due: "Fri 10:00", status: "Open", completion: 52, needsReview: 7, aiAllowed: "Local AI hints", difficulty: "Stretch" },
  { id: "as_004", title: "Vocabulary Rescue Set", type: "Review", className: "8A", due: "Mon 09:00", status: "Scheduled", completion: 0, needsReview: 2, aiAllowed: "Local AI hints", difficulty: "Support" },
];

export const arAssignments = [
  { id: "ar_001", title: "Animal Cell AR Lab (Grade 8)", model: "animal-cell-grade8.glb", modelUrl: "/models/animal-cell-grade8.glb", target: "Whole class", completion: 68, status: "Live", prompt: "Open the AR model, rotate it, and identify nucleus, membrane, cytoplasm, and mitochondria." },
  { id: "ar_002", title: "Membrane Gate Simulation", model: "RobotExpressive.glb", modelUrl: "https://modelviewer.dev/shared-assets/models/RobotExpressive.glb", target: "Review group", completion: 31, status: "Draft", prompt: "Use the movable 3D object to explain how molecules pass through a membrane." },
  { id: "ar_003", title: "Microscope Safety Walkthrough", model: "NeilArmstrong.glb", modelUrl: "https://modelviewer.dev/shared-assets/models/NeilArmstrong.glb", target: "Absent students", completion: 44, status: "Live", prompt: "Place the model in the lab area and identify three safe handling actions." },
];

export const quizzes = [
  { id: "q_001", title: "Cell Parts Quick Check", questions: 12, avgScore: 74, status: "Published", skill: "cell organelles" },
  { id: "q_002", title: "Transport Misconception Probe", questions: 8, avgScore: 0, status: "Draft", skill: "membrane transport" },
  { id: "q_003", title: "Vocabulary Lightning Round", questions: 15, avgScore: 81, status: "Published", skill: "biology vocabulary" },
];

export const supportTickets = class8AStudents.filter((s) => s.supportSignal !== "none").map((s, idx) => ({
  id: `ticket_${idx + 1}`,
  studentId: s.id,
  studentName: s.fullName,
  severity: s.supportSeverityForTeacher,
  signal: s.weakestSkill,
  owner: idx % 2 ? "Homeroom" : "Subject teacher",
  nextAction: idx % 2 ? "Parent-safe check-in" : "Assign 10-minute review",
  status: idx === 0 ? "Waiting parent reply" : idx === 1 ? "Needs teacher review" : "Open",
}));

export const guardianCases = class8AStudents.filter((s) => s.guardianCase).map((s) => ({
  studentId: s.id,
  studentName: s.fullName,
  className: "Class 8A",
  consentStatus: "Active",
  latestSafeSummary: s.id === "stu_001" ? "Learning confidence dips during Biology reinforcement sessions." : "Stress rises during mixed-subject review blocks.",
  learningConcern: s.id === "stu_001" ? "Biology concept retention" : "Biology and math review pressure",
  wellbeingSafeSummary: s.id === "stu_001" ? "No urgent alert." : "Monitor social integration signal.",
  lastParentUpdate: "Today, 08:40",
  recommendedAction: "Use short, structured review and parent-aligned follow-up.",
}));

export const messages = [
  { id: "msg_001", from: "Mrs. Nguyen", student: "Minh Nguyen", channel: "Parent", status: "Needs reply", subject: "Review plan for cell transport", last: "Today 09:12" },
  { id: "msg_002", from: "School counselor", student: "An Tran", channel: "Internal", status: "Draft ready", subject: "Safe follow-up summary", last: "Today 08:45" },
  { id: "msg_003", from: "Mr. Hoang", student: "Vy Hoang", channel: "Parent", status: "Sent", subject: "AR lab completion", last: "Yesterday 17:20" },
];

export const timetable = [
  { time: "07:30", mon: "Biology 8A", tue: "Planning", wed: "Biology 8A", thu: "Homeroom 8A", fri: "Biology Lab" },
  { time: "09:15", mon: "Support queue", tue: "Biology 8B", wed: "Quiz review", thu: "Biology 8A", fri: "AR lab" },
  { time: "13:30", mon: "Guardian cases", tue: "Lesson authoring", wed: "Parent messages", thu: "Group work", fri: "Reports" },
];

export const demoStudents = class8AStudents;


export const protectedStudentProfiles = [
  {
    studentId: "stu_001",
    studentName: "Minh Nguyen",
    className: "Class 8A",
    parent: "Mrs. Nguyen",
    parentAppConnected: true,
    studentMobileConnected: true,
    advancedGuardianShare: true,
    shareScope: ["physical_health", "mental_wellbeing", "social_integration", "learning_logs", "daily_ai_reports"],
    consentUpdatedAt: "2026-05-07 08:18",
    consentExpiresAt: "2026-06-07 23:59",
    caution: "Support signal only. Not a medical diagnosis.",
    physicalHealth: {
      status: "Monitor",
      conditions: ["parent-reported mild asthma", "fatigue after short sleep"],
      sleepHours: 6.1,
      activityMinutes: 34,
      heartRate: "normal resting range",
      medicationNote: "Parent notes inhaler is available with school nurse when needed.",
      latestDeviceSync: "2026-05-07 09:05",
    },
    mentalWellbeing: {
      status: "Watch",
      parentSharedContext: ["low confidence during review blocks", "avoids asking questions in front of class"],
      socialSignal: "mild social hesitation in group presentation tasks",
      stressWindow: "Biology reinforcement and Math homework after 20:30",
      protectiveFactors: ["responds well to calm one-on-one explanation", "strong visual reasoning"],
    },
    aiDailyReports: [
      { at: "2026-05-07 09:10", source: "Student mobile + parent vault", severity: "medium", summary: "Sleep was below baseline and Biology review triggered repeated simplify-help requests.", analysis: "Teacher should use a quiet check-in and avoid public cold-calling. Short visual prompt likely helps." },
      { at: "2026-05-06 19:42", source: "Home support plan", severity: "low", summary: "Parent completed 10-minute diagram review. Confidence improved after explain-back.", analysis: "Repeat explain-back routine before exit ticket." },
    ],
    rawLogSamples: [
      { type: "health_signal_received", createdAt: "2026-05-07T08:52:00+07:00", privacyLevel: "parent_controlled", metadataJson: { sleepHours: 6.1, fatigue: "mild", activityMinutes: 34 } },
      { type: "local_ai_used", createdAt: "2026-05-07T08:58:00+07:00", privacyLevel: "school_safe", metadataJson: { action: "simplify_explanation", provider: "local", modelId: "gemma-4-e2b-it", status: "ok", latencyMs: 1120 } },
    ],
  },
  {
    studentId: "stu_014",
    studentName: "An Tran",
    className: "Class 8A",
    parent: "Mr. Tran",
    parentAppConnected: true,
    studentMobileConnected: true,
    advancedGuardianShare: true,
    shareScope: ["physical_health", "mental_wellbeing", "social_integration", "learning_logs", "daily_ai_reports"],
    consentUpdatedAt: "2026-05-07 07:52",
    consentExpiresAt: "2026-06-07 23:59",
    caution: "Support signal only. Not a medical diagnosis.",
    physicalHealth: {
      status: "Attention",
      conditions: ["parent-reported migraine history", "light sensitivity during long screen sessions"],
      sleepHours: 5.7,
      activityMinutes: 22,
      heartRate: "slightly elevated during quiz block",
      medicationNote: "Parent requests quiet rest option if headache signal appears.",
      latestDeviceSync: "2026-05-07 09:02",
    },
    mentalWellbeing: {
      status: "Elevated support",
      parentSharedContext: ["social anxiety-like avoidance in group speaking", "stress rises before timed quizzes"],
      socialSignal: "avoids group leadership; participates better via written role",
      stressWindow: "Timed Biology quiz and mixed-subject review blocks",
      protectiveFactors: ["strong written explanations", "works well with predictable roles"],
    },
    aiDailyReports: [
      { at: "2026-05-07 09:12", source: "Student mobile + parent vault", severity: "high", summary: "Timed quiz block showed elevated stress markers and repeated pause events.", analysis: "Use non-public check-in, offer written response path, and notify counselor if pattern persists." },
      { at: "2026-05-06 21:05", source: "Parent app", severity: "medium", summary: "Parent reported headache after long screen review and reduced sleep.", analysis: "Prefer paper/low-screen review tomorrow and seat near quieter area." },
    ],
    rawLogSamples: [
      { type: "wellbeing_signal_received", createdAt: "2026-05-07T08:50:00+07:00", privacyLevel: "parent_controlled", metadataJson: { stress: "elevated", context: "timed_quiz", socialAvoidance: true } },
      { type: "health_signal_received", createdAt: "2026-05-07T08:55:00+07:00", privacyLevel: "parent_controlled", metadataJson: { sleepHours: 5.7, headacheRisk: "monitor", activityMinutes: 22 } },
    ],
  },
];


export const minhProfile = {
  studentId: "stu_001",
  fullName: "Minh Nguyen",
  className: "Class 8A",
  grade: "Grade 8",
  school: "Truong THCS Nguyen Trai",
  homeroomTeacher: "Ms. Linh",
  age: 13,
  parentName: "Mrs. Nguyen",
  studentCode: "STU-8A-001",
};

export const subjects = [
  { subject: "Biology", mastery: 72, trend: "Needs review", weakSkills: ["mitochondria role", "cell membrane transport"], latestQuiz: 68, teacher: "Ms. Linh", parentAction: "Use 10-minute diagram explanation practice." },
  { subject: "Math", mastery: 64, trend: "Attention", weakSkills: ["moving terms", "dividing by coefficient"], latestQuiz: 61, teacher: "Mr. An", parentAction: "Practice 3 linear equations step-by-step." },
  { subject: "Literature", mastery: 81, trend: "Stable / proficient", weakSkills: ["inference question"], latestQuiz: 84, teacher: "Ms. Hoa", parentAction: "Ask one inference question after reading." },
  { subject: "English", mastery: 76, trend: "Developing", weakSkills: ["reading vocabulary"], latestQuiz: 78, teacher: "Ms. Trang", parentAction: "Read and explain 5 new words." },
  { subject: "Science", mastery: 70, trend: "Developing", weakSkills: ["concept consolidation"], latestQuiz: 73, teacher: "Mr. Bao", parentAction: "Review one concept map." },
  { subject: "History", mastery: 83, trend: "Proficient", weakSkills: ["timeline recall"], latestQuiz: 85, teacher: "Mr. Minh", parentAction: "Quick timeline recap." },
];

export const healthVault = {
  physical: {
    status: "Monitor",
    latestCheck: "Today, 08:45",
    activityMinutesToday: 42,
    activityTarget: 60,
    sleepLastNightHours: 6.4,
    sleepTrend: "Slightly below usual",
    restingHeartRateStatus: "Normal",
    fatigueSignal: "Mild",
    deviceSource: "Demo smartwatch signal",
    parentAction: "Encourage a calm evening routine and avoid extra late-night study.",
  },
  wellbeing: {
    status: "Monitor",
    learningStress: "Elevated during Math practice",
    confidenceSignal: "Low confidence detected in Math and Biology review",
    frustrationSignal: "Repeated requests for simpler explanations",
    socialSignal: "Normal classroom participation",
    recommendedParentAction: "Use short review sessions and ask Minh to explain one concept at a time.",
  },
  safety: {
    urgentAlert: false,
    latestUrgentAlertSummary: "No urgent parent action required.",
  },
  access: {
    sharedWithTeacher: false,
    parentControlled: true,
    lastViewedByParent: "Today, 08:48",
  },
};

export const wholeChildSnapshot = {
  academic: {
    overallMastery: 74,
    strongestSubjects: ["History", "Literature"],
    focusSubjects: ["Math", "Biology"],
    learningStyle: "Learns best with short explanation, visual diagram, then one explain-back question.",
    weeklyGoal: "Finish Biology cell review and raise Math equation confidence through 3 short sessions.",
  },
  physicalHealth: {
    status: "Monitor",
    sleepQuality: "6.4h last night, slightly below target",
    movement: "42/60 minutes active today",
    nutrition: "Lunch logged. Water intake needs one more bottle.",
    medicalNote: "Parent note: mild asthma history. No urgent symptom recorded today.",
    homeAction: "Keep study block before 21:00, light stretching, prepare inhaler for school bag if needed.",
  },
  mentalWellbeing: {
    status: "Needs gentle support",
    moodPattern: "Calm in morning, stress rises during Math homework after 20 minutes.",
    confidence: "Confidence dips when mistakes repeat, improves after step-by-step praise.",
    stressSignal: "Mild learning stress, no urgent wellbeing alert.",
    homeAction: "Use a 10-minute timer, praise effort first, ask Minh to choose one question to retry.",
  },
  characterGrowth: {
    status: "Growing",
    strengths: ["Responsible with group tasks", "Kind peer helper", "Asks for help when calm"],
    practiceFocus: "Build resilience after wrong answers and say the reasoning out loud.",
    teacherObservation: "Participates better when roles are clear and feedback is specific.",
    homeAction: "End study with one reflection: what did I try, what will I improve tomorrow?",
  },
  socialLife: {
    status: "Stable",
    groupWork: "Active in Biology group, sometimes quiet during Math peer practice.",
    friendshipSignal: "No isolation signal. Normal classroom participation.",
    homeAction: "Ask one low-pressure question about group work instead of asking only about scores.",
  },
};

export const dailyCarePlan = [
  { time: "After school", area: "Body", action: "Snack, water, 15 minutes outdoor movement", reason: "Supports energy before homework" },
  { time: "19:30", area: "Learning", action: "10 minutes Biology diagram, 10 minutes Math equation", reason: "Short sessions match Minh's stress pattern" },
  { time: "20:00", area: "Mind", action: "Break, breathing, choose one retry question", reason: "Prevents frustration loop" },
  { time: "Before bed", area: "Character", action: "One sentence reflection and bag preparation", reason: "Builds responsibility and calm routine" },
];

export const parentSafeTimeline = [
  { at: "Today 08:45", type: "Physical", title: "Activity below target", detail: "42/60 active minutes. Mild fatigue signal." },
  { at: "Today 10:20", type: "Learning", title: "Biology AR model opened", detail: "Cell model review completed with one AI explanation." },
  { at: "Today 14:05", type: "Character", title: "Group responsibility", detail: "Completed group role as diagram builder." },
  { at: "Yesterday 20:30", type: "Mind", title: "Math confidence dip", detail: "Needed simpler explanation after repeated equation mistakes." },
];

export const alerts = [
  { id: "a1", title: "Math practice needs review", evidenceCount: 4, confidence: 0.78, action: "Short equation practice" },
  { id: "a2", title: "Cell structure review recommended", evidenceCount: 3, confidence: 0.73, action: "Biology diagram review" },
  { id: "a3", title: "Sleep and activity slightly below usual", evidenceCount: 2, confidence: 0.62, action: "Calmer evening routine" },
  { id: "a4", title: "Currently no urgent parent action required", evidenceCount: 0, confidence: 1, action: "No urgent action" },
];


export const advancedGuardianShare = {
  enabled: true,
  teacherId: "teacher_001",
  teacherName: "Ms. Linh",
  role: "Homeroom teacher",
  updatedAt: "2026-05-07 08:18",
  expiresAt: "2026-06-07 23:59",
  scopes: [
    { id: "physical_health", label: "Physical health", enabled: true, detail: "sleep, activity, fatigue, parent-noted conditions" },
    { id: "mental_wellbeing", label: "Mental wellbeing", enabled: true, detail: "stress windows, confidence, frustration patterns" },
    { id: "social_integration", label: "Social integration", enabled: true, detail: "group participation and social hesitation signals" },
    { id: "learning_logs", label: "Learning logs", enabled: true, detail: "quiz, AI help, assignment behavior" },
    { id: "daily_ai_reports", label: "Daily AI reports", enabled: true, detail: "teacher-safe AI summaries with timestamps" },
  ],
  protectedChildren: [
    { studentId: "stu_001", name: "Minh Nguyen", mode: "Advanced guardian", reason: "mild asthma + confidence support" },
    { studentId: "stu_014", name: "An Tran", mode: "Advanced guardian", reason: "migraine history + social anxiety-like support signals" },
  ],
  accessLog: [
    { at: "2026-05-07 09:14", actor: "Ms. Linh", action: "Viewed guardian AI daily report for An Tran" },
    { at: "2026-05-07 09:10", actor: "Ms. Linh", action: "Viewed safe health summary for Minh Nguyen" },
    { at: "2026-05-07 08:18", actor: "Mrs. Nguyen", action: "Enabled advanced guardian sharing" },
  ],
};

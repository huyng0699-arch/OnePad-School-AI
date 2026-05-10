import { PrismaClient } from "../node_modules/.prisma/client";

const prisma = new PrismaClient();

function pad(num: number) {
  return String(num).padStart(3, "0");
}

async function main() {
  await prisma.school.upsert({
    where: { id: "school_001" },
    update: { name: "OnePad Demo School" },
    create: { id: "school_001", name: "OnePad Demo School" },
  });

  for (const classId of ["class_8a", "class_8b", "class_8c"]) {
    await prisma.classroom.upsert({
      where: { id: classId },
      update: {},
      create: { id: classId, schoolId: "school_001", name: classId.toUpperCase(), grade: "8" },
    });
  }

  await prisma.teacher.upsert({
    where: { id: "teacher_001" },
    update: { fullName: "Ms. Linh" },
    create: { id: "teacher_001", fullName: "Ms. Linh", schoolId: "school_001" },
  });

  await prisma.user.upsert({
    where: { id: "admin_001" },
    update: {},
    create: { id: "admin_001", role: "school_admin", displayName: "School Admin" },
  });

  const classes = ["class_8a", "class_8b", "class_8c"];
  let idx = 1;
  for (const classId of classes) {
    for (let i = 0; i < 20; i += 1) {
      const studentId = `stu_${pad(idx)}`;
      await prisma.student.upsert({
        where: { id: studentId },
        update: {},
        create: {
          id: studentId,
          fullName: `Student ${pad(idx)}`,
          classId,
          schoolId: "school_001",
        },
      });
      idx += 1;
    }
  }

  await prisma.teacherClassAccess.deleteMany({ where: { teacherId: "teacher_001" } });
  await prisma.teacherClassAccess.create({
    data: {
      id: "tca_teacher_001_class_8a_biology",
      teacherId: "teacher_001",
      classId: "class_8a",
      subjectId: "biology",
      roleType: "subject_teacher",
    },
  });

  for (let i = 1; i <= 20; i += 1) {
    const guardianId = `parent_${pad(i)}`;
    await prisma.guardian.upsert({
      where: { id: guardianId },
      update: {},
      create: { id: guardianId, fullName: `Parent ${pad(i)}` },
    });
    await prisma.guardianStudentLink.upsert({
      where: { id: `link_${guardianId}_stu_${pad(i)}` },
      update: {},
      create: {
        id: `link_${guardianId}_stu_${pad(i)}`,
        guardianId,
        studentId: `stu_${pad(i)}`,
        relationship: "parent",
      },
    });
  }
  await prisma.guardianStudentLink.upsert({
    where: { id: "link_parent_001_stu_003_extra" },
    update: {},
    create: {
      id: "link_parent_001_stu_003_extra",
      guardianId: "parent_001",
      studentId: "stu_003",
      relationship: "parent",
    },
  });

  await prisma.educationGuardianConsent.upsert({
    where: { id: "consent_stu_008" },
    update: { active: true },
    create: {
      id: "consent_stu_008",
      studentId: "stu_008",
      guardianTeacherId: "teacher_001",
      active: true,
      medicalSummarySafe: "Needs periodic hydration and low-stress schedule.",
      psychologicalSupportSummarySafe: "Benefits from confidence-building feedback.",
      supportPlan: "Weekly check-in and scaffolded quiz pacing.",
    },
  });
  await prisma.educationGuardianConsent.upsert({
    where: { id: "consent_stu_017" },
    update: { active: true },
    create: {
      id: "consent_stu_017",
      studentId: "stu_017",
      guardianTeacherId: "teacher_001",
      active: true,
      medicalSummarySafe: "Monitor fatigue signals during late sessions.",
      psychologicalSupportSummarySafe: "Responds well to short encouragement prompts.",
      supportPlan: "Micro-goals with parent-safe summary updates.",
    },
  });

  await prisma.rolePermission.deleteMany({ where: { schoolId: "school_001" } });
  const roles = [
    ["school_admin", true, true, true, false, false],
    ["subject_teacher", false, false, false, false, false],
    ["homeroom_teacher", false, false, false, false, false],
    ["education_guardian", false, false, false, true, false],
    ["parent", false, false, false, false, false],
    ["student", false, false, false, false, false],
  ] as const;
  for (const [role, canManageUsers, canManageRolePolicy, canManageAiPolicy, canViewSensitiveSupport, canViewRawPrivateText] of roles) {
    await prisma.rolePermission.create({
      data: {
        id: `rp_${role}`,
        schoolId: "school_001",
        role,
        canManageUsers,
        canManageRolePolicy,
        canManageAiPolicy,
        canViewSensitiveSupport,
        canViewRawPrivateText,
      },
    });
  }

  await prisma.assignment.upsert({
    where: { id: "assignment_demo_001" },
    update: { status: "assigned" },
    create: {
      id: "assignment_demo_001",
      classId: "class_8a",
      lessonId: "lesson_demo_001",
      title: "Cell Structure Practice",
      status: "assigned",
    },
  });

  await prisma.publishedLesson.upsert({
    where: { id: "published_demo_001" },
    update: {},
    create: {
      id: "published_demo_001",
      lessonId: "lesson_demo_001",
      structuredLessonId: "slr_demo_001",
      classId: "class_8a",
      subject: "Biology",
      grade: "8",
      publishedByTeacherId: "teacher_001",
      status: "active",
    },
  });

  await prisma.structuredLessonRecord.upsert({
    where: { id: "slr_demo_001" },
    update: {},
    create: {
      id: "slr_demo_001",
      authoringProjectId: "ap_demo_001",
      lessonId: "lesson_demo_001",
      title: "Cell Structure",
      subject: "Biology",
      grade: "8",
      language: "en",
      structuredJson: JSON.stringify({
        id: "lesson_demo_001",
        title: "Cell Structure",
        subject: "Biology",
        grade: "8",
        language: "en",
        estimatedMinutes: 35,
        learningObjectives: ["Identify core organelles", "Explain their functions"],
        pages: [
          {
            pageNumber: 1,
            title: "What is a cell",
            aiText: "A cell is the basic unit of life.",
            blocks: [
              { id: "b1", type: "heading", text: "Cell basics" },
              { id: "b2", type: "paragraph", text: "Cells form all living things." },
            ],
          },
        ],
        quizSeeds: [
          {
            id: "q1",
            type: "multiple_choice",
            question: "Which organelle stores genetic material?",
            options: ["Nucleus", "Ribosome", "Membrane"],
            correctAnswer: "Nucleus",
            explanation: "The nucleus stores DNA.",
            difficulty: "foundation",
            skillTag: "organelles",
          },
        ],
        teacherGuide: { lessonOverview: "Explain organelles with examples." },
        adaptiveVersions: { foundation: "Use visuals", standard: "Use examples", advanced: "Compare plant/animal cells" },
      }),
      teacherGuideJson: "{}",
      quizSeedJson: "[]",
      adaptiveVersionsJson: "{}",
    },
  });

  await prisma.apiKeyUsage.deleteMany({});
  await prisma.apiKeyUsage.create({
    data: {
      keyId: "key_demo_001",
      userId: "teacher_001",
      role: "subject_teacher",
      deviceId: "device_teacher_laptop",
      modelId: "gemma-4-e2b-it",
      quantization: "int4",
      requestCount: 42,
      tokenEstimate: 25000,
      costEstimate: 1.78,
      successCount: 40,
      errorCount: 2,
      lastUsedAt: new Date(),
    },
  });
  await prisma.apiKeyUsage.create({
    data: {
      keyId: "key_demo_002",
      userId: "teacher_001",
      role: "subject_teacher",
      deviceId: "device_teacher_laptop",
      modelId: "gemini-2.5-flash",
      quantization: "cloud",
      requestCount: 18,
      tokenEstimate: 12000,
      costEstimate: 3.21,
      successCount: 17,
      errorCount: 1,
      lastUsedAt: new Date(),
    },
  });

  await prisma.rankingSnapshot.deleteMany({ where: { schoolId: "school_001" } });
  for (let i = 1; i <= 10; i += 1) {
    await prisma.rankingSnapshot.create({
      data: {
        schoolId: "school_001",
        classId: "class_8a",
        studentId: `stu_${pad(i)}`,
        rankingType: "learning_growth",
        score: 70 + i,
        rank: i,
        trend: i % 2 === 0 ? "up" : "stable",
      },
    });
  }

  await prisma.studentTrendSnapshot.deleteMany({});
  await prisma.studentTrendReport.deleteMany({});
  await prisma.studentTrendChartPoint.deleteMany({});
  await prisma.studentEvent.deleteMany({});
  await prisma.quizResult.deleteMany({});
  await prisma.supportRequest.deleteMany({});
  await prisma.childHealthAlert.deleteMany({});
  await prisma.phoneHealthMetric.deleteMany({});

  const demoEncryptedSignals = Buffer.from(JSON.stringify({
    signals: [
      { category: "conversation", type: "safetyReviewSignal", severity: 5, safeLabel: "Safety review signal", safeSummary: "Student showed strong distress wording in AI conversation." },
      { category: "wellbeing", type: "helpSeekingSignal", severity: 4, safeLabel: "Help-seeking escalation", safeSummary: "Student repeatedly requested adult support." },
    ],
  })).toString("base64");

  const seedEvents = [
    { id: "evt_stu001_1", studentId: "stu_001", type: "quiz_progress", source: "learning", severity: "low", safeSummary: "Stable quiz progress.", metadataJson: JSON.stringify({ quizScore: 82 }) },
    { id: "evt_stu001_2", studentId: "stu_001", type: "wellbeing_signal_received", source: "support", severity: "low", safeSummary: "Mood stable with normal stress.", metadataJson: JSON.stringify({ moodLabel: "okay", schoolStressLevel: 2 }) },
    { id: "evt_stu002_1", studentId: "stu_002", type: "repeated_wrong_attempts", source: "learning", severity: "medium", safeSummary: "Repeated wrong attempts in core lesson.", metadataJson: JSON.stringify({ wrongAttempts: 4 }) },
    { id: "evt_stu002_2", studentId: "stu_002", type: "low_confidence_signal", source: "learning", severity: "medium", safeSummary: "Low confidence repeated in AI tutor session.", metadataJson: JSON.stringify({ lowConfidenceEvents: 3 }) },
    { id: "evt_stu003_1", studentId: "stu_003", type: "conversation_safety_review_signal", source: "demo_encrypted", severity: "high", safeSummary: "Encrypted conversation signal detected.", metadataJson: JSON.stringify({ encryptedSignalBundle: `DEMOENC:${demoEncryptedSignals}` }) },
    { id: "evt_stu003_2", studentId: "stu_003", type: "teacher_concern_note", source: "teacher", severity: "high", safeSummary: "Teacher concern note about prolonged distress and disengagement.", metadataJson: JSON.stringify({ note: "safe teacher note only" }) },
  ];
  for (const evt of seedEvents) {
    await prisma.studentEvent.create({
      data: {
        id: evt.id,
        studentId: evt.studentId,
        deviceId: "seed_device",
        sessionId: "seed_session",
        type: evt.type,
        source: evt.source,
        severity: evt.severity,
        safeSummary: evt.safeSummary,
        metadataJson: evt.metadataJson,
        privacyLevel: "sensitive",
        createdAt: new Date(),
      },
    });
  }

  await prisma.supportRequest.createMany({
    data: [
      { studentId: "stu_002", reason: "support_request", safeSummary: "Student requested adult support for school stress.", privacyLevel: "sensitive" },
      { studentId: "stu_003", reason: "support_request", safeSummary: "Student requested urgent adult support.", privacyLevel: "sensitive" },
    ],
  });

  await prisma.quizResult.createMany({
    data: [
      { studentId: "stu_001", lessonId: "lesson_demo_001", score: 8.2, total: 10, accuracy: 0.82 },
      { studentId: "stu_001", lessonId: "lesson_demo_001", score: 8.5, total: 10, accuracy: 0.85 },
      { studentId: "stu_002", lessonId: "lesson_demo_001", score: 7.3, total: 10, accuracy: 0.73 },
      { studentId: "stu_002", lessonId: "lesson_demo_001", score: 5.9, total: 10, accuracy: 0.59 },
      { studentId: "stu_003", lessonId: "lesson_demo_001", score: 6.2, total: 10, accuracy: 0.62 },
      { studentId: "stu_003", lessonId: "lesson_demo_001", score: 4.8, total: 10, accuracy: 0.48 },
    ],
  });

  const trendSeeds = [
    { studentId: "stu_001", level: "watch", totalDeduction: -6, redAlert: false, title: "Stable trend with light watch" },
    { studentId: "stu_002", level: "elevated", totalDeduction: -14, redAlert: false, title: "Elevated learning strain trend" },
    { studentId: "stu_003", level: "red", totalDeduction: -29, redAlert: true, title: "RED ALERT: multi-factor trend requires attention" },
  ];

  for (const seed of trendSeeds) {
    const packetSource = seed.studentId === "stu_003" ? "demo_encrypted" : seed.studentId === "stu_002" ? "demo_seed" : "live_backend";
    const packet = {
      id: `pkt_${seed.studentId}_seed`,
      studentId: seed.studentId,
      generatedAt: new Date().toISOString(),
      windowDays: [1, 3, 7, 14],
      level: seed.level,
      totalDeduction: seed.totalDeduction,
      direction: seed.level === "watch" ? "stable" : "worsening",
      confidence: "medium",
      negativeSummary: {
        id: `nps_${seed.studentId}_seed`,
        studentId: seed.studentId,
        date: new Date().toISOString().slice(0, 10),
        windowDays: [1, 3, 7, 14],
        totalDeduction: seed.totalDeduction,
        level: seed.level,
        direction: seed.level === "watch" ? "stable" : "worsening",
        confidence: "medium",
        items: [],
        topReasons: seed.level === "red"
          ? ["sleep drop + fatigue", "support request escalation", "learning frustration recurrence"]
          : ["learning load", "fatigue trend"],
        sourceCounts: { learning: 2, wellbeing: 1, physical: 1 },
        generatedAt: new Date().toISOString(),
        source: packetSource,
      },
      trendSignals: [],
      topContributingFactors: seed.level === "red"
        ? ["sleep drop + fatigue", "support request escalation", "learning frustration recurrence"]
        : ["learning load", "fatigue trend"],
      allowedAudiences: ["parent", "homeroom_teacher", "guardian_teacher", "admin"],
      redAlert: seed.redAlert,
      redAlertReasons: seed.redAlert ? ["overall_red_level", "multi_heavy_categories"] : [],
      rawPrivateTextIncluded: false,
      source: packetSource,
    };

    const snapshot = await prisma.studentTrendSnapshot.create({
      data: {
        studentId: seed.studentId,
        level: seed.level,
        totalDeduction: seed.totalDeduction,
        direction: seed.level === "watch" ? "stable" : "worsening",
        confidence: "medium",
        redAlert: seed.redAlert,
        packetJson: JSON.stringify(packet),
        source: packetSource,
        generatedAt: new Date(),
      },
    });

    await prisma.studentTrendReport.create({
      data: {
        studentId: seed.studentId,
        packetId: snapshot.id,
        audience: "parent",
        title: seed.title,
        summary: seed.redAlert
          ? "Multiple categories are elevated. Please review and connect with school support."
          : "Trend report generated from synced events and health/wellbeing signals.",
        keyFactors: JSON.stringify(packet.topContributingFactors),
        suggestedActions: JSON.stringify(seed.redAlert
          ? ["Open report now", "Contact school support", "Use a low-pressure routine tonight"]
          : ["Monitor daily", "Keep sleep consistent", "Coordinate focused review"]),
        redAlert: seed.redAlert,
        provider: "template_fallback",
        source: packetSource,
        generatedAt: new Date(),
      },
    });

    for (let d = 13; d >= 0; d -= 1) {
      const date = new Date(Date.now() - d * 86400000);
      const drift = seed.studentId === "stu_001" ? Math.round(Math.random() * -2) : seed.studentId === "stu_002" ? -8 - Math.round(Math.random() * 6) : -16 - Math.round(Math.random() * 12);
      await prisma.studentTrendChartPoint.create({
        data: {
          studentId: seed.studentId,
          date,
          totalDeduction: drift,
          level: drift <= -25 ? "red" : drift <= -16 ? "high" : drift <= -9 ? "elevated" : drift <= -4 ? "watch" : "normal",
          sleepDeduction: Math.round(drift * 0.2),
          fatigueDeduction: Math.round(drift * 0.2),
          studyLoadDeduction: Math.round(drift * 0.2),
          learningBehaviorDeduction: Math.round(drift * 0.15),
          wellbeingDeduction: Math.round(drift * 0.1),
          conversationDeduction: Math.round(drift * 0.075),
          supportSignalDeduction: Math.round(drift * 0.075),
        },
      });
    }
  }

  console.log("Seed completed: school_001, 3 classes, 60 students, teacher/parent/access/consent/ranking/api-usage.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());

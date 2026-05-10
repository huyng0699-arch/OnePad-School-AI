import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const now = new Date('2026-05-10T12:00:00.000Z').getTime();
const day = 86_400_000;
const j = (value: unknown) => JSON.stringify(value);

async function exec(sql: string, ...values: unknown[]) {
  await prisma.$executeRawUnsafe(sql, ...values);
}

const classes = [
  ['class_8a', 'Grade 8A', '8'],
  ['class_7b', 'Grade 7B', '7'],
  ['class_6c', 'Grade 6C', '6'],
];

const subjects = ['Biology', 'Math', 'English', 'Literature', 'Science', 'History'];
const subjectTeachers: Record<string, string> = {
  Biology: 'teacher_biology',
  Math: 'teacher_math',
  English: 'teacher_english',
  Literature: 'teacher_literature',
  Science: 'teacher_science',
  History: 'teacher_history',
};

const students = [
  ['stu_001', 'Mia Nguyen', 'class_8a', 'user_parent_001', 'guardian_parent_001', 'Hannah Nguyen'],
  ['stu_002', 'Daniel Tran', 'class_7b', 'user_parent_002', 'guardian_parent_002', 'Michael Tran'],
  ['stu_003', 'Anna Pham', 'class_6c', 'user_parent_003', 'guardian_parent_003', 'Linh Pham'],
];

const lessonDefs: Record<string, Array<[string, string]>> = {
  Biology: [['cell_structure_ar', 'Cell Structure with AR Models'], ['human_body_systems', 'Human Body Systems Review']],
  Math: [['fractions_ratios', 'Fractions and Ratios'], ['linear_patterns', 'Linear Patterns and Graphs']],
  English: [['school_routines_reading', 'Reading: School Routines'], ['opinion_paragraph', 'Opinion Paragraph Writing']],
  Literature: [['reflective_paragraph', 'Writing a Reflective Paragraph'], ['character_motivation', 'Character Motivation']],
  Science: [['forces_motion_lab', 'Forces and Motion Lab'], ['energy_transfer', 'Energy Transfer']],
  History: [['ancient_civilizations', 'Ancient Civilizations'], ['silk_road_trade', 'Silk Road Trade Routes']],
};

const baseAcc: Record<string, Record<string, number>> = {
  stu_001: { Biology: 0.86, Math: 0.62, English: 0.76, Literature: 0.68, Science: 0.81, History: 0.74 },
  stu_002: { Biology: 0.78, Math: 0.82, English: 0.88, Literature: 0.80, Science: 0.66, History: 0.90 },
  stu_003: { Biology: 0.73, Math: 0.58, English: 0.64, Literature: 0.85, Science: 0.75, History: 0.77 },
};

const profileMeta: Record<string, { weak: string[]; strong: string[] }> = {
  stu_001: { weak: ['Math', 'Literature'], strong: ['Biology', 'Science'] },
  stu_002: { weak: ['Science'], strong: ['English', 'History'] },
  stu_003: { weak: ['Math', 'English'], strong: ['Literature', 'Group Work'] },
};

async function seed() {
  await exec(`INSERT OR REPLACE INTO School (id,name,createdAt) VALUES (?,?,?)`, 'school_onepad_demo', 'OnePad Future School', now - 120 * day);

  for (const [id, name, grade] of classes) {
    await exec(`INSERT OR REPLACE INTO Classroom (id,schoolId,name,grade,createdAt) VALUES (?,?,?,?,?)`, id, 'school_onepad_demo', name, grade, now - 100 * day);
  }

  const users = [
    ['user_parent_001', 'parent', 'Hannah Nguyen', 'hannah.nguyen@example.demo'],
    ['user_parent_002', 'parent', 'Michael Tran', 'michael.tran@example.demo'],
    ['user_parent_003', 'parent', 'Linh Pham', 'linh.pham@example.demo'],
    ['user_teacher_homeroom_8a', 'teacher', 'Emily Carter', 'emily.carter@example.demo'],
    ['user_teacher_biology', 'teacher', 'Dr. Oliver Reed', 'oliver.reed@example.demo'],
    ['user_teacher_math', 'teacher', 'Sophia Miller', 'sophia.miller@example.demo'],
    ['user_teacher_english', 'teacher', 'Grace Wilson', 'grace.wilson@example.demo'],
    ['user_teacher_literature', 'teacher', 'Noah Bennett', 'noah.bennett@example.demo'],
    ['user_teacher_science', 'teacher', 'Ava Johnson', 'ava.johnson@example.demo'],
    ['user_teacher_history', 'teacher', 'Ethan Brooks', 'ethan.brooks@example.demo'],
    ['user_teacher_wellbeing', 'teacher', 'Maya Singh', 'maya.singh@example.demo'],
  ];
  for (const [id, role, displayName, email] of users) {
    await exec(`INSERT OR REPLACE INTO User (id,role,displayName,email,createdAt) VALUES (?,?,?,?,?)`, id, role, displayName, email, now - 90 * day);
  }

  const teachers = [
    ['teacher_homeroom_8a', 'user_teacher_homeroom_8a', 'Emily Carter'],
    ['teacher_biology', 'user_teacher_biology', 'Dr. Oliver Reed'],
    ['teacher_math', 'user_teacher_math', 'Sophia Miller'],
    ['teacher_english', 'user_teacher_english', 'Grace Wilson'],
    ['teacher_literature', 'user_teacher_literature', 'Noah Bennett'],
    ['teacher_science', 'user_teacher_science', 'Ava Johnson'],
    ['teacher_history', 'user_teacher_history', 'Ethan Brooks'],
    ['teacher_wellbeing', 'user_teacher_wellbeing', 'Maya Singh'],
  ];
  for (const [id, userId, fullName] of teachers) {
    await exec(`INSERT OR REPLACE INTO Teacher (id,userId,fullName,schoolId,createdAt) VALUES (?,?,?,?,?)`, id, userId, fullName, 'school_onepad_demo', now - 90 * day);
  }

  for (const [studentId, name, classId, parentUserId, guardianId, guardianName] of students) {
    await exec(`INSERT OR REPLACE INTO User (id,role,displayName,email,createdAt) VALUES (?,?,?,?,?)`, `user_${studentId}`, 'student', name, `${studentId}@student.example.demo`, now - 90 * day);
    await exec(`INSERT OR REPLACE INTO Student (id,userId,fullName,classId,schoolId,createdAt) VALUES (?,?,?,?,?,?)`, studentId, `user_${studentId}`, name, classId, 'school_onepad_demo', now - 90 * day);
    await exec(`INSERT OR REPLACE INTO Guardian (id,userId,fullName,createdAt) VALUES (?,?,?,?)`, guardianId, parentUserId, guardianName, now - 90 * day);
    await exec(`INSERT OR REPLACE INTO GuardianStudentLink (id,guardianId,studentId,relationship,createdAt) VALUES (?,?,?,?,?)`, `link_${guardianId}_${studentId}`, guardianId, studentId, 'parent', now - 90 * day);
  }

  for (const [classId] of classes) {
    await exec(`INSERT OR REPLACE INTO TeacherClassAccess (id,teacherId,classId,subjectId,roleType,createdAt) VALUES (?,?,?,?,?,?)`, `tca_${classId}_homeroom`, 'teacher_homeroom_8a', classId, 'Homeroom', 'homeroom', now - 90 * day);
    for (const subject of subjects) {
      await exec(`INSERT OR REPLACE INTO TeacherClassAccess (id,teacherId,classId,subjectId,roleType,createdAt) VALUES (?,?,?,?,?,?)`, `tca_${classId}_${subject.toLowerCase()}`, subjectTeachers[subject], classId, subject, 'subject_teacher', now - 90 * day);
    }
    await exec(`INSERT OR REPLACE INTO TeacherClassAccess (id,teacherId,classId,subjectId,roleType,createdAt) VALUES (?,?,?,?,?,?)`, `tca_${classId}_wellbeing`, 'teacher_wellbeing', classId, 'Wellbeing', 'education_guardian', now - 90 * day);
  }

  for (const [subject, lessons] of Object.entries(lessonDefs)) {
    for (const [suffix, title] of lessons) {
      await exec(`INSERT OR REPLACE INTO Lesson (id,subject,title,grade,createdAt) VALUES (?,?,?,?,?)`, `lesson_${suffix}`, subject, title, '8', now - 30 * day);
    }
  }

  for (const [studentId, studentName, classId] of students) {
    const meta = profileMeta[studentId];
    for (const [table, column] of [
      ['StudentEvent', 'studentId'], ['QuizResult', 'studentId'], ['PhoneHealthMetric', 'studentId'], ['ChildHealthAlert', 'studentId'],
      ['ParentChildReport', 'studentId'], ['StudentTrendChartPoint', 'studentId'], ['StudentTrendReport', 'studentId'], ['StudentTrendSnapshot', 'studentId'],
      ['EducationGuardianConsent', 'studentId'], ['GroupWorkEvent', 'studentId'], ['LocalAiStatusReport', 'studentId'], ['SupportRequest', 'studentId'], ['TeacherStudentReport', 'studentId'],
      ['SafeSummary', 'studentId'], ['HiddenSignal', 'studentId'], ['RankingSnapshot', 'studentId'],
    ]) {
      await exec(`DELETE FROM ${table} WHERE ${column} = ?`, studentId);
    }
    await exec(`DELETE FROM Assignment WHERE studentId = ? OR classId = ?`, studentId, classId);

    const assignments = [
      ['Math', 'fractions_ratios', 'Fractions: compare and simplify', 'in_progress', 2],
      ['Biology', 'cell_structure_ar', 'Cell Structure AR Review', 'submitted', 1],
      ['English', 'school_routines_reading', 'Reading Practice: School Routines', 'submitted', -1],
      ['Literature', 'reflective_paragraph', 'Write an 8-sentence reflective paragraph', 'overdue', -2],
      ['Science', 'forces_motion_lab', 'Forces Lab Observation Sheet', 'not_started', 4],
      ['History', 'ancient_civilizations', 'Ancient Civilization Timeline', 'completed', -3],
    ];
    for (const [, suffix, title, status, offset] of assignments) {
      await exec(`INSERT OR REPLACE INTO Assignment (id,studentId,classId,lessonId,title,status,dueDate,createdAt) VALUES (?,?,?,?,?,?,?,?)`, `assign_${studentId}_${suffix}`, studentId, classId, `lesson_${suffix}`, title, status, now + Number(offset) * day, now - (10 - Number(offset)) * day);
    }

    for (const subject of subjects) {
      const lessonId = `lesson_${lessonDefs[subject][0][0]}`;
      for (let i = 0; i < 2; i += 1) {
        const accuracy = Math.max(0.45, Math.min(0.96, baseAcc[studentId][subject] + (i === 0 ? -0.04 : 0.02)));
        const total = subject === 'Math' ? 12 : 10;
        await exec(`INSERT OR REPLACE INTO QuizResult (id,studentId,lessonId,score,total,accuracy,repeatedMistakesJson,createdAt) VALUES (?,?,?,?,?,?,?,?)`, `quiz_${studentId}_${subject.toLowerCase()}_${i + 1}`, studentId, lessonId, Math.round(accuracy * total), total, accuracy, j(accuracy > 0.82 ? [] : ['core concept review', 'explain answer step']), now - (8 - i * 2) * day);
      }
    }

    for (let d = 0; d < 14; d += 1) {
      await exec(`INSERT OR REPLACE INTO PhoneHealthMetric (id,studentId,sourceApp,capturedAt,steps,activeMinutes,sleepMinutes,restingHeartRate,hrv,bloodOxygen,metadataJson,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`, `health_${studentId}_${d}`, studentId, 'student_app', now - d * day, 6200 + (d % 5) * 450, 32 + (d % 3) * 8, 450 - (d % 4) * 18, 72 + (d % 4), 43.0 - (d % 3), 98.0, j({ safeOnly: true, routine: 'school-week' }), now - d * day);
    }

    const events = [
      ['lesson_opened', 'low', 'student_app', 'Opened today’s current lesson and reviewed the key learning cards.'],
      ['quiz_submitted', 'medium', 'student_app', 'Submitted a quiz; accuracy shows which concept should be reviewed at home.'],
      ['ai_tutor_used', 'low', 'local_ai', 'Used on-device AI help to ask for a simpler explanation.'],
      ['assignment_opened', 'low', 'student_app', 'Opened a pending assignment and completed the planning step.'],
      ['ar_lesson_opened', 'low', 'student_app', 'Opened an AR lesson and reviewed a 3D model explanation.'],
      ['group_work_contribution', 'low', 'teacher_app', 'Contributed one clear idea during group work.'],
      ['teacher_support_requested', 'medium', 'student_app', 'Requested teacher support for a concept that felt unclear.'],
      ['attendance_present', 'low', 'school_system', 'Checked in on time for the school day.'],
      ['learning_confidence_signal', 'medium', 'student_app', 'Showed lower confidence when a task had several steps.'],
    ];
    for (let i = 0; i < events.length; i += 1) {
      const [type, severity, source, summary] = events[i];
      await exec(`INSERT OR REPLACE INTO StudentEvent (id,studentId,deviceId,sessionId,type,source,severity,lessonId,pageNumber,assignmentId,quizId,groupWorkId,safeSummary,metadataJson,rawPrivateText,privacyLevel,createdAt,syncedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, `event_${studentId}_${String(i).padStart(2, '0')}`, studentId, `${studentId}_phone`, 'sess_school_day_20260510', type, source, severity, 'lesson_fractions_ratios', null, null, null, null, summary, j({ evidenceCount: 2, generatedBy: 'student_app' }), null, 'sensitive', now - (i + 1) * 3_600_000, now - i * 3_500_000);
    }

    for (let i = 0; i < 5; i += 1) {
      await exec(`INSERT OR REPLACE INTO LocalAiStatusReport (id,studentId,modelId,quantization,status,action,latencyMs,createdAt) VALUES (?,?,?,?,?,?,?,?)`, `localai_${studentId}_${i}`, studentId, 'gemma-4-e2b-it', 'int4', 'success', ['lesson_explain', 'quiz_review', 'home_summary', 'ar_explain', 'weak_skill_review'][i], 980 + i * 120, now - i * day);
    }

    await exec(`INSERT OR REPLACE INTO GroupWorkEvent (id,studentId,groupWorkId,assignmentId,activityType,safeSummary,createdAt) VALUES (?,?,?,?,?,?,?)`, `group_${studentId}_science_poster`, studentId, 'group_science_cell_poster', `assign_${studentId}_cell_structure_ar`, 'Science group poster', 'Student contributed a visual explanation and completed an assigned part of the group task.', now - 2 * day);
    await exec(`INSERT OR REPLACE INTO ChildHealthAlert (id,studentId,level,score,confidence,trendWindowDays,triggeredSignalsJson,safeSummary,recommendedAction,createdAt,resolvedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?)`, `alert_${studentId}_learning_support`, studentId, studentId === 'stu_002' ? 'monitor' : 'attention', studentId === 'stu_002' ? 0.32 : 0.58, studentId === 'stu_002' ? 0.67 : 0.84, 7, j(['quiz trend', 'unfinished assignment', 'support request']), 'Recent learning signals suggest a short, calm review would help.', 'Use a 10-minute review session and contact the teacher only if the same pattern repeats.', now - 3 * 3_600_000, null);

    const weak = meta.weak.join(', ');
    const strong = meta.strong.join(', ');
    await exec(`INSERT OR REPLACE INTO ParentChildReport (id,studentId,todayLearningSummary,progressSummary,mentalAndCharacterGrowthSummary,recommendedParentAction,teacherNote,updatedAt) VALUES (?,?,?,?,?,?,?,?)`, `parent_report_${studentId}`, studentId, `${studentName} completed learning activity from the Student App today. Strengths were visible in ${strong}; ${weak} should be reviewed briefly.`, `Progress is strongest in ${strong}. The main support area is ${weak}, based on quiz results, assignments, and student app signals.`, 'Confidence is better when review is short, predictable, and focused on one idea at a time.', 'Ask one calm question, review one short item, and avoid comparing the child with classmates.', 'This parent report excludes raw private chat, hidden internal scores, internal severity labels, and teacher-only notes.', now);

    const level = studentId === 'stu_002' ? 'monitor' : 'attention';
    const total = studentId === 'stu_001' ? -17 : studentId === 'stu_002' ? -8 : -21;
    const keyFactors = [`${weak} needs short review`, 'One assignment or skill area requires follow-up', 'Student benefits from calm home support'];
    const actions = ['Ask one safe question tonight', 'Review one weak skill for 10 minutes', 'Contact the teacher if this pattern repeats'];
    await exec(`INSERT OR REPLACE INTO StudentTrendSnapshot (id,studentId,level,totalDeduction,direction,confidence,redAlert,packetJson,source,generatedAt,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?)`, `snapshot_${studentId}_latest`, studentId, level, total, total < -15 ? 'worsening' : 'stable', 'high', 0, j({ studentId, level, totalDeduction: total, topContributingFactors: keyFactors, source: 'student_app_backend_parent_engine' }), 'backend_parent_engine', now, now);
    await exec(`INSERT OR REPLACE INTO StudentTrendReport (id,studentId,packetId,audience,title,summary,keyFactors,suggestedActions,redAlert,provider,source,generatedAt,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`, `trend_report_${studentId}_parent`, studentId, `snapshot_${studentId}_latest`, 'parent', 'Today’s parent-safe learning update', `${studentName} is ready for a short home support session. Use the plan to review ${weak} without pressure.`, j(keyFactors), j(actions), 0, 'backend_parent_engine', 'student_app_and_school_records', now, now);

    for (let d = 0; d < 14; d += 1) {
      const value = total + ((d % 5) - 2) * 1.7;
      const chartLevel = value > -12 ? 'monitor' : value > -26 ? 'attention' : 'urgent';
      await exec(`INSERT OR REPLACE INTO StudentTrendChartPoint (id,studentId,date,totalDeduction,level,sleepDeduction,fatigueDeduction,studyLoadDeduction,learningBehaviorDeduction,wellbeingDeduction,conversationDeduction,supportSignalDeduction,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`, `trendchart_${studentId}_${String(d).padStart(2, '0')}`, studentId, now - (13 - d) * day, value, chartLevel, -1.5 - (d % 3), -1 - (d % 2), -2 - (d % 4), -3 - (d % 5), -1 - (d % 3), -1.2, -2 - (d % 2), now - (13 - d) * day);
    }

    await exec(`INSERT OR REPLACE INTO EducationGuardianConsent (id,studentId,guardianTeacherId,active,medicalSummarySafe,psychologicalSupportSummarySafe,supportPlan,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?)`, `consent_${studentId}_homeroom`, studentId, 'teacher_homeroom_8a', 1, 'Share parent-approved high-level health routine summary only.', 'Share confidence and learning-support summary, not raw chat.', 'Teacher may view parent-safe home support plan.', now - 7 * day, now - day);
    for (let i = 0; i < 3; i += 1) {
      await exec(`INSERT OR REPLACE INTO AccessAuditLog (id,actorUserId,actorRole,action,resourceType,resourceId,reason,createdAt) VALUES (?,?,?,?,?,?,?,?)`, `audit_${studentId}_${i}`, `user_actor_${i}`, ['parent', 'teacher', 'school_admin'][i], ['view_health_vault', 'view_safe_summary', 'view_aggregate'][i], 'student_parent_safe_record', studentId, ['Parent opened wellbeing vault', 'Teacher viewed parent-approved safe summary', 'Admin viewed aggregate only'][i], now - (i + 1) * day);
    }
    await exec(`INSERT OR REPLACE INTO TeacherStudentReport (id,studentId,classId,academicSummary,learningSupportSummary,wellbeingSummary,groupWorkSummary,recommendedTeacherAction,recentEventsJson,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?)`, `teacher_report_${studentId}`, studentId, classId, `${studentName} has clear strengths in ${strong}.`, `Short review recommended for ${weak}.`, 'Confidence improves when tasks are broken into steps.', 'Group work participation is steady with structured roles.', 'Provide one concrete example and confirm the next small step.', j(['quiz', 'assignment', 'student_app_event']), now);
    await exec(`INSERT OR REPLACE INTO SafeSummary (id,studentId,summaryType,content,createdAt,updatedAt) VALUES (?,?,?,?,?,?)`, `safe_${studentId}_home_support`, studentId, 'home_support', 'Parent-safe summary generated from school records, student app activity, and local AI status.', now, now);
  }

  await exec(`INSERT OR REPLACE INTO AdminClassAggregate (id,schoolId,classId,totalStudents,localAiEvents,cloudAiEvents,supportLow,supportMedium,supportHigh,assignmentCompletionRate,privacyReadinessSummary,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`, 'admin_agg_class_8a', 'school_onepad_demo', 'class_8a', 20, 42, 18, 10, 6, 2, 0.74, 'Class has parent-safe summaries, consent logs, and local AI usage records ready for demo.', now);
  console.log('Seeded complete backend parent demo data for stu_001, stu_002, stu_003.');
}

seed().finally(async () => prisma.$disconnect());

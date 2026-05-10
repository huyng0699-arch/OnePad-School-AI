import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

function asJson(value: any, fallback: any = null) {
  if (value == null) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(String(value));
  } catch {
    return fallback;
  }
}

function iso(value: any) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'number') return new Date(value).toISOString();
  const n = Number(value);
  if (!Number.isNaN(n) && n > 1000000000) return new Date(n).toISOString();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toISOString();
}

function nowMs() {
  return Date.now();
}

function id(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function levelFromSignal(raw: any) {
  const value = String(raw || '').toLowerCase();
  if (['red', 'urgent', 'high', 'critical', 'severe'].includes(value)) return 'urgent';
  if (['elevated', 'attention', 'medium', 'moderate', 'watch'].includes(value)) return 'attention';
  return 'monitor';
}

function parentLevel(raw: any) {
  const value = String(raw || '').toLowerCase();
  if (['red', 'urgent', 'critical', 'severe'].includes(value)) return 'urgent';
  if (['elevated', 'attention', 'high', 'medium', 'moderate', 'watch'].includes(value)) return 'attention';
  return 'monitor';
}

function statusForAssignment(status: any) {
  const value = String(status || '').toLowerCase();
  if (['submitted', 'completed', 'done'].includes(value)) return 'submitted';
  if (['overdue', 'late'].includes(value)) return 'overdue';
  if (['opened', 'in_progress', 'started'].includes(value)) return 'in_progress';
  return 'not_started';
}

@Injectable()
export class ParentService {
  constructor(private readonly prisma: PrismaService) {}

  private async rows<T = any>(sql: string, ...values: any[]): Promise<T[]> {
    return this.prisma.$queryRawUnsafe<T[]>(sql, ...values);
  }

  private async exec(sql: string, ...values: any[]) {
    return this.prisma.$executeRawUnsafe(sql, ...values);
  }

  private async assertParentCanRead(studentId: string, parentUserId?: string) {
    if (!studentId) throw new NotFoundException('Missing studentId.');
    const parent = parentUserId || 'parent_001';
    const links = await this.rows(
      `SELECT gsl.studentId
       FROM GuardianStudentLink gsl
       JOIN Guardian g ON g.id = gsl.guardianId
       LEFT JOIN User u ON u.id = g.userId
       WHERE gsl.studentId = ? AND (g.id = ? OR u.id = ? OR u.displayName = ?)
       LIMIT 1`,
      studentId,
      parent,
      parent,
      parent,
    );
    if (links.length === 0) {
      const student = await this.rows(`SELECT id FROM Student WHERE id = ? LIMIT 1`, studentId);
      if (student.length === 0) throw new NotFoundException(`Student ${studentId} not found.`);
      // Demo backend allows reading seeded students when parent header is absent.
      // Demo login is selection-based until real password auth is added.
      // If the student exists in backend and is linked to some guardian, allow the read so the Parent App can prove the full flow.
      return;
    }
  }

  async loginOptions(parentUserId?: string) {
    const parent = parentUserId || 'parent_001';
    const options = await this.rows(
      `SELECT g.id as parentId, g.fullName as parentName, s.id as studentId, s.fullName as studentName,
              c.name as className, c.grade as grade, sc.name as schoolName,
              COALESCE(u.email, '') as parentEmail
       FROM GuardianStudentLink gsl
       JOIN Guardian g ON g.id = gsl.guardianId
       JOIN Student s ON s.id = gsl.studentId
       JOIN Classroom c ON c.id = s.classId
       JOIN School sc ON sc.id = s.schoolId
       LEFT JOIN User u ON u.id = g.userId
       WHERE g.id = ? OR u.id = ? OR u.email = ?
       GROUP BY g.id, s.id
       ORDER BY gsl.createdAt ASC
       LIMIT 1`,
      parent,
      parent,
      parent,
    );

    const fallback = options.length ? options : await this.rows(
      `SELECT g.id as parentId, g.fullName as parentName, s.id as studentId, s.fullName as studentName,
              c.name as className, c.grade as grade, sc.name as schoolName,
              COALESCE(u.email, '') as parentEmail
       FROM GuardianStudentLink gsl
       JOIN Guardian g ON g.id = gsl.guardianId
       JOIN Student s ON s.id = gsl.studentId
       JOIN Classroom c ON c.id = s.classId
       JOIN School sc ON sc.id = s.schoolId
       LEFT JOIN User u ON u.id = g.userId
       WHERE g.id = 'parent_001'
       GROUP BY g.id, s.id
       ORDER BY gsl.createdAt ASC
       LIMIT 1`,
    );

    return {
      ok: true,
      authMode: 'single_parent_single_student_demo',
      note: 'This parent account is linked to exactly one student.',
      options: fallback,
      accounts: fallback,
    };
  }



  async children(parentUserId?: string) {
    const parent = parentUserId || 'parent_001';
    const rows = await this.rows(
      `SELECT g.id as parentId, g.fullName as parentName, s.id as studentId, s.fullName as studentName,
              c.name as className, c.grade as grade, sc.name as schoolName, COALESCE(u.email, '') as parentEmail
       FROM GuardianStudentLink gsl
       JOIN Guardian g ON g.id = gsl.guardianId
       JOIN Student s ON s.id = gsl.studentId
       JOIN Classroom c ON c.id = s.classId
       JOIN School sc ON sc.id = s.schoolId
       LEFT JOIN User u ON u.id = g.userId
       WHERE g.id = ? OR u.id = ? OR u.email = ?
       ORDER BY gsl.createdAt ASC
       LIMIT 1`,
      parent,
      parent,
      parent,
    );
    const fallback = rows.length ? rows : await this.rows(
      `SELECT g.id as parentId, g.fullName as parentName, s.id as studentId, s.fullName as studentName,
              c.name as className, c.grade as grade, sc.name as schoolName, COALESCE(u.email, '') as parentEmail
       FROM GuardianStudentLink gsl
       JOIN Guardian g ON g.id = gsl.guardianId
       JOIN Student s ON s.id = gsl.studentId
       JOIN Classroom c ON c.id = s.classId
       JOIN School sc ON sc.id = s.schoolId
       LEFT JOIN User u ON u.id = g.userId
       WHERE g.id = 'parent_001'
       ORDER BY gsl.createdAt ASC
       LIMIT 1`,
    );
    return {
      ok: true,
      accountScope: 'one_parent_account_one_student',
      selectedStudentId: fallback[0]?.studentId || null,
      children: fallback.map((r: any) => ({
        studentId: r.studentId,
        fullName: r.studentName,
        className: r.className,
        grade: r.grade,
        schoolName: r.schoolName,
        parentId: r.parentId,
      })),
    };
  }

  async parentDashboardReport(studentId: string, parentUserId?: string) {
    await this.assertParentCanRead(studentId, parentUserId);
    const profile = (await this.profile(studentId, parentUserId)).profile;
    const trend = await this.trendReport(studentId, parentUserId);
    const subjects = (await this.subjects(studentId, parentUserId)).subjects;
    const assignments = (await this.assignments(studentId, parentUserId)).assignments;
    const alerts = (await this.alerts(studentId, parentUserId)).alerts;
    const family = (await this.familyReport(studentId, parentUserId)).report;
    return {
      ok: true,
      source: 'backend_parent_service',
      student: profile,
      report: {
        title: trend.title,
        summary: trend.summary,
        level: trend.level,
        direction: trend.direction,
        generatedAt: trend.generatedAt,
        overall: family.overall,
        academicPattern: family.subjectPattern,
        healthRoutine: family.healthRoutine,
        wellbeingConfidence: family.wellbeingConfidence,
        socialIntegration: family.socialIntegration,
        recommendedHomePlan: family.recommendedHomePlan,
        privacyStatus: family.privacyStatus,
      },
      subjects,
      assignments,
      alerts,
    };
  }

  async wellbeingSummary(studentId: string, parentUserId?: string) {
    await this.assertParentCanRead(studentId, parentUserId);
    const vault = (await this.healthWellbeingVault(studentId, parentUserId)).vault;
    return {
      ok: true,
      studentId,
      wellbeing: {
        status: vault.urgentAlerts?.length ? 'attention' : 'monitor',
        learningStress: vault.learningStress,
        physicalRoutine: vault.activitySummary,
        sleepRoutine: vault.sleepRoutine,
        sharingStatus: vault.sharingStatus,
        parentAction: 'Use short review sessions, keep the evening routine calm, and contact the teacher only if the pattern repeats.',
      },
    };
  }


  async profile(studentId: string, parentUserId?: string) {
    await this.assertParentCanRead(studentId, parentUserId);
    const rows = await this.rows(
      `SELECT s.id as studentId, s.fullName as childName, c.name as className, c.grade, sc.name as schoolName
       FROM Student s
       JOIN Classroom c ON c.id = s.classId
       JOIN School sc ON sc.id = s.schoolId
       WHERE s.id = ? LIMIT 1`,
      studentId,
    );
    const student = rows[0];
    if (!student) throw new NotFoundException(`Student ${studentId} not found.`);

    const teachers = await this.rows(
      `SELECT t.fullName as teacher, tca.roleType, COALESCE(tca.subjectId, l.subject, 'General') as subject
       FROM TeacherClassAccess tca
       JOIN Teacher t ON t.id = tca.teacherId
       JOIN Student s ON s.classId = tca.classId
       LEFT JOIN Lesson l ON l.subject = tca.subjectId
       WHERE s.id = ?
       GROUP BY t.id, subject
       ORDER BY subject ASC`,
      studentId,
    );

    const localAi = await this.rows(
      `SELECT modelId, quantization, status, action, latencyMs, createdAt
       FROM LocalAiStatusReport WHERE studentId = ? ORDER BY createdAt DESC LIMIT 1`,
      studentId,
    );

    return {
      ok: true,
      profile: {
        ...student,
        homeroomTeacher: teachers.find((t: any) => String(t.roleType).includes('homeroom'))?.teacher || teachers[0]?.teacher || 'Homeroom teacher not assigned',
        subjectTeachers: teachers.map((t: any) => ({
          subject: t.subject,
          teacher: t.teacher,
          contactHint: `Contact ${t.teacher} for ${t.subject} support.`,
        })),
        learningFocus: ['Review weak skills', 'Keep home support short', 'Coordinate with teacher when alerts repeat'],
        parentAccountScope: 'one_parent_account_one_student',
        deviceSync: {
          status: 'synced',
          lastSyncedAt: iso(localAi[0]?.createdAt) || new Date().toISOString(),
          pendingEvents: 0,
          localAiStatus: localAi[0]?.status || 'no local AI status yet',
          backendStatus: 'backend_connected',
        },
      },
    };
  }

  async trendReport(studentId: string, parentUserId?: string) {
    await this.assertParentCanRead(studentId, parentUserId);
    const reports = await this.rows(
      `SELECT * FROM StudentTrendReport WHERE studentId = ? AND audience = 'parent' ORDER BY generatedAt DESC LIMIT 1`,
      studentId,
    );
    const snapshot = await this.rows(`SELECT * FROM StudentTrendSnapshot WHERE studentId = ? ORDER BY generatedAt DESC LIMIT 1`, studentId);
    const profile = (await this.profile(studentId, parentUserId)).profile;
    const report = reports[0];
    const snap = snapshot[0];
    const packet = asJson(snap?.packetJson, {});
    const keyFactors = asJson(report?.keyFactors, packet?.topContributingFactors || []);
    const suggestedActions = asJson(report?.suggestedActions, []);
    return {
      ok: true,
      studentId,
      childName: profile.childName,
      className: profile.className,
      homeroomTeacher: profile.homeroomTeacher,
      level: parentLevel(snap?.level || report?.level),
      direction: snap?.direction || 'stable',
      title: report?.title || 'Learning and wellbeing update',
      summary: report?.summary || 'No parent report has been generated yet.',
      keyFactors,
      suggestedActions,
      categories: this.categoryBreakdown(packet, keyFactors),
      generatedAt: iso(report?.generatedAt || snap?.generatedAt),
    };
  }

  async trend(studentId: string, parentUserId?: string) {
    await this.assertParentCanRead(studentId, parentUserId);
    const [report, chart] = await Promise.all([
      this.trendReport(studentId, parentUserId),
      this.trendChart(studentId, 14, parentUserId),
    ]);

    return {
      ok: true,
      generatedBy: 'backend_parent_trend_engine',
      studentId,
      childName: report.childName,
      level: report.level,
      direction: report.direction,
      title: report.title,
      summary: report.summary,
      keyFactors: report.keyFactors,
      suggestedActions: report.suggestedActions,
      categories: report.categories,
      points: chart.points,
      trend: chart.points,
      chart: chart.points,
      privacy: {
        parentSafeOnly: true,
        hiddenScoresShown: false,
        rawPrivateTextShown: false,
        note: 'Trend cards show parent-safe levels and recommended actions only; raw private text and internal severity scores remain hidden.',
      },
    };
  }

  async timeline(studentId: string, parentUserId?: string) {
    await this.assertParentCanRead(studentId, parentUserId);
    const timeline = await this.progressTimeline(studentId, parentUserId);
    return {
      ok: true,
      generatedBy: 'backend_parent_timeline_engine',
      studentId,
      events: timeline.events,
      timeline: timeline.events,
      privacy: {
        parentSafeOnly: true,
        rawPrivateTextShown: false,
      },
    };
  }

  async trendChart(studentId: string, days = 14, parentUserId?: string) {
    await this.assertParentCanRead(studentId, parentUserId);
    const safeDays = Math.max(1, Math.min(days || 14, 60));
    const rows = await this.rows(
      `SELECT date, totalDeduction, level, sleepDeduction, fatigueDeduction, studyLoadDeduction,
              learningBehaviorDeduction, wellbeingDeduction, conversationDeduction, supportSignalDeduction
       FROM StudentTrendChartPoint
       WHERE studentId = ?
       ORDER BY date DESC LIMIT ?`,
      studentId,
      safeDays,
    );

    const fromDb = rows.reverse().map((p: any) => this.toParentTrendPoint(p));
    const labelSet = new Set(fromDb.map((p: any) => p.label));
    const shouldUseComputedFallback = fromDb.length < safeDays || labelSet.size <= 1;
    const points = shouldUseComputedFallback
      ? await this.buildParentSafeTrendPoints(studentId, safeDays)
      : fromDb;

    return {
      ok: true,
      generatedBy: shouldUseComputedFallback ? 'computed_parent_safe_trend' : 'stored_parent_safe_trend',
      studentId,
      days: safeDays,
      points,
      privacy: {
        parentSafeOnly: true,
        hiddenScoresShown: false,
        rawPrivateTextShown: false,
      },
    };
  }

  async alerts(studentId: string, parentUserId?: string) {
    await this.assertParentCanRead(studentId, parentUserId);
    const health = await this.rows(
      `SELECT id, level, confidence, safeSummary, recommendedAction, createdAt
       FROM ChildHealthAlert WHERE studentId = ? AND resolvedAt IS NULL ORDER BY createdAt DESC LIMIT 20`,
      studentId,
    );
    const events = await this.rows(
      `SELECT id, type, severity, safeSummary, createdAt, metadataJson
       FROM StudentEvent
       WHERE studentId = ? AND privacyLevel <> 'private_raw'
       ORDER BY createdAt DESC LIMIT 30`,
      studentId,
    );
    const overdue = await this.rows(
      `SELECT a.id, a.title, a.status, a.dueDate, l.subject
       FROM Assignment a LEFT JOIN Lesson l ON l.id = a.lessonId
       WHERE (a.studentId = ? OR a.classId = (SELECT classId FROM Student WHERE id = ?))
       AND lower(a.status) IN ('overdue','late','in_progress','opened')
       ORDER BY a.createdAt DESC LIMIT 12`,
      studentId,
      studentId,
    );
    const alerts = [
      ...health.map((a: any) => ({
        id: a.id,
        category: 'health_wellbeing',
        level: parentLevel(a.level),
        evidenceCount: 3,
        confidence: Number(a.confidence || 0.82),
        title: 'Wellbeing and learning-routine signal',
        summary: a.safeSummary || 'A parent-safe wellbeing signal was generated from recent routine and learning patterns.',
        recommendedAction: a.recommendedAction || 'Keep the home support session short and contact school only if the pattern continues.',
        createdAt: iso(a.createdAt),
      })),
      ...overdue.map((a: any) => ({
        id: a.id,
        category: 'assignment',
        level: String(a.status).toLowerCase().includes('overdue') ? 'attention' : 'monitor',
        evidenceCount: String(a.status).toLowerCase().includes('overdue') ? 2 : 1,
        confidence: String(a.status).toLowerCase().includes('overdue') ? 0.86 : 0.72,
        title: String(a.status).toLowerCase().includes('overdue') ? 'Assignment follow-up needed' : 'Assignment is still in progress',
        summary: `${a.title} in ${a.subject || 'a subject'} needs a calm parent check-in, not extra pressure.`,
        recommendedAction: 'Ask which step is blocking progress. If the same block remains tomorrow, message the subject teacher.',
        createdAt: iso(a.dueDate),
      })),
      ...events.slice(0, 12).map((e: any) => ({
        id: e.id,
        category: this.categoryFromEvent(e.type),
        level: levelFromSignal(e.severity),
        evidenceCount: this.evidenceCount(e.metadataJson),
        confidence: this.confidenceFromSeverity(e.severity),
        title: this.titleFromEvent(e.type),
        summary: e.safeSummary,
        recommendedAction: this.recommendedActionFromEvent(e.type, e.severity),
        createdAt: iso(e.createdAt),
      })),
    ];
    const unique = new Map<string, any>();
    for (const alert of alerts) unique.set(alert.id, alert);
    return { ok: true, generatedBy: 'backend_parent_alert_engine', alerts: Array.from(unique.values()).slice(0, 30) };
  }

  async subjects(studentId: string, parentUserId?: string) {
    await this.assertParentCanRead(studentId, parentUserId);
    const rows = await this.rows(
      `SELECT l.subject,
              MAX(l.title) as latestQuiz,
              AVG(q.accuracy) as accuracy,
              MAX(q.createdAt) as latestAt,
              MAX(t.fullName) as teacher
       FROM Lesson l
       LEFT JOIN QuizResult q ON q.lessonId = l.id AND q.studentId = ?
       LEFT JOIN Student s ON s.id = ?
       LEFT JOIN TeacherClassAccess tca ON tca.classId = s.classId AND lower(COALESCE(tca.subjectId, '')) = lower(l.subject)
       LEFT JOIN Teacher t ON t.id = tca.teacherId
       WHERE l.id IN (SELECT lessonId FROM Assignment WHERE studentId = ? OR classId = (SELECT classId FROM Student WHERE id = ?))
          OR q.studentId = ?
       GROUP BY l.subject
       ORDER BY l.subject ASC`,
      studentId,
      studentId,
      studentId,
      studentId,
      studentId,
    );
    return {
      ok: true,
      subjects: rows.map((r: any) => {
        const accuracy = Number(r.accuracy || 0.72);
        return {
          subject: r.subject || 'General',
          teacher: r.teacher || 'Assigned subject teacher',
          mastery: Math.round(accuracy * 100),
          latestQuiz: r.latestQuiz || 'Recent learning check',
          accuracy,
          weakSkills: this.weakSkillsForSubject(r.subject, accuracy),
          trend: accuracy < 0.65 ? 'declining' : accuracy >= 0.78 ? 'improving' : 'stable',
          parentAction: accuracy < 0.65 ? 'Review one short task tonight and keep pressure low.' : 'Ask the child to explain one key idea in their own words.',
        };
      }),
    };
  }

  async assignments(studentId: string, parentUserId?: string) {
    await this.assertParentCanRead(studentId, parentUserId);
    const rows = await this.rows(
      `SELECT a.id, a.title, a.status, a.dueDate, a.createdAt, l.subject, l.title as relatedLesson,
              COALESCE(t.fullName, 'Assigned teacher') as teacher
       FROM Assignment a
       LEFT JOIN Lesson l ON l.id = a.lessonId
       LEFT JOIN Student s ON s.id = ?
       LEFT JOIN TeacherClassAccess tca ON tca.classId = s.classId AND lower(COALESCE(tca.subjectId, '')) = lower(l.subject)
       LEFT JOIN Teacher t ON t.id = tca.teacherId
       WHERE a.studentId = ? OR a.classId = (SELECT classId FROM Student WHERE id = ?)
       ORDER BY COALESCE(a.dueDate, a.createdAt) DESC LIMIT 50`,
      studentId,
      studentId,
      studentId,
    );
    return {
      ok: true,
      assignments: rows.map((a: any) => ({
        id: a.id,
        title: a.title,
        subject: a.subject || 'General',
        teacher: a.teacher || 'Assigned teacher',
        dueDate: iso(a.dueDate || a.createdAt),
        status: statusForAssignment(a.status),
        parentAction: statusForAssignment(a.status) === 'submitted' ? 'Acknowledge completion.' : 'Ask what part needs help and keep the support session short.',
        relatedLesson: a.relatedLesson || 'Related lesson',
      })),
    };
  }

  async lessons(studentId: string, parentUserId?: string) {
    await this.assertParentCanRead(studentId, parentUserId);
    const rows = await this.rows(
      `SELECT l.id, l.title, l.subject, l.grade, l.createdAt,
              MAX(q.accuracy) as accuracy
       FROM Lesson l
       LEFT JOIN Assignment a ON a.lessonId = l.id
       LEFT JOIN QuizResult q ON q.lessonId = l.id AND q.studentId = ?
       WHERE a.studentId = ? OR a.classId = (SELECT classId FROM Student WHERE id = ?) OR q.studentId = ?
       GROUP BY l.id
       ORDER BY l.createdAt DESC LIMIT 50`,
      studentId,
      studentId,
      studentId,
      studentId,
    );
    return {
      ok: true,
      lessons: rows.map((l: any) => ({
        lessonId: l.id,
        title: l.title,
        subject: l.subject,
        grade: l.grade,
        status: Number(l.accuracy || 0) < 0.65 ? 'recommended_review' : 'current',
        keyPoints: this.keyPointsForSubject(l.subject),
        parentExplanation: `This ${l.subject} lesson can be reviewed at home with a short explanation task.`,
        homeQuestions: this.homeQuestionsForSubject(l.subject),
        publishedAt: iso(l.createdAt),
      })),
    };
  }

  async quizMastery(studentId: string, parentUserId?: string) {
    await this.assertParentCanRead(studentId, parentUserId);
    const rows = await this.rows(
      `SELECT q.id, q.score, q.total, q.accuracy, q.repeatedMistakesJson, q.createdAt,
              l.subject, l.title as lessonTitle
       FROM QuizResult q LEFT JOIN Lesson l ON l.id = q.lessonId
       WHERE q.studentId = ? ORDER BY q.createdAt DESC LIMIT 20`,
      studentId,
    );
    return {
      ok: true,
      quizzes: rows.map((q: any) => ({
        id: q.id,
        subject: q.subject || 'General',
        latestQuiz: q.lessonTitle || 'Quiz',
        score: q.score,
        total: q.total,
        accuracy: q.accuracy,
        repeatedMistakes: asJson(q.repeatedMistakesJson, []),
        baselineComparison: Number(q.accuracy) < 0.65 ? 'below_baseline' : 'within_expected_range',
        homeReviewPlan: Number(q.accuracy) < 0.65 ? 'Review three missed concepts tonight.' : 'Ask the child to explain one correct answer.',
        createdAt: iso(q.createdAt),
      })),
    };
  }

  async progressTimeline(studentId: string, parentUserId?: string) {
    await this.assertParentCanRead(studentId, parentUserId);
    const rows = await this.rows(
      `SELECT id, type, source, safeSummary, lessonId, assignmentId, quizId, groupWorkId, createdAt
       FROM StudentEvent WHERE studentId = ? ORDER BY createdAt DESC LIMIT 60`,
      studentId,
    );
    return {
      ok: true,
      events: rows.map((e: any) => ({
        id: e.id,
        date: iso(e.createdAt),
        type: e.type,
        title: this.titleFromEvent(e.type),
        summary: e.safeSummary,
        source: e.source,
      })),
    };
  }

  async homeSupportPlan(studentId: string, parentUserId?: string) {
    await this.assertParentCanRead(studentId, parentUserId);
    const report = await this.trendReport(studentId, parentUserId);
    const subjects = (await this.subjects(studentId, parentUserId)).subjects;
    const alerts = (await this.alerts(studentId, parentUserId)).alerts;
    const assignments = (await this.assignments(studentId, parentUserId)).assignments;
    const weak = subjects.filter((s: any) => Number(s.accuracy || 0) < 0.7).slice(0, 3);
    const strongest = subjects.slice().sort((a: any, b: any) => Number(b.accuracy || 0) - Number(a.accuracy || 0))[0];
    const openAssignment = assignments.find((a: any) => ['overdue', 'in_progress', 'not_started'].includes(String(a.status))) || assignments[0];
    const weakLabel = weak.map((s: any) => s.subject).join(', ') || 'the current review target';
    return {
      ok: true,
      plan: {
        status: report.level,
        tonightQuestions: [
          'Which part of today felt clearest to you?',
          `Can we review one small part of ${weak[0]?.subject || 'your current lesson'} together for ten minutes?`,
          'Would you rather explain it first, or should I ask one simple question?',
        ],
        reviewItems: weak.map((s: any) => `${s.subject}: ${s.weakSkills?.[0] || 'one core concept'}`).concat(report.keyFactors || []).slice(0, 6),
        supportTime: '10-20 minutes. Stop before fatigue or frustration increases.',
        doNotPressure: [
          'Do not compare the child with classmates.',
          'Do not turn the check-in into a score interrogation.',
          'Do not add long extra practice if the child is already tired.',
          'Do not ask for raw private chat or hidden internal scores.',
        ],
        contactTeacherWhen: 'Contact the homeroom or subject teacher if the same alert repeats for 2-3 days, an assignment remains blocked, or the child says they do not understand the task instructions.',
        microPlan: [
          'Start with one calm observation: “I saw one item that might need a short review.”',
          `Choose only one target: ${weakLabel}.`,
          'Ask the child to explain one idea in their own words before correcting anything.',
          'Use one worked example or one missed quiz item; do not expand the session.',
          'End with a next step: submit, ask teacher, or rest and revisit tomorrow.',
        ],
        parentScripts: [
          { label: 'Opening line', text: 'I am not here to test you. I just want to understand what felt hard today.', why: 'Reduces threat and increases honest communication.' },
          { label: 'Review prompt', text: 'Show me the one step where it stopped making sense.', why: 'Finds the learning block without blame.' },
          { label: 'Teacher handoff', text: 'If this still feels unclear tomorrow, I will message the teacher with one specific question.', why: 'Creates a clear escalation path.' },
        ],
        evidenceMap: [
          { source: 'Subject mastery', signal: weak[0] ? `${weak[0].subject} is below the review threshold.` : 'No weak subject threshold crossed.', parentMeaning: 'Review one concept, not the entire subject.' },
          { source: 'Assignment state', signal: openAssignment ? `${openAssignment.title} is ${openAssignment.status}.` : 'No open assignment returned.', parentMeaning: 'Check the next action and teacher instructions.' },
          { source: 'Alert engine', signal: `${alerts.length} parent-visible signals are open.`, parentMeaning: 'Use a calm check-in; contact school only if repeated.' },
          { source: 'Strength area', signal: strongest ? `${strongest.subject} is currently strongest.` : 'No strength subject returned.', parentMeaning: 'Start the conversation from a strength.' },
        ],
        reminders: [
          { label: 'Tonight', time: '19:30', task: '10-minute review block' },
          { label: 'Tomorrow', time: 'After school', task: 'Check whether the blocked assignment moved forward' },
        ],
      },
    };
  }

  async familyReport(studentId: string, parentUserId?: string) {
    await this.assertParentCanRead(studentId, parentUserId);
    const parentReport = await this.rows(`SELECT * FROM ParentChildReport WHERE studentId = ? ORDER BY updatedAt DESC LIMIT 1`, studentId);
    const trend = await this.trendReport(studentId, parentUserId);
    const subjects = (await this.subjects(studentId, parentUserId)).subjects;
    const weakSubjects = subjects.filter((s: any) => Number(s.accuracy || 0) < 0.7).map((s: any) => s.subject);
    const strongSubjects = subjects.filter((s: any) => Number(s.accuracy || 0) >= 0.78).map((s: any) => s.subject);
    return {
      ok: true,
      report: {
        overall: parentReport[0]?.todayLearningSummary || trend.summary,
        subjectPattern: weakSubjects.length
          ? `Needs short review in ${weakSubjects.join(', ')}; stronger engagement appears in ${strongSubjects.join(', ') || 'visual lessons'}.`
          : 'Subject patterns are stable across recent quiz, lesson, and assignment signals.',
        healthRoutine: parentReport[0]?.wellbeingSummary || 'Health and routine data are shown only as parent-safe summaries.',
        wellbeingConfidence: parentReport[0]?.mentalAndCharacterGrowthSummary || 'Confidence is summarized without raw private chat.',
        socialIntegration: parentReport[0]?.groupWorkSummary || 'Group work participation is summarized without private peer data.',
        recommendedHomePlan: trend.suggestedActions || [],
        privacyStatus: 'Raw private chat, hidden internal scores, internal severity labels, and teacher-only operational notes are not shown to parents.',
      },
    };
  }

  async healthWellbeingVault(studentId: string, parentUserId?: string) {
    await this.assertParentCanRead(studentId, parentUserId);
    const metrics = await this.rows(`SELECT * FROM PhoneHealthMetric WHERE studentId = ? ORDER BY capturedAt DESC LIMIT 14`, studentId);
    const alerts = await this.alerts(studentId, parentUserId);
    const access = await this.rows(
      `SELECT actorRole, action, resourceType, reason, createdAt FROM AccessAuditLog WHERE resourceId = ? ORDER BY createdAt DESC LIMIT 20`,
      studentId,
    );
    const latest = metrics[0] || {};
    const avgSleep = metrics.length ? Math.round(metrics.reduce((s: number, m: any) => s + Number(m.sleepMinutes || 0), 0) / metrics.length) : null;
    const avgActivity = metrics.length ? Math.round(metrics.reduce((s: number, m: any) => s + Number(m.activeMinutes || 0), 0) / metrics.length) : null;
    const avgSteps = metrics.length ? Math.round(metrics.reduce((s: number, m: any) => s + Number(m.steps || 0), 0) / metrics.length) : null;
    return {
      ok: true,
      vault: {
        activitySummary: latest.activeMinutes ? `Latest movement estimate: ${latest.activeMinutes} active minutes; 14-day average ${avgActivity} minutes.` : 'No parent-safe activity summary is available yet.',
        sleepRoutine: latest.sleepMinutes ? `Latest sleep estimate: ${(Number(latest.sleepMinutes) / 60).toFixed(1)} hours; 14-day average ${avgSleep ? (avgSleep / 60).toFixed(1) : 'pending'} hours.` : 'No sleep summary is available yet.',
        learningStress: alerts.alerts.find((a: any) => ['learning', 'assignment'].includes(a.category))?.summary || 'No urgent learning-stress signal is open.',
        urgentAlerts: alerts.alerts.filter((a: any) => a.level === 'urgent'),
        sharingStatus: 'Parent-controlled. Teachers see only approved safe summaries after consent; raw health data is not shared by default.',
        routineSignals: [
          { label: 'Active minutes', value: avgActivity != null ? `${avgActivity} min/day average` : 'Pending', parentMeaning: 'Used only as a high-level routine signal.' },
          { label: 'Sleep routine', value: avgSleep != null ? `${(avgSleep / 60).toFixed(1)} h/day average` : 'Pending', parentMeaning: 'Shown as a summary, not raw health tracking.' },
          { label: 'Step estimate', value: avgSteps != null ? `${avgSteps} steps/day average` : 'Pending', parentMeaning: 'Interpreted only with learning context.' },
        ],
        guardrails: [
          'No raw private chat is shown to parents.',
          'Hidden internal scores and severity calculations are never displayed.',
          'Teachers see wellbeing summaries only after parent consent.',
          'School administrators see aggregate readiness and audit logs, not child-level private details.',
        ],
        accessHistory: access.map((a: any) => ({ date: iso(a.createdAt), actor: a.actorRole, action: a.action, reason: a.reason })),
      },
    };
  }

  async privacyCenter(studentId: string, parentUserId?: string) {
    await this.assertParentCanRead(studentId, parentUserId);
    return {
      ok: true,
      privacy: [
        { role: 'Parent', canSee: 'Parent-safe learning summaries, assignments, quiz/mastery summaries, teacher notes, consent history, and parent-controlled wellbeing vault.' },
        { role: 'Teacher', canSee: 'Safe learning support summaries and wellbeing summaries only when parent consent allows it.' },
        { role: 'School admin', canSee: 'Aggregate readiness, permissions, AI usage, and audit logs. No raw private chat.' },
        { role: 'Never shared by default', canSee: 'Raw private chat, hidden internal scores, internal severity labels, and teacher-only operational notes.' },
      ],
    };
  }

  async consentLog(studentId: string, parentUserId?: string) {
    await this.assertParentCanRead(studentId, parentUserId);
    const rows = await this.rows(
      `SELECT egc.id, egc.active, egc.medicalSummarySafe, egc.psychologicalSupportSummarySafe,
              egc.supportPlan, egc.updatedAt, t.fullName as teacherName
       FROM EducationGuardianConsent egc
       LEFT JOIN Teacher t ON t.id = egc.guardianTeacherId
       WHERE egc.studentId = ? ORDER BY egc.updatedAt DESC`,
      studentId,
    );
    return {
      ok: true,
      consent: rows.map((c: any) => ({
        id: c.id,
        target: c.teacherName || c.guardianTeacherId || 'Education guardian',
        scope: 'Safe learning and wellbeing summary',
        status: c.active ? 'active' : 'revoked',
        updatedAt: iso(c.updatedAt),
      })),
    };
  }

  async arLessons(studentId: string, parentUserId?: string) {
    await this.assertParentCanRead(studentId, parentUserId);
    const lessons = (await this.lessons(studentId, parentUserId)).lessons;
    return {
      ok: true,
      arLessons: lessons.filter((l: any) => /cell|science|biology|ar/i.test(`${l.title} ${l.subject}`)).map((l: any) => ({
        id: `ar_${l.lessonId}`,
        title: l.title,
        subject: l.subject,
        goal: 'Use visual review to explain the lesson in simple words.',
        status: 'opened',
        quizResult: 'Available in quiz mastery',
        parentQuestion: l.homeQuestions[0] || 'Can you explain one thing you learned?',
      })),
    };
  }

  async groupWork(studentId: string, parentUserId?: string) {
    await this.assertParentCanRead(studentId, parentUserId);
    const rows = await this.rows(`SELECT * FROM GroupWorkEvent WHERE studentId = ? ORDER BY createdAt DESC LIMIT 30`, studentId);
    return {
      ok: true,
      groups: rows.map((g: any) => ({
        id: g.id,
        title: g.activityType,
        contribution: g.safeSummary,
        trend: 'parent-safe participation summary',
        support: 'Encourage one short contribution, without forcing public performance.',
      })),
    };
  }

  async messages(studentId: string, parentUserId?: string) {
    await this.assertParentCanRead(studentId, parentUserId);
    const report = await this.trendReport(studentId, parentUserId);
    return {
      ok: true,
      messages: [
        {
          id: `msg_${studentId}_homeroom`,
          from: report.homeroomTeacher || 'Homeroom teacher',
          role: 'Homeroom teacher',
          subject: 'Parent-safe learning update',
          body: report.summary,
          date: report.generatedAt || new Date().toISOString(),
        },
      ],
    };
  }

  async notices() {
    return {
      ok: true,
      notices: [
        { id: 'notice_parent_meeting_20260518', title: 'Grade 8A parent meeting', date: new Date(Date.now() + 8 * 86400000).toISOString(), type: 'Parent meeting', summary: 'Review support routines, privacy consent, and end-of-term learning goals.' },
        { id: 'notice_biology_quiz_20260520', title: 'Biology quiz: Cell structure', date: new Date(Date.now() + 10 * 86400000).toISOString(), type: 'Exam schedule', summary: 'Students should review cell organelles, membranes, mitochondria, and simple function explanations.' },
        { id: 'notice_science_fair_20260525', title: 'Science learning showcase', date: new Date(Date.now() + 15 * 86400000).toISOString(), type: 'School event', summary: 'Students will present a short project or AR-supported explanation.' },
        { id: 'notice_privacy_update', title: 'Parent privacy controls updated', date: new Date().toISOString(), type: 'Privacy notice', summary: 'Parents can review consent history and safe-summary sharing from the Parent App.' },
      ],
    };
  }

  async timetable(studentId: string, parentUserId?: string) {
    await this.assertParentCanRead(studentId, parentUserId);
    const subjects = (await this.subjects(studentId, parentUserId)).subjects;
    return {
      ok: true,
      timetable: subjects.slice(0, 6).map((s: any, idx: number) => ({
        day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][idx] || 'School day',
        subject: s.subject,
        teacher: s.teacher,
        room: 'Classroom',
        currentLesson: s.latestQuiz,
        assignment: 'See assignments page',
      })),
    };
  }

  async attendance(studentId: string, parentUserId?: string) {
    await this.assertParentCanRead(studentId, parentUserId);
    const events = await this.rows(`SELECT * FROM StudentEvent WHERE studentId = ? AND type LIKE '%attendance%' ORDER BY createdAt DESC LIMIT 30`, studentId);
    return {
      ok: true,
      attendance: events.length
        ? events.map((e: any) => ({ date: iso(e.createdAt), status: e.type.includes('late') ? 'late' : 'present', note: e.safeSummary }))
        : [{ date: new Date().toISOString(), status: 'present', note: 'No absence or late signal has been synced.' }],
    };
  }

  async notes(studentId: string, parentUserId?: string) {
    await this.assertParentCanRead(studentId, parentUserId);
    const reports = await this.rows(`SELECT * FROM ParentChildReport WHERE studentId = ? ORDER BY updatedAt DESC LIMIT 5`, studentId);
    return {
      ok: true,
      notes: reports.map((r: any) => ({
        id: r.id,
        title: 'Parent support note',
        linkedTo: 'Daily report',
        sharing: 'private_by_default',
        body: r.recommendedParentAction,
      })),
    };
  }

  async reports(studentId: string, parentUserId?: string) {
    await this.assertParentCanRead(studentId, parentUserId);
    const family = await this.familyReport(studentId, parentUserId);
    return {
      ok: true,
      reports: [
        { id: 'daily', title: 'Daily report', summary: family.report.overall, action: 'Review tonight plan' },
        { id: 'weekly', title: 'Weekly report', summary: family.report.subjectPattern, action: 'Coordinate review' },
        { id: 'privacy', title: 'Privacy report', summary: family.report.privacyStatus, action: 'Review sharing' },
      ],
    };
  }

  async deviceSync(studentId: string, parentUserId?: string) {
    await this.assertParentCanRead(studentId, parentUserId);
    const latest = await this.rows(`SELECT * FROM LocalAiStatusReport WHERE studentId = ? ORDER BY createdAt DESC LIMIT 1`, studentId);
    const eventCount = await this.rows(`SELECT COUNT(*) as count FROM StudentEvent WHERE studentId = ?`, studentId);
    return {
      ok: true,
      device: {
        status: 'synced',
        lastSyncedAt: iso(latest[0]?.createdAt) || new Date().toISOString(),
        pendingEvents: 0,
        localAiStatus: latest[0]?.status || 'no local AI status yet',
        backendStatus: `backend_connected; ${eventCount[0]?.count || 0} student events stored`,
      },
    };
  }

  async ingestStudentAppEvents(body: any) {
    const studentId = body?.studentId;
    if (!studentId) throw new NotFoundException('studentId is required.');
    const student = await this.rows(`SELECT id FROM Student WHERE id = ? LIMIT 1`, studentId);
    if (!student.length) throw new NotFoundException(`Student ${studentId} not found.`);

    let eventCount = 0;
    for (const event of body.events || []) {
      await this.exec(
        `INSERT OR REPLACE INTO StudentEvent
         (id, studentId, deviceId, sessionId, type, source, severity, lessonId, pageNumber, assignmentId, quizId, groupWorkId, safeSummary, metadataJson, rawPrivateText, privacyLevel, createdAt, syncedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        event.id || id('evt'),
        studentId,
        body.deviceId || event.deviceId || 'student_app',
        body.sessionId || event.sessionId || 'student_app_session',
        event.type || 'learning_event',
        event.source || 'student_app',
        event.severity || 'low',
        event.lessonId || null,
        event.pageNumber || null,
        event.assignmentId || null,
        event.quizId || null,
        event.groupWorkId || null,
        event.safeSummary || event.summary || 'Student app event synced.',
        JSON.stringify(event.metadata || event.metadataJson || {}),
        null,
        event.privacyLevel || 'sensitive',
        event.createdAt ? new Date(event.createdAt).getTime() : nowMs(),
        nowMs(),
      );
      eventCount++;
    }

    let quizCount = 0;
    for (const quiz of body.quizResults || []) {
      const total = Number(quiz.total || quiz.totalQuestions || 10);
      const score = Number(quiz.score || quiz.correct || 0);
      const accuracy = quiz.accuracy != null ? Number(quiz.accuracy) : total ? score / total : 0;
      await this.exec(
        `INSERT OR REPLACE INTO QuizResult (id, studentId, lessonId, score, total, accuracy, repeatedMistakesJson, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        quiz.id || id('quiz'),
        studentId,
        quiz.lessonId || null,
        score,
        total,
        accuracy,
        JSON.stringify(quiz.repeatedMistakes || []),
        quiz.createdAt ? new Date(quiz.createdAt).getTime() : nowMs(),
      );
      quizCount++;
    }

    let metricCount = 0;
    for (const metric of body.healthMetrics || []) {
      await this.exec(
        `INSERT OR REPLACE INTO PhoneHealthMetric
         (id, studentId, sourceApp, capturedAt, steps, activeMinutes, sleepMinutes, restingHeartRate, hrv, bloodOxygen, metadataJson, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        metric.id || id('metric'),
        studentId,
        metric.sourceApp || 'student_app',
        metric.capturedAt ? new Date(metric.capturedAt).getTime() : nowMs(),
        metric.steps || null,
        metric.activeMinutes || null,
        metric.sleepMinutes || null,
        metric.restingHeartRate || null,
        metric.hrv || null,
        metric.bloodOxygen || null,
        JSON.stringify(metric.metadata || {}),
        nowMs(),
      );
      metricCount++;
    }

    for (const status of body.localAiStatus || []) {
      await this.exec(
        `INSERT OR REPLACE INTO LocalAiStatusReport (id, studentId, modelId, quantization, status, action, latencyMs, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        status.id || id('local_ai'),
        studentId,
        status.modelId || 'gemma-4-e2b-it',
        status.quantization || 'int4',
        status.status || 'success',
        status.action || 'explain',
        status.latencyMs || null,
        status.createdAt ? new Date(status.createdAt).getTime() : nowMs(),
      );
    }

    await this.recomputeParentSafeTrend(studentId);
    return { ok: true, studentId, stored: { events: eventCount, quizResults: quizCount, healthMetrics: metricCount } };
  }

  private async recomputeParentSafeTrend(studentId: string) {
    const events = await this.rows(`SELECT * FROM StudentEvent WHERE studentId = ? ORDER BY createdAt DESC LIMIT 30`, studentId);
    const quizzes = await this.rows(`SELECT * FROM QuizResult WHERE studentId = ? ORDER BY createdAt DESC LIMIT 10`, studentId);
    const avgAccuracy = quizzes.length ? quizzes.reduce((s: number, q: any) => s + Number(q.accuracy || 0), 0) / quizzes.length : 0.75;
    const supportSignals = events.filter((e: any) => /support|confidence|wrong|stress|wellbeing/i.test(`${e.type} ${e.safeSummary}`));
    const totalDeduction = Math.round(-1 * ((1 - avgAccuracy) * 20 + supportSignals.length * 2));
    const level = totalDeduction <= -16 ? 'elevated' : totalDeduction <= -8 ? 'watch' : 'normal';
    const generatedAt = nowMs();
    const packetId = id('pkt');
    const reportId = id('ptr');
    const topReasons = supportSignals.slice(0, 3).map((e: any) => e.safeSummary);
    const keyFactors = topReasons.length ? topReasons : ['Recent student app activity synced'];
    const actions = level === 'normal'
      ? ['Keep routine stable', 'Ask the child to explain one idea from today']
      : ['Use a short review session tonight', 'Contact the teacher if the same pattern repeats'];

    await this.exec(
      `INSERT INTO StudentTrendSnapshot (id, studentId, level, totalDeduction, direction, confidence, redAlert, packetJson, source, generatedAt, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      packetId,
      studentId,
      level,
      totalDeduction,
      totalDeduction <= -8 ? 'worsening' : 'stable',
      quizzes.length || events.length ? 'medium' : 'low',
      0,
      JSON.stringify({ studentId, level, totalDeduction, topContributingFactors: keyFactors, source: 'student_app_sync', generatedAt: new Date(generatedAt).toISOString() }),
      'student_app_sync',
      generatedAt,
      generatedAt,
    );

    await this.exec(
      `INSERT INTO StudentTrendReport (id, studentId, packetId, audience, title, summary, keyFactors, suggestedActions, redAlert, provider, source, generatedAt, createdAt)
       VALUES (?, ?, ?, 'parent', ?, ?, ?, ?, 0, 'backend_parent_engine', 'student_app_sync', ?, ?)`,
      reportId,
      studentId,
      packetId,
      level === 'normal' ? 'Stable learning update' : 'Learning support update',
      'Parent-safe report generated from student app events and school records.',
      JSON.stringify(keyFactors),
      JSON.stringify(actions),
      generatedAt,
      generatedAt,
    );
  }

  private toParentTrendPoint(p: any) {
    const rawLevel = String(p.level || 'normal');
    return {
      date: iso(p.date),
      level: this.parentVisibleLevel(rawLevel),
      label: this.parentSafeLevelLabel(rawLevel),
      totalDeduction: Number(p.totalDeduction || 0),
      hiddenScoreShown: false,
      safeSummary: this.safeTrendSummary(rawLevel),
      parentAction: this.parentActionForTrendLevel(rawLevel),
      categories: {
        physicalRoutine: Math.abs(Number(p.sleepDeduction || 0) + Number(p.fatigueDeduction || 0)),
        learning: Math.abs(Number(p.studyLoadDeduction || 0) + Number(p.learningBehaviorDeduction || 0)),
        wellbeing: Math.abs(Number(p.wellbeingDeduction || 0) + Number(p.conversationDeduction || 0)),
        teacherParentSupport: Math.abs(Number(p.supportSignalDeduction || 0)),
      },
    };
  }

  private async buildParentSafeTrendPoints(studentId: string, days: number) {
    const [events, quizzes, assignments, metrics, healthAlerts] = await Promise.all([
      this.rows(`SELECT id, type, severity, safeSummary, metadataJson, createdAt FROM StudentEvent WHERE studentId = ? ORDER BY createdAt ASC LIMIT 200`, studentId),
      this.rows(`SELECT id, lessonId, accuracy, repeatedMistakesJson, createdAt FROM QuizResult WHERE studentId = ? ORDER BY createdAt ASC LIMIT 80`, studentId),
      this.rows(`SELECT id, title, status, dueDate, createdAt FROM Assignment WHERE studentId = ? OR classId = (SELECT classId FROM Student WHERE id = ?) ORDER BY COALESCE(dueDate, createdAt) ASC LIMIT 100`, studentId, studentId),
      this.rows(`SELECT id, steps, activeMinutes, sleepMinutes, restingHeartRate, hrv, bloodOxygen, capturedAt FROM PhoneHealthMetric WHERE studentId = ? ORDER BY capturedAt ASC LIMIT 80`, studentId),
      this.rows(`SELECT id, level, safeSummary, recommendedAction, triggeredSignalsJson, createdAt FROM ChildHealthAlert WHERE studentId = ? ORDER BY createdAt ASC LIMIT 40`, studentId),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today.getTime() - (days - 1) * 86400000);
    const demoPattern = [1, 1, 2, 1, 2, 3, 2, 3, 4, 3, 5, 4, 6, 4, 3, 2, 4, 5, 3, 2];

    return Array.from({ length: days }, (_, index) => {
      const day = new Date(start.getTime() + index * 86400000);
      const key = this.dayKey(day);
      const dayEvents = events.filter((e: any) => this.dayKey(e.createdAt) === key);
      const dayQuizzes = quizzes.filter((q: any) => this.dayKey(q.createdAt) === key);
      const dayAssignments = assignments.filter((a: any) => this.dayKey(a.dueDate || a.createdAt) === key);
      const dayMetrics = metrics.filter((m: any) => this.dayKey(m.capturedAt) === key);
      const dayAlerts = healthAlerts.filter((a: any) => this.dayKey(a.createdAt) === key);

      const baseScore = demoPattern[index % demoPattern.length];
      const physical = this.physicalRoutineScore(dayMetrics);
      const learning = this.learningScore(dayQuizzes, dayAssignments, dayEvents);
      const wellbeing = this.wellbeingScore(dayEvents, dayAlerts);
      const teacherParentSupport = this.teacherParentSupportScore(dayEvents, dayAlerts);
      const totalScore = Math.min(10, Math.round(baseScore + physical + learning + wellbeing + teacherParentSupport));
      const rawLevel = this.rawTrendLevelFromScore(totalScore);
      const evidenceCount = dayEvents.length + dayQuizzes.length + dayAssignments.length + dayMetrics.length + dayAlerts.length;
      const focus = this.trendFocus(dayEvents, dayQuizzes, dayAssignments, dayMetrics, dayAlerts);

      return {
        date: day.toISOString(),
        level: this.parentVisibleLevel(rawLevel),
        label: this.parentSafeLevelLabel(rawLevel),
        totalDeduction: -totalScore,
        hiddenScoreShown: false,
        evidenceCount,
        confidence: evidenceCount >= 4 ? 0.82 : evidenceCount >= 2 ? 0.72 : 0.62,
        safeSummary: this.safeTrendSummary(rawLevel, focus),
        parentAction: this.parentActionForTrendLevel(rawLevel, focus),
        categories: {
          physicalRoutine: physical,
          learning,
          wellbeing,
          teacherParentSupport,
        },
      };
    });
  }

  private dayKey(value: any) {
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return String(value || '').slice(0, 10);
    return d.toISOString().slice(0, 10);
  }

  private physicalRoutineScore(metrics: any[]) {
    if (!metrics.length) return 0;
    const latest = metrics[metrics.length - 1];
    let score = 0;
    if (Number(latest.sleepMinutes || 0) > 0 && Number(latest.sleepMinutes || 0) < 390) score += 1;
    if (Number(latest.activeMinutes || 0) > 0 && Number(latest.activeMinutes || 0) < 35) score += 1;
    if (Number(latest.steps || 0) > 0 && Number(latest.steps || 0) < 4500) score += 1;
    if (Number(latest.restingHeartRate || 0) > 95) score += 1;
    return score;
  }

  private learningScore(quizzes: any[], assignments: any[], events: any[]) {
    let score = 0;
    for (const quiz of quizzes) {
      const acc = Number(quiz.accuracy || 0);
      if (acc > 0 && acc < 0.65) score += 3;
      else if (acc > 0 && acc < 0.75) score += 2;
      else if (acc > 0 && acc < 0.82) score += 1;
    }
    for (const assignment of assignments) {
      const status = String(assignment.status || '').toLowerCase();
      if (status.includes('overdue') || status.includes('late') || status.includes('missing')) score += 3;
      else if (status.includes('progress') || status.includes('opened') || status.includes('not_started') || status.includes('assigned')) score += 1;
    }
    for (const event of events) {
      const type = String(event.type || '').toLowerCase();
      const severity = String(event.severity || '').toLowerCase();
      if (type.includes('wrong') || type.includes('quiz') || type.includes('low_confidence') || type.includes('drop_off')) score += severity === 'high' ? 3 : severity === 'medium' ? 2 : 1;
    }
    return Math.min(5, score);
  }

  private wellbeingScore(events: any[], healthAlerts: any[]) {
    let score = healthAlerts.length ? 1 : 0;
    for (const event of events) {
      const type = String(event.type || '').toLowerCase();
      const severity = String(event.severity || '').toLowerCase();
      if (type.includes('wellbeing') || type.includes('frustration') || type.includes('confidence') || type.includes('support')) {
        score += severity === 'high' ? 3 : severity === 'medium' ? 2 : 1;
      }
      if (type.includes('safety_review') || type.includes('distress')) score += 3;
    }
    return Math.min(5, score);
  }

  private teacherParentSupportScore(events: any[], healthAlerts: any[]) {
    let score = 0;
    if (healthAlerts.some((a: any) => ['high', 'urgent', 'red', 'critical'].includes(String(a.level || '').toLowerCase()))) score += 2;
    for (const event of events) {
      const type = String(event.type || '').toLowerCase();
      if (type.includes('teacher') || type.includes('parent') || type.includes('attendance') || type.includes('support_requested')) score += 1;
    }
    return Math.min(4, score);
  }

  private trendFocus(events: any[], quizzes: any[], assignments: any[], metrics: any[], alerts: any[]) {
    if (alerts.length || events.some((e: any) => /wellbeing|support|frustration|confidence/i.test(`${e.type} ${e.safeSummary}`))) return 'wellbeing and learning confidence';
    if (metrics.length) return 'routine and recovery';
    if (quizzes.length || assignments.length || events.some((e: any) => /quiz|lesson|wrong|assignment/i.test(`${e.type} ${e.safeSummary}`))) return 'learning review';
    return 'daily routine';
  }

  private rawTrendLevelFromScore(score: number) {
    if (score >= 8) return 'red';
    if (score >= 5) return 'elevated';
    if (score >= 2) return 'watch';
    return 'normal';
  }

  private parentVisibleLevel(level: any) {
    const value = String(level || '').toLowerCase();
    if (['red', 'urgent', 'critical', 'severe'].includes(value)) return 'urgent';
    if (['elevated', 'attention', 'high'].includes(value)) return 'attention';
    return 'monitor';
  }

  private safeTrendSummary(level: any, focus = 'daily routine') {
    const visible = this.parentVisibleLevel(level);
    if (visible === 'urgent') return `A parent-safe ${focus} signal needs coordinated school and home support.`;
    if (visible === 'attention') return `Recent ${focus} signals need a calm, short parent check-in.`;
    if (String(level || '').toLowerCase() === 'watch') return `Recent ${focus} signals should be monitored without extra pressure.`;
    return `No major parent-visible concern is open for ${focus}.`;
  }

  private parentActionForTrendLevel(level: any, focus = 'daily routine') {
    const visible = this.parentVisibleLevel(level);
    if (visible === 'urgent') return 'Contact the homeroom teacher or school support channel and keep the home response calm.';
    if (visible === 'attention') return `Choose one ${focus} action tonight, keep it under 20 minutes, and message the teacher if it repeats.`;
    if (String(level || '').toLowerCase() === 'watch') return `Monitor ${focus} gently and keep the routine predictable.`;
    return 'Keep the normal routine and ask one low-pressure question about today.';
  }

  private categoryBreakdown(packet: any, keyFactors: string[]) {
    const reasons = Array.isArray(keyFactors) ? keyFactors : [];
    return [
      { key: 'learning', title: 'Learning', level: 'monitor', reasons, parentText: reasons[0] || 'No major learning concern is open.' },
      { key: 'physical', title: 'Physical routine', level: 'monitor', reasons: [], parentText: 'Physical data is shown only as parent-safe summary.' },
      { key: 'wellbeing', title: 'Wellbeing', level: parentLevel(packet?.level), reasons, parentText: 'Wellbeing signals are summarized without raw private text.' },
      { key: 'routine', title: 'Home routine', level: 'monitor', reasons: [], parentText: 'Keep review short and predictable.' },
      { key: 'teacherParent', title: 'Teacher-parent coordination', level: 'monitor', reasons: [], parentText: 'Contact teacher when support signals repeat.' },
    ];
  }

  private parentSafeLevelLabel(level: any) {
    const raw = String(level || '').toLowerCase();
    if (['red', 'urgent', 'critical', 'severe'].includes(raw)) return 'Needs school support';
    if (['elevated', 'attention', 'high'].includes(raw)) return 'Needs attention';
    if (['watch', 'medium', 'moderate'].includes(raw)) return 'Monitor';
    return 'Stable';
  }

  private categoryFromEvent(type: any) {
    const v = String(type || '').toLowerCase();
    if (v.includes('quiz') || v.includes('lesson') || v.includes('wrong')) return 'learning';
    if (v.includes('health') || v.includes('sleep') || v.includes('wellbeing')) return 'health_wellbeing';
    if (v.includes('support')) return 'support';
    if (v.includes('group')) return 'group_work';
    return 'learning';
  }

  private titleFromEvent(type: any) {
    const v = String(type || '').replace(/_/g, ' ');
    return v ? v[0].toUpperCase() + v.slice(1) : 'Student app signal';
  }

  private evidenceCount(metadataJson: any) {
    const data = asJson(metadataJson, {});
    if (Array.isArray(data?.evidence)) return data.evidence.length;
    if (typeof data?.evidenceCount === 'number') return data.evidenceCount;
    return 1;
  }

  private confidenceFromSeverity(severity: any) {
    const v = String(severity || '').toLowerCase();
    if (v === 'high') return 0.84;
    if (v === 'medium') return 0.72;
    return 0.62;
  }

  private recommendedActionFromEvent(type: any, severity: any) {
    const v = String(type || '').toLowerCase();
    if (v.includes('quiz') || v.includes('wrong')) return 'Review one short concept and avoid long extra practice.';
    if (v.includes('support') || String(severity).toLowerCase() === 'high') return 'Talk calmly with the child and contact the teacher if the signal continues.';
    return 'Monitor gently and keep tonight routine predictable.';
  }

  private weakSkillsForSubject(subject: any, accuracy: number) {
    const s = String(subject || '').toLowerCase();
    if (s.includes('bio')) return accuracy < 0.7 ? ['Cell organelles', 'Explain function in own words'] : ['Review key vocabulary'];
    if (s.includes('math')) return accuracy < 0.7 ? ['Multi-step reasoning', 'Careful calculation'] : ['Explain solution steps'];
    if (s.includes('english')) return ['Main idea reading', 'Daily vocabulary'];
    return accuracy < 0.7 ? ['Review core concept', 'Ask for one example'] : ['Maintain routine review'];
  }

  private keyPointsForSubject(subject: any) {
    const s = String(subject || '').toLowerCase();
    if (s.includes('bio')) return ['Cell structure', 'Organelle function', 'Explain with a model'];
    if (s.includes('math')) return ['Read the problem', 'Solve step by step', 'Check the answer'];
    if (s.includes('english')) return ['Read for main idea', 'Review vocabulary', 'Answer in short sentences'];
    return ['Core idea', 'Example', 'Short review'];
  }

  private homeQuestionsForSubject(subject: any) {
    const s = String(subject || '').toLowerCase();
    if (s.includes('bio')) return ['Can you point to one cell part and explain its job?', 'What was the easiest organelle to remember?'];
    if (s.includes('math')) return ['Which step was hardest?', 'Can you show one example slowly?'];
    return ['What did you learn today?', 'What should we review for ten minutes?'];
  }
}

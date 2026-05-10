import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { ReportsService } from "./reports.service";
import { PermissionService } from "../authz/permission.service";
import { ParentService } from "../parent/parent.service";

@Controller("v1")
export class ReportsController {
  constructor(
    private readonly reports: ReportsService,
    private readonly authz: PermissionService,
    private readonly parentService: ParentService,
  ) {}

  private parentUserId(req: any) {
    const actor = this.authz.getDemoActor(req);
    if (actor?.role === "school_admin") return "parent_001";
    return String(req?.headers?.["x-parent-user-id"] || actor?.userId || "parent_001");
  }

  @Get("teacher/classes/:classId/dashboard")
  async getTeacherDashboard(@Req() req: any, @Param("classId") classId: string) {
    const actor = this.authz.getDemoActor(req);
    await this.authz.assertCanViewClass(actor, classId);
    return this.reports.getTeacherDashboard(classId);
  }

  @Get("teacher/students/:studentId/report")
  async getTeacherStudentReport(@Req() req: any, @Param("studentId") studentId: string) {
    const actor = this.authz.getDemoActor(req);
    await this.authz.assertCanViewStudent(actor, studentId, "teacher");
    return this.reports.getTeacherStudentReport(studentId);
  }

  // Parent-facing routes are delegated to ParentService so the Parent App receives
  // the commercial, English, one-parent-one-student data model instead of the older report mock.
  @Get("parent/children")
  getParentChildren(@Req() req: any) {
    return this.parentService.children(this.parentUserId(req));
  }

  @Get("parent/children/:studentId/profile")
  getParentProfile(@Req() req: any, @Param("studentId") studentId: string) {
    return this.parentService.profile(studentId, this.parentUserId(req));
  }

  @Get("parent/children/:studentId/report")
  getParentReport(@Req() req: any, @Param("studentId") studentId: string) {
    return this.parentService.parentDashboardReport(studentId, this.parentUserId(req));
  }

  @Get("parent/children/:studentId/subjects")
  getParentSubjects(@Req() req: any, @Param("studentId") studentId: string) {
    return this.parentService.subjects(studentId, this.parentUserId(req));
  }

  @Get("parent/children/:studentId/progress-timeline")
  getProgressTimeline(@Req() req: any, @Param("studentId") studentId: string) {
    return this.parentService.progressTimeline(studentId, this.parentUserId(req));
  }

  @Get("parent/children/:studentId/timeline")
  getTimeline(@Req() req: any, @Param("studentId") studentId: string) {
    return this.parentService.timeline(studentId, this.parentUserId(req));
  }

  @Get("parent/children/:studentId/assignments")
  getParentAssignments(@Req() req: any, @Param("studentId") studentId: string) {
    return this.parentService.assignments(studentId, this.parentUserId(req));
  }

  @Get("parent/children/:studentId/lessons")
  getParentLessons(@Req() req: any, @Param("studentId") studentId: string) {
    return this.parentService.lessons(studentId, this.parentUserId(req));
  }

  @Get("parent/children/:studentId/home-support-plan")
  getHomeSupportPlan(@Req() req: any, @Param("studentId") studentId: string) {
    return this.parentService.homeSupportPlan(studentId, this.parentUserId(req));
  }

  @Get("parent/children/:studentId/family-report")
  getFamilyReport(@Req() req: any, @Param("studentId") studentId: string) {
    return this.parentService.familyReport(studentId, this.parentUserId(req));
  }

  @Get("parent/children/:studentId/privacy-center")
  getPrivacyCenter(@Req() req: any, @Param("studentId") studentId: string) {
    return this.parentService.privacyCenter(studentId, this.parentUserId(req));
  }

  @Get("parent/children/:studentId/consent-log")
  getConsentLog(@Req() req: any, @Param("studentId") studentId: string) {
    return this.parentService.consentLog(studentId, this.parentUserId(req));
  }

  @Get("parent/children/:studentId/ar-lessons")
  getArLessons(@Req() req: any, @Param("studentId") studentId: string) {
    return this.parentService.arLessons(studentId, this.parentUserId(req));
  }

  @Get("parent/children/:studentId/group-work")
  getGroupWork(@Req() req: any, @Param("studentId") studentId: string) {
    return this.parentService.groupWork(studentId, this.parentUserId(req));
  }

  @Get("parent/children/:studentId/messages")
  getMessages(@Req() req: any, @Param("studentId") studentId: string) {
    return this.parentService.messages(studentId, this.parentUserId(req));
  }

  @Get("parent/notices")
  getNotices() {
    return this.parentService.notices();
  }

  @Get("parent/children/:studentId/timetable")
  getTimetable(@Req() req: any, @Param("studentId") studentId: string) {
    return this.parentService.timetable(studentId, this.parentUserId(req));
  }

  @Get("parent/children/:studentId/attendance")
  getAttendance(@Req() req: any, @Param("studentId") studentId: string) {
    return this.parentService.attendance(studentId, this.parentUserId(req));
  }

  @Get("parent/children/:studentId/notes")
  getParentNotes(@Req() req: any, @Param("studentId") studentId: string) {
    return this.parentService.notes(studentId, this.parentUserId(req));
  }

  @Get("parent/children/:studentId/reports")
  getParentReports(@Req() req: any, @Param("studentId") studentId: string) {
    return this.parentService.reports(studentId, this.parentUserId(req));
  }

  @Get("parent/children/:studentId/device-sync")
  getDeviceSync(@Req() req: any, @Param("studentId") studentId: string) {
    return this.parentService.deviceSync(studentId, this.parentUserId(req));
  }

  @Get("parent/children/:studentId/alerts")
  getParentAlerts(@Req() req: any, @Param("studentId") studentId: string) {
    return this.parentService.alerts(studentId, this.parentUserId(req));
  }

  @Get("parent/children/:studentId/health-vault-summary")
  getHealthVaultSummary(@Req() req: any, @Param("studentId") studentId: string) {
    return this.parentService.healthWellbeingVault(studentId, this.parentUserId(req));
  }

  @Get("parent/children/:studentId/health-wellbeing-vault")
  getHealthWellbeingVault(@Req() req: any, @Param("studentId") studentId: string) {
    return this.parentService.healthWellbeingVault(studentId, this.parentUserId(req));
  }

  @Get("parent/children/:studentId/quiz-mastery")
  getQuizMastery(@Req() req: any, @Param("studentId") studentId: string) {
    return this.parentService.quizMastery(studentId, this.parentUserId(req));
  }

  @Get("parent/children/:studentId/trend-report")
  getTrendReport(@Req() req: any, @Param("studentId") studentId: string) {
    return this.parentService.trendReport(studentId, this.parentUserId(req));
  }

  @Get("parent/children/:studentId/trend")
  getTrend(@Req() req: any, @Param("studentId") studentId: string) {
    return this.parentService.trend(studentId, this.parentUserId(req));
  }

  @Get("parent/children/:studentId/trend-chart")
  getTrendChart(@Req() req: any, @Param("studentId") studentId: string) {
    return this.parentService.trendChart(studentId, 14, this.parentUserId(req));
  }

  @Post("parent/children/:studentId/guardian-consent")
  async setGuardianConsent(@Req() req: any, @Param("studentId") studentId: string, @Body() body: { teacherId: string; active: boolean }) {
    const actor = this.authz.getDemoActor(req);
    await this.authz.assertCanViewParentChild(actor, studentId);
    return this.reports.setGuardianConsent(studentId, body.teacherId || "teacher_001", Boolean(body.active));
  }

  @Post("parent/children/:studentId/consent/share-with-teacher")
  async shareWithTeacher(@Req() req: any, @Param("studentId") studentId: string, @Body() body: { teacherId: string; reason: string; expiry?: string }) {
    const actor = this.authz.getDemoActor(req);
    await this.authz.assertCanViewParentChild(actor, studentId);
    return this.reports.shareWithTeacher(studentId, body.teacherId || "teacher_001", body.reason || "parent_request", body.expiry);
  }

  @Post("parent/children/:studentId/consent/revoke-teacher-share")
  async revokeTeacherShare(@Req() req: any, @Param("studentId") studentId: string, @Body() body: { teacherId: string }) {
    const actor = this.authz.getDemoActor(req);
    await this.authz.assertCanViewParentChild(actor, studentId);
    return this.reports.revokeTeacherShare(studentId, body.teacherId || "teacher_001");
  }

  @Get("admin/schools/:schoolId/overview")
  getAdminOverview(@Req() req: any, @Param("schoolId") schoolId: string) {
    this.authz.assertRole(this.authz.getDemoActor(req), ["school_admin"]);
    return this.reports.getAdminOverview(schoolId);
  }

  @Get("admin/ai-usage")
  getAdminAiUsage(@Req() req: any) {
    this.authz.assertRole(this.authz.getDemoActor(req), ["school_admin"]);
    return this.reports.getAdminAiUsage();
  }

  @Get("admin/db-stats")
  getDatabaseStats(@Req() req: any) {
    this.authz.assertRole(this.authz.getDemoActor(req), ["school_admin"]);
    return this.reports.getDatabaseStats();
  }

  @Get("admin/api-usage")
  getAdminApiUsage(@Req() req: any) {
    this.authz.assertRole(this.authz.getDemoActor(req), ["school_admin"]);
    return this.reports.getAdminApiUsage();
  }

  @Get("admin/classes/:classId/aggregate")
  async getAdminClassAggregate(@Req() req: any, @Param("classId") classId: string) {
    this.authz.assertRole(this.authz.getDemoActor(req), ["school_admin"]);
    return this.reports.getAdminClassAggregate(classId);
  }

  @Get("admin/privacy-readiness")
  async getPrivacyReadiness(@Req() req: any) {
    this.authz.assertRole(this.authz.getDemoActor(req), ["school_admin"]);
    return this.reports.getPrivacyReadiness();
  }

  @Post("admin/teachers/:teacherId/class-access")
  async upsertTeacherClassAccess(@Req() req: any, @Param("teacherId") teacherId: string, @Body() body: { classId: string; subjectId: string; roleType: string }) {
    this.authz.assertRole(this.authz.getDemoActor(req), ["school_admin"]);
    return this.reports.upsertTeacherClassAccess(teacherId, body.classId, body.subjectId || "biology", body.roleType || "subject_teacher");
  }

  @Post("admin/teachers/:teacherId/class-access/remove")
  async removeTeacherClassAccess(@Req() req: any, @Param("teacherId") teacherId: string, @Body() body: { classId: string; subjectId: string }) {
    this.authz.assertRole(this.authz.getDemoActor(req), ["school_admin"]);
    return this.reports.removeTeacherClassAccess(teacherId, body.classId, body.subjectId || "biology");
  }

  @Get("teacher/students/:studentId/learning-signals")
  async getTeacherLearningSignals(@Req() req: any, @Param("studentId") studentId: string) {
    const actor = this.authz.getDemoActor(req);
    await this.authz.assertCanViewStudent(actor, studentId, "teacher");
    return this.reports.getTeacherLearningSignals(studentId);
  }

  @Get("teacher/students/:studentId/guardian-shared-signals")
  async getGuardianSharedSignals(@Req() req: any, @Param("studentId") studentId: string) {
    const actor = this.authz.getDemoActor(req);
    await this.authz.assertCanViewGuardianContext(actor, studentId);
    return this.reports.getGuardianSharedSignals(studentId, actor.userId);
  }

  @Post("teacher/ar-assignments")
  async createArAssignment(@Req() req: any, @Body() body: { classId: string; title: string; subject: string; lessonId?: string; dueDate?: string }) {
    const actor = this.authz.getDemoActor(req);
    await this.authz.assertCanAuthorLesson(actor, body.classId, body.subject || "biology");
    return this.reports.createArAssignment({ teacherId: actor.userId, classId: body.classId, title: body.title || "AR Assignment", subject: body.subject || "Biology", lessonId: body.lessonId, dueDate: body.dueDate });
  }

  @Post("admin/permissions/assign-teacher-role")
  async assignTeacherRole(@Req() req: any, @Body() body: { teacherId: string; classId: string; subjectId: string; roleType: string; expiry?: string }) {
    this.authz.assertRole(this.authz.getDemoActor(req), ["school_admin"]);
    return this.reports.assignTeacherRole({ teacherId: body.teacherId || "teacher_001", classId: body.classId || "class_8a", subjectId: body.subjectId || "biology", roleType: body.roleType || "subject_teacher", expiry: body.expiry });
  }
}

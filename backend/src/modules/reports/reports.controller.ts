import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { ReportsService } from "./reports.service";
import { PermissionService } from "../authz/permission.service";

@Controller("v1")
export class ReportsController {
  constructor(
    private readonly reports: ReportsService,
    private readonly authz: PermissionService,
  ) {}

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

  @Get("parent/children/:studentId/report")
  async getParentReport(@Req() req: any, @Param("studentId") studentId: string) {
    const actor = this.authz.getDemoActor(req);
    await this.authz.assertCanViewParentChild(actor, studentId);
    return this.reports.getParentReport(studentId);
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

  @Get("parent/children/:studentId/lessons")
  async getParentLessons(@Req() req: any, @Param("studentId") studentId: string) {
    const actor = this.authz.getDemoActor(req);
    await this.authz.assertCanViewParentChild(actor, studentId);
    return this.reports.getParentLessons(studentId);
  }

  @Post("parent/children/:studentId/guardian-consent")
  async setGuardianConsent(
    @Req() req: any,
    @Param("studentId") studentId: string,
    @Body() body: { teacherId: string; active: boolean },
  ) {
    const actor = this.authz.getDemoActor(req);
    await this.authz.assertCanViewParentChild(actor, studentId);
    return this.reports.setGuardianConsent(studentId, body.teacherId || "teacher_001", Boolean(body.active));
  }

  @Post("admin/teachers/:teacherId/class-access")
  async upsertTeacherClassAccess(
    @Req() req: any,
    @Param("teacherId") teacherId: string,
    @Body() body: { classId: string; subjectId: string; roleType: string },
  ) {
    this.authz.assertRole(this.authz.getDemoActor(req), ["school_admin"]);
    return this.reports.upsertTeacherClassAccess(teacherId, body.classId, body.subjectId || "biology", body.roleType || "subject_teacher");
  }

  @Post("admin/teachers/:teacherId/class-access/remove")
  async removeTeacherClassAccess(
    @Req() req: any,
    @Param("teacherId") teacherId: string,
    @Body() body: { classId: string; subjectId: string },
  ) {
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
    return this.reports.createArAssignment({
      teacherId: actor.userId,
      classId: body.classId,
      title: body.title || "AR Assignment",
      subject: body.subject || "Biology",
      lessonId: body.lessonId,
      dueDate: body.dueDate,
    });
  }

  @Get("parent/children")
  async getParentChildren(@Req() req: any) {
    const actor = this.authz.getDemoActor(req);
    this.authz.assertRole(actor, ["parent", "school_admin"]);
    return this.reports.getParentChildren(actor.role === "school_admin" ? "parent_001" : actor.userId);
  }

  @Get("parent/children/:studentId/alerts")
  async getParentAlerts(@Req() req: any, @Param("studentId") studentId: string) {
    const actor = this.authz.getDemoActor(req);
    await this.authz.assertCanViewParentChild(actor, studentId);
    return this.reports.getParentAlerts(studentId);
  }

  @Get("parent/children/:studentId/health-vault-summary")
  async getHealthVaultSummary(@Req() req: any, @Param("studentId") studentId: string) {
    const actor = this.authz.getDemoActor(req);
    await this.authz.assertCanViewParentChild(actor, studentId);
    return this.reports.getHealthVaultSummary(studentId);
  }

  @Post("parent/children/:studentId/consent/share-with-teacher")
  async shareWithTeacher(
    @Req() req: any,
    @Param("studentId") studentId: string,
    @Body() body: { teacherId: string; reason: string; expiry?: string },
  ) {
    const actor = this.authz.getDemoActor(req);
    await this.authz.assertCanViewParentChild(actor, studentId);
    return this.reports.shareWithTeacher(studentId, body.teacherId || "teacher_001", body.reason || "parent_request", body.expiry);
  }

  @Post("parent/children/:studentId/consent/revoke-teacher-share")
  async revokeTeacherShare(
    @Req() req: any,
    @Param("studentId") studentId: string,
    @Body() body: { teacherId: string },
  ) {
    const actor = this.authz.getDemoActor(req);
    await this.authz.assertCanViewParentChild(actor, studentId);
    return this.reports.revokeTeacherShare(studentId, body.teacherId || "teacher_001");
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

  @Post("admin/permissions/assign-teacher-role")
  async assignTeacherRole(
    @Req() req: any,
    @Body() body: { teacherId: string; classId: string; subjectId: string; roleType: string; expiry?: string },
  ) {
    this.authz.assertRole(this.authz.getDemoActor(req), ["school_admin"]);
    return this.reports.assignTeacherRole({
      teacherId: body.teacherId || "teacher_001",
      classId: body.classId || "class_8a",
      subjectId: body.subjectId || "biology",
      roleType: body.roleType || "subject_teacher",
      expiry: body.expiry,
    });
  }
}

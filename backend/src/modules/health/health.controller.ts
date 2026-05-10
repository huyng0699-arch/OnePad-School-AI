import { Body, Controller, Get, Param, Post, Query, Req } from "@nestjs/common";
import { IngestHealthMetricsDto } from "./dto/ingest-health-metrics.dto";
import { HealthMonitoringService } from "./health-monitoring.service";
import { PermissionService } from "../authz/permission.service";

@Controller()
export class HealthController {
  constructor(
    private readonly healthMonitoring: HealthMonitoringService,
    private readonly authz: PermissionService,
  ) {}

  @Get("health")
  getHealth() {
    return {
      ok: true,
      service: "onepad-real-backend",
      time: new Date().toISOString(),
    };
  }

  @Post("v1/health/metrics/ingest")
  ingestHealthMetrics(@Body() body: IngestHealthMetricsDto) {
    return this.healthMonitoring.ingestMetrics(body);
  }

  @Get("v1/parent/children/:studentId/health-alerts")
  async getParentHealthAlerts(@Req() req: any, @Param("studentId") studentId: string) {
    const actor = this.authz.getDemoActor(req);
    await this.authz.assertCanViewParentChild(actor, studentId);
    await this.authz.writeAccessAuditLog(actor, "read_health_alerts", "student", studentId, "parent_health_alerts");
    return this.healthMonitoring.getStudentAlerts(studentId);
  }

  @Get("v1/admin/schools/:schoolId/health-alerts")
  async getSchoolHealthAlerts(@Req() req: any, @Param("schoolId") schoolId: string) {
    const actor = this.authz.getDemoActor(req);
    this.authz.assertRole(actor, ["school_admin"]);
    await this.authz.writeAccessAuditLog(actor, "read_school_health_alerts", "school", schoolId, "admin_health_overview");
    return this.healthMonitoring.getSchoolAlertOverview(schoolId);
  }

  @Get("v1/student/health/summary")
  async getStudentHealthSummary(@Req() req: any, @Query("studentId") studentId = "stu_001") {
    const actor = this.authz.getDemoActor(req);
    await this.authz.assertCanViewStudent(actor, studentId, "student");
    return this.healthMonitoring.getStudentHealthSummary(studentId);
  }

  @Get("v1/student/health/logs")
  async getStudentHealthLogs(@Req() req: any, @Query("studentId") studentId = "stu_001") {
    const actor = this.authz.getDemoActor(req);
    await this.authz.assertCanViewStudent(actor, studentId, "student");
    return this.healthMonitoring.getStudentHealthLogs(studentId);
  }

  @Post("v1/student/wellbeing/check-ins")
  postWellbeingCheckIn(@Body() body: any) {
    return this.healthMonitoring.saveWellbeingCheckIn(body);
  }

  @Get("v1/student/wellbeing/signals")
  async getStudentWellbeingSignals(@Req() req: any, @Query("studentId") studentId = "stu_001") {
    const actor = this.authz.getDemoActor(req);
    await this.authz.assertCanViewStudent(actor, studentId, "student");
    return this.healthMonitoring.getStudentWellbeingSignals(studentId);
  }

  @Post("v1/student/support-signals")
  postStudentSupportSignal(@Body() body: any) {
    return this.healthMonitoring.saveSupportSignal(body);
  }

  @Get("v1/parent/children/:studentId/health-wellbeing-vault")
  async getParentHealthWellbeingVault(@Req() req: any, @Param("studentId") studentId: string) {
    const actor = this.authz.getDemoActor(req);
    await this.authz.assertCanViewParentChild(actor, studentId);
    await this.authz.writeAccessAuditLog(actor, "read_health_wellbeing_vault", "student", studentId, "parent_vault_view");
    return this.healthMonitoring.getParentHealthWellbeingVault(studentId);
  }

  @Get("v1/teacher/students/:studentId/support-summary")
  async getTeacherSupportSummary(@Req() req: any, @Param("studentId") studentId: string) {
    const actor = this.authz.getDemoActor(req);
    await this.authz.assertCanViewStudent(actor, studentId, "teacher");
    await this.authz.writeAccessAuditLog(actor, "read_support_summary", "student", studentId, "teacher_support_view");
    return this.healthMonitoring.getTeacherSupportSummary(studentId);
  }

  @Get("v1/teacher/classes/:classId/wellbeing-summary")
  async getTeacherClassWellbeingSummary(@Req() req: any, @Param("classId") classId: string) {
    const actor = this.authz.getDemoActor(req);
    await this.authz.assertCanViewClass(actor, classId);
    return this.healthMonitoring.getTeacherClassWellbeingSummary(classId);
  }

  @Get("v1/admin/schools/:schoolId/wellbeing-overview")
  async getSchoolWellbeingOverview(@Req() req: any, @Param("schoolId") schoolId: string) {
    const actor = this.authz.getDemoActor(req);
    this.authz.assertRole(actor, ["school_admin"]);
    await this.authz.writeAccessAuditLog(actor, "read_wellbeing_overview", "school", schoolId, "admin_wellbeing_overview");
    return this.healthMonitoring.getSchoolWellbeingOverview(schoolId);
  }

  @Get("v1/admin/audit-logs")
  async getAdminAuditLogs(@Req() req: any) {
    const actor = this.authz.getDemoActor(req);
    this.authz.assertRole(actor, ["school_admin"]);
    return this.healthMonitoring.getAuditLogs();
  }
}

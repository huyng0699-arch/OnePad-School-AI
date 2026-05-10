import { Body, Controller, Get, Param, Post, Query, Req } from "@nestjs/common";
import { PermissionService } from "../authz/permission.service";
import { StudentTrendsService } from "./student-trends.service";

@Controller("v1")
export class StudentTrendsController {
  constructor(
    private readonly trends: StudentTrendsService,
    private readonly authz: PermissionService,
  ) {}

  @Post("student-trends/evaluate")
  evaluate(@Body() body: { studentId: string; packet?: any; source: "live_backend" | "local_cache" | "demo_seed" }) {
    return this.trends.evaluateAndSave(body.studentId, body.source, body.packet);
  }

  @Get("student-trends/students/:studentId/latest")
  getLatest(@Param("studentId") studentId: string) {
    return this.trends.getLatest(studentId);
  }

  @Get("parent/children/:studentId/trend-report")
  getParentTrendReport(@Req() req: any, @Param("studentId") studentId: string) {
    const actor = this.authz.getDemoActor(req);
    return this.trends.getParentTrendReport(studentId, actor);
  }

  @Get("parent/children/:studentId/trend-chart")
  getParentTrendChart(@Req() req: any, @Param("studentId") studentId: string, @Query("days") days = "14") {
    const actor = this.authz.getDemoActor(req);
    return this.trends.getParentTrendChart(studentId, actor, Number(days) || 14);
  }

  @Get("teacher/students/:studentId/trend-summary")
  getTeacherSummary(@Req() req: any, @Param("studentId") studentId: string) {
    const actor = this.authz.getDemoActor(req);
    return this.trends.getTeacherTrendSummary(studentId, actor);
  }

  @Get("teacher/support-queue")
  getTeacherSupportQueue(@Req() req: any) {
    const actor = this.authz.getDemoActor(req);
    return this.trends.getTeacherSupportQueue(actor);
  }

  @Get("admin/schools/:schoolId/trend-overview")
  getAdminOverview(@Req() req: any, @Param("schoolId") schoolId: string) {
    const actor = this.authz.getDemoActor(req);
    return this.trends.getAdminTrendOverview(schoolId, actor);
  }

  @Get("admin/students/:studentId/trend-detail")
  getAdminDetail(@Req() req: any, @Param("studentId") studentId: string) {
    const actor = this.authz.getDemoActor(req);
    return this.trends.getAdminTrendDetail(studentId, actor);
  }

  @Post("admin/jobs/nightly-student-summary/run")
  runNightly(@Req() req: any) {
    const actor = this.authz.getDemoActor(req);
    this.authz.assertRole(actor, ["school_admin"]);
    return this.trends.runNightlyForAllStudents();
  }
}

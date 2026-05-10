import { Body, Controller, Get, Headers, Param, Post, Query } from '@nestjs/common';
import { ParentService } from './parent.service';

type StudentAppEventIngestDto = {
  studentId: string;
  deviceId?: string;
  sessionId?: string;
  events?: Array<Record<string, any>>;
  quizResults?: Array<Record<string, any>>;
  assignments?: Array<Record<string, any>>;
  healthMetrics?: Array<Record<string, any>>;
  localAiStatus?: Array<Record<string, any>>;
};

@Controller('v1')
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  @Get('parent/login-options')
  loginOptions(@Headers('x-parent-user-id') parentUserId?: string) {
    return this.parentService.loginOptions(parentUserId);
  }



  @Get('parent/children')
  children(@Headers('x-parent-user-id') parentUserId?: string) {
    return this.parentService.children(parentUserId);
  }

  @Get('parent/children/:studentId/report')
  parentDashboardReport(@Param('studentId') studentId: string, @Headers('x-parent-user-id') parentUserId?: string) {
    return this.parentService.parentDashboardReport(studentId, parentUserId);
  }

  @Get('parent/children/:studentId/health-vault-summary')
  healthVaultSummary(@Param('studentId') studentId: string, @Headers('x-parent-user-id') parentUserId?: string) {
    return this.parentService.healthWellbeingVault(studentId, parentUserId);
  }

  @Get('parent/children/:studentId/wellbeing-summary')
  wellbeingSummary(@Param('studentId') studentId: string, @Headers('x-parent-user-id') parentUserId?: string) {
    return this.parentService.wellbeingSummary(studentId, parentUserId);
  }


  @Get('parent/children/:studentId/profile')
  profile(@Param('studentId') studentId: string, @Headers('x-parent-user-id') parentUserId?: string) {
    return this.parentService.profile(studentId, parentUserId);
  }

  @Get('parent/children/:studentId/trend-report')
  trendReport(@Param('studentId') studentId: string, @Headers('x-parent-user-id') parentUserId?: string) {
    return this.parentService.trendReport(studentId, parentUserId);
  }

  @Get('parent/children/:studentId/trend')
  trend(@Param('studentId') studentId: string, @Headers('x-parent-user-id') parentUserId?: string) {
    return this.parentService.trend(studentId, parentUserId);
  }

  @Get('parent/children/:studentId/trend-chart')
  trendChart(@Param('studentId') studentId: string, @Query('days') days = '14', @Headers('x-parent-user-id') parentUserId?: string) {
    return this.parentService.trendChart(studentId, Number(days || 14), parentUserId);
  }

  @Get('parent/children/:studentId/alerts')
  alerts(@Param('studentId') studentId: string, @Headers('x-parent-user-id') parentUserId?: string) {
    return this.parentService.alerts(studentId, parentUserId);
  }

  @Get('parent/children/:studentId/health-alerts')
  healthAlerts(@Param('studentId') studentId: string, @Headers('x-parent-user-id') parentUserId?: string) {
    return this.parentService.alerts(studentId, parentUserId);
  }

  @Get('parent/children/:studentId/subjects')
  subjects(@Param('studentId') studentId: string, @Headers('x-parent-user-id') parentUserId?: string) {
    return this.parentService.subjects(studentId, parentUserId);
  }

  @Get('parent/children/:studentId/assignments')
  assignments(@Param('studentId') studentId: string, @Headers('x-parent-user-id') parentUserId?: string) {
    return this.parentService.assignments(studentId, parentUserId);
  }

  @Get('parent/children/:studentId/lessons')
  lessons(@Param('studentId') studentId: string, @Headers('x-parent-user-id') parentUserId?: string) {
    return this.parentService.lessons(studentId, parentUserId);
  }

  @Get('parent/children/:studentId/quiz-mastery')
  quizMastery(@Param('studentId') studentId: string, @Headers('x-parent-user-id') parentUserId?: string) {
    return this.parentService.quizMastery(studentId, parentUserId);
  }

  @Get('parent/children/:studentId/progress-timeline')
  progressTimeline(@Param('studentId') studentId: string, @Headers('x-parent-user-id') parentUserId?: string) {
    return this.parentService.progressTimeline(studentId, parentUserId);
  }

  @Get('parent/children/:studentId/timeline')
  timeline(@Param('studentId') studentId: string, @Headers('x-parent-user-id') parentUserId?: string) {
    return this.parentService.timeline(studentId, parentUserId);
  }

  @Get('parent/children/:studentId/home-support-plan')
  homeSupportPlan(@Param('studentId') studentId: string, @Headers('x-parent-user-id') parentUserId?: string) {
    return this.parentService.homeSupportPlan(studentId, parentUserId);
  }

  @Get('parent/children/:studentId/family-report')
  familyReport(@Param('studentId') studentId: string, @Headers('x-parent-user-id') parentUserId?: string) {
    return this.parentService.familyReport(studentId, parentUserId);
  }

  @Get('parent/children/:studentId/health-wellbeing-vault')
  healthWellbeingVault(@Param('studentId') studentId: string, @Headers('x-parent-user-id') parentUserId?: string) {
    return this.parentService.healthWellbeingVault(studentId, parentUserId);
  }

  @Get('parent/children/:studentId/privacy-center')
  privacyCenter(@Param('studentId') studentId: string, @Headers('x-parent-user-id') parentUserId?: string) {
    return this.parentService.privacyCenter(studentId, parentUserId);
  }

  @Get('parent/children/:studentId/consent-log')
  consentLog(@Param('studentId') studentId: string, @Headers('x-parent-user-id') parentUserId?: string) {
    return this.parentService.consentLog(studentId, parentUserId);
  }

  @Get('parent/children/:studentId/ar-lessons')
  arLessons(@Param('studentId') studentId: string, @Headers('x-parent-user-id') parentUserId?: string) {
    return this.parentService.arLessons(studentId, parentUserId);
  }

  @Get('parent/children/:studentId/group-work')
  groupWork(@Param('studentId') studentId: string, @Headers('x-parent-user-id') parentUserId?: string) {
    return this.parentService.groupWork(studentId, parentUserId);
  }

  @Get('parent/children/:studentId/messages')
  messages(@Param('studentId') studentId: string, @Headers('x-parent-user-id') parentUserId?: string) {
    return this.parentService.messages(studentId, parentUserId);
  }

  @Get('parent/notices')
  notices() {
    return this.parentService.notices();
  }

  @Get('parent/children/:studentId/timetable')
  timetable(@Param('studentId') studentId: string, @Headers('x-parent-user-id') parentUserId?: string) {
    return this.parentService.timetable(studentId, parentUserId);
  }

  @Get('parent/children/:studentId/attendance')
  attendance(@Param('studentId') studentId: string, @Headers('x-parent-user-id') parentUserId?: string) {
    return this.parentService.attendance(studentId, parentUserId);
  }

  @Get('parent/children/:studentId/notes')
  notes(@Param('studentId') studentId: string, @Headers('x-parent-user-id') parentUserId?: string) {
    return this.parentService.notes(studentId, parentUserId);
  }

  @Get('parent/children/:studentId/reports')
  reports(@Param('studentId') studentId: string, @Headers('x-parent-user-id') parentUserId?: string) {
    return this.parentService.reports(studentId, parentUserId);
  }

  @Get('parent/children/:studentId/device-sync')
  deviceSync(@Param('studentId') studentId: string, @Headers('x-parent-user-id') parentUserId?: string) {
    return this.parentService.deviceSync(studentId, parentUserId);
  }

  @Post('student-app/events')
  ingestStudentAppEvents(@Body() body: StudentAppEventIngestDto) {
    return this.parentService.ingestStudentAppEvents(body);
  }
}

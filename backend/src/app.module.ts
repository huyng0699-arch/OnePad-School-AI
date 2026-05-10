import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { HealthModule } from "./modules/health/health.module";
import { BootstrapModule } from "./modules/bootstrap/bootstrap.module";
import { StudentEventsModule } from "./modules/student-events/student-events.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { DemoModule } from "./modules/demo/demo.module";
import { AiAuthoringModule } from "./modules/ai-authoring/ai-authoring.module";
import { AuthzModule } from "./modules/authz/authz.module";
import { LessonsModule } from "./modules/lessons/lessons.module";
import { StudentTrendsModule } from "./modules/student-trends/student-trends.module";
import { NightlyStudentSummaryJob } from "./jobs/nightly-student-summary.job";

@Module({
  imports: [
    PrismaModule,
    HealthModule,
    BootstrapModule,
    StudentEventsModule,
    ReportsModule,
    DemoModule,
    AiAuthoringModule,
    AuthzModule,
    LessonsModule,
    StudentTrendsModule,
  ],
  providers: [NightlyStudentSummaryJob],
})
export class AppModule {}

import { Module } from "@nestjs/common";
import { ReportsModule } from "../reports/reports.module";
import { StudentTrendsModule } from "../student-trends/student-trends.module";
import { StudentEventsController } from "./student-events.controller";
import { StudentEventsService } from "./student-events.service";

@Module({
  imports: [ReportsModule, StudentTrendsModule],
  controllers: [StudentEventsController],
  providers: [StudentEventsService],
  exports: [StudentEventsService],
})
export class StudentEventsModule {}

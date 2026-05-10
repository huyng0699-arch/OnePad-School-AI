import { Module } from "@nestjs/common";
import { ReportsModule } from "../reports/reports.module";
import { StudentEventsController } from "./student-events.controller";
import { StudentEventsService } from "./student-events.service";

@Module({
  imports: [ReportsModule],
  controllers: [StudentEventsController],
  providers: [StudentEventsService],
  exports: [StudentEventsService],
})
export class StudentEventsModule {}

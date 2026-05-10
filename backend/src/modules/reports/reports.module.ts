import { Module } from "@nestjs/common";
import { ReportsController } from "./reports.controller";
import { ReportsService } from "./reports.service";
import { RoleReportBuilder } from "./role-report.builder";
import { SafeSummaryEngine } from "./safe-summary.engine";
import { AuthzModule } from "../authz/authz.module";
import { ParentModule } from "../parent/parent.module";

@Module({
  imports: [AuthzModule, ParentModule],
  controllers: [ReportsController],
  providers: [ReportsService, SafeSummaryEngine, RoleReportBuilder],
  exports: [ReportsService],
})
export class ReportsModule {}

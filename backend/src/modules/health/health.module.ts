import { Module } from "@nestjs/common";
import { AuthzModule } from "../authz/authz.module";
import { HealthController } from "./health.controller";
import { HealthMonitoringService } from "./health-monitoring.service";

@Module({
  imports: [AuthzModule],
  controllers: [HealthController],
  providers: [HealthMonitoringService],
  exports: [HealthMonitoringService],
})
export class HealthModule {}

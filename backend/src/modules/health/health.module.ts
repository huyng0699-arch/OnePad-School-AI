import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller";
import { HealthMonitoringService } from "./health-monitoring.service";

@Module({
  controllers: [HealthController],
  providers: [HealthMonitoringService],
  exports: [HealthMonitoringService],
})
export class HealthModule {}

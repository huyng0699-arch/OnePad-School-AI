import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { StudentTrendsService } from "../modules/student-trends/student-trends.service";

@Injectable()
export class NightlyStudentSummaryJob implements OnModuleInit {
  private readonly logger = new Logger(NightlyStudentSummaryJob.name);

  constructor(private readonly trends: StudentTrendsService) {}

  onModuleInit() {
    setInterval(() => {
      const now = new Date();
      if (now.getHours() === 2 && now.getMinutes() < 10) {
        void this.runNightly().catch((error) => {
          this.logger.error(`nightly job failed: ${String(error)}`);
        });
      }
    }, 10 * 60 * 1000);
  }

  async runNightly() {
    const result = await this.trends.runNightlyForAllStudents();
    this.logger.log(`nightly student summary completed processed=${result.processed} reports=${result.reportsCreated} redAlerts=${result.redAlerts} errors=${result.errors.length}`);
    return result;
  }
}


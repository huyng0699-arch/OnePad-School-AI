import { Module } from "@nestjs/common";
import { AuthzModule } from "../authz/authz.module";
import { AiAuthoringModule } from "../ai-authoring/ai-authoring.module";
import { PrismaModule } from "../../prisma/prisma.module";
import { StudentTrendsController } from "./student-trends.controller";
import { StudentTrendsService } from "./student-trends.service";

@Module({
  imports: [PrismaModule, AuthzModule, AiAuthoringModule],
  controllers: [StudentTrendsController],
  providers: [StudentTrendsService],
  exports: [StudentTrendsService],
})
export class StudentTrendsModule {}

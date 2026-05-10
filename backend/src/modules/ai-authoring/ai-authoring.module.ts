import { Module } from "@nestjs/common";
import { AiAuthoringController } from "./ai-authoring.controller";
import { AiAuthoringProviderService } from "./ai-authoring-provider.service";
import { AiAuthoringService } from "./ai-authoring.service";
import { LessonStandardizerService } from "./lesson-standardizer.service";
import { PrismaModule } from "../../prisma/prisma.module";
import { AuthzModule } from "../authz/authz.module";
import { LessonsModule } from "../lessons/lessons.module";

@Module({
  imports: [PrismaModule, AuthzModule, LessonsModule],
  controllers: [AiAuthoringController],
  providers: [AiAuthoringService, AiAuthoringProviderService, LessonStandardizerService],
  exports: [AiAuthoringProviderService],
})
export class AiAuthoringModule {}

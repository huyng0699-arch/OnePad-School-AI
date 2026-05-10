import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AiAuthoringModule } from './modules/ai-authoring/ai-authoring.module';
import { AuthzModule } from './modules/authz/authz.module';
import { DemoActorMiddleware } from './modules/authz/demo-actor.middleware';
import { BootstrapModule } from './modules/bootstrap/bootstrap.module';
import { DemoModule } from './modules/demo/demo.module';
import { HealthModule } from './modules/health/health.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { ParentModule } from './modules/parent/parent.module';
import { ReportsModule } from './modules/reports/reports.module';
import { StudentEventsModule } from './modules/student-events/student-events.module';
import { StudentTrendsModule } from './modules/student-trends/student-trends.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    AuthzModule,
    BootstrapModule,
    DemoModule,
    HealthModule,
    LessonsModule,
    ReportsModule,
    StudentEventsModule,
    StudentTrendsModule,
    AiAuthoringModule,
    ParentModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(DemoActorMiddleware).forRoutes('*');
  }
}

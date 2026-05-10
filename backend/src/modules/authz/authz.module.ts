import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { DemoActorMiddleware } from "./demo-actor.middleware";
import { PermissionService } from "./permission.service";

@Module({
  imports: [PrismaModule],
  providers: [PermissionService],
  exports: [PermissionService],
})
export class AuthzModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(DemoActorMiddleware).forRoutes("*");
  }
}


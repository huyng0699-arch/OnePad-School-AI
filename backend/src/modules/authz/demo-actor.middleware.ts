import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { DemoActor, DemoRole } from "./authz.types";

const DEFAULT_ACTOR: DemoActor = {
  userId: "teacher_001",
  role: "subject_teacher",
};

const ROLE_SET = new Set<DemoRole>([
  "school_admin",
  "subject_teacher",
  "homeroom_teacher",
  "education_guardian",
  "parent",
  "student",
]);

@Injectable()
export class DemoActorMiddleware implements NestMiddleware {
  use(req: Request & { demoActor?: DemoActor }, _res: Response, next: NextFunction) {
    const userId = String(req.header("x-demo-user-id") || DEFAULT_ACTOR.userId);
    const roleCandidate = String(req.header("x-demo-role") || DEFAULT_ACTOR.role) as DemoRole;
    const role: DemoRole = ROLE_SET.has(roleCandidate) ? roleCandidate : DEFAULT_ACTOR.role;
    req.demoActor = { userId, role };
    next();
  }
}


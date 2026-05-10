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

function pickHeader(req: Request, names: string[], fallback: string) {
  for (const name of names) {
    const value = req.header(name);
    if (value && String(value).trim()) return String(value).trim();
  }
  return fallback;
}

@Injectable()
export class DemoActorMiddleware implements NestMiddleware {
  use(req: Request & { demoActor?: DemoActor }, _res: Response, next: NextFunction) {
    const userId = pickHeader(req, [
      "x-parent-user-id",
      "x-demo-user-id",
      "x-student-user-id",
      "x-teacher-user-id",
      "x-admin-user-id",
    ], DEFAULT_ACTOR.userId);

    const roleCandidate = pickHeader(req, [
      "x-parent-role",
      "x-demo-role",
      "x-student-role",
      "x-teacher-role",
      "x-admin-role",
    ], DEFAULT_ACTOR.role) as DemoRole;

    const role: DemoRole = ROLE_SET.has(roleCandidate) ? roleCandidate : DEFAULT_ACTOR.role;
    req.demoActor = { userId, role };
    next();
  }
}

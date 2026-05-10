import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { DemoActor, DemoRole } from "./authz.types";

@Injectable()
export class PermissionService {
  constructor(private readonly prisma: PrismaService) {}

  getDemoActor(req: any): DemoActor {
    return req?.demoActor || { userId: "teacher_001", role: "subject_teacher" };
  }

  assertRole(actor: DemoActor, roles: DemoRole[]) {
    if (!roles.includes(actor.role)) throw new ForbiddenException("role_not_allowed");
  }

  async assertCanViewClass(actor: DemoActor, classId: string) {
    if (actor.role === "school_admin") return true;
    if (actor.role === "subject_teacher" || actor.role === "homeroom_teacher") {
      const access = await this.prisma.teacherClassAccess.findFirst({
        where: { teacherId: actor.userId, classId },
      });
      if (access) return true;
    }
    throw new ForbiddenException("class_scope_denied");
  }

  async assertCanViewStudent(actor: DemoActor, studentId: string, _scope = "safe") {
    if (actor.role === "school_admin") return true;
    if (actor.role === "student" && actor.userId === studentId) return true;
    if (actor.role === "parent") return this.assertCanViewParentChild(actor, studentId);
    if (actor.role === "education_guardian") return this.assertCanViewGuardianContext(actor, studentId);
    if (actor.role === "subject_teacher" || actor.role === "homeroom_teacher") {
      const student = await this.prisma.student.findUnique({ where: { id: studentId } });
      if (!student) throw new ForbiddenException("student_not_found");
      return this.assertCanViewClass(actor, student.classId);
    }
    throw new ForbiddenException("student_scope_denied");
  }

  async assertCanViewGuardianContext(actor: DemoActor, studentId: string) {
    this.assertRole(actor, ["education_guardian", "school_admin"]);
    if (actor.role === "school_admin") return true;
    const consent = await this.prisma.educationGuardianConsent.findFirst({
      where: { guardianTeacherId: actor.userId, studentId, active: true },
    });
    if (!consent) throw new ForbiddenException("guardian_consent_required");
    return true;
  }

  assertCanManageUsers(actor: DemoActor) {
    this.assertRole(actor, ["school_admin"]);
  }

  assertCanManageRolePolicy(actor: DemoActor) {
    this.assertRole(actor, ["school_admin"]);
  }

  assertCanManageAiPolicy(actor: DemoActor) {
    this.assertRole(actor, ["school_admin"]);
  }

  async assertCanAuthorLesson(actor: DemoActor, classId: string, _subjectId: string) {
    this.assertRole(actor, ["school_admin", "subject_teacher", "homeroom_teacher"]);
    if (actor.role === "school_admin") return true;
    return this.assertCanViewClass(actor, classId);
  }

  async assertCanPublishLesson(actor: DemoActor, classId: string) {
    return this.assertCanAuthorLesson(actor, classId, "any");
  }

  async assertCanViewParentChild(actor: DemoActor, studentId: string) {
    this.assertRole(actor, ["parent", "school_admin"]);
    if (actor.role === "school_admin") return true;
    const link = await this.prisma.guardianStudentLink.findFirst({
      where: { guardianId: actor.userId, studentId },
    });
    if (!link) throw new ForbiddenException("parent_child_scope_denied");
    return true;
  }

  async writeAccessAuditLog(
    actor: DemoActor,
    action: string,
    resourceType: string,
    resourceId: string,
    reason: string,
  ) {
    await this.prisma.accessAuditLog.create({
      data: {
        actorUserId: actor.userId,
        actorRole: actor.role,
        action,
        resourceType,
        resourceId,
        reason,
      },
    });
  }
}


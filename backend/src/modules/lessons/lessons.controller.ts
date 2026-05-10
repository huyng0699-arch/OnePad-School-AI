import { Controller, Get, Param, Query, Req } from "@nestjs/common";
import { LessonsService } from "./lessons.service";
import { PermissionService } from "../authz/permission.service";

@Controller("v1")
export class LessonsController {
  constructor(
    private readonly lessons: LessonsService,
    private readonly authz: PermissionService,
  ) {}

  @Get("lessons/:lessonId/export-json")
  exportJson(@Param("lessonId") lessonId: string) {
    return this.lessons.exportLessonJson(lessonId);
  }

  @Get("student/lessons")
  async listForStudent(@Req() req: any, @Query("classId") classId: string) {
    const actor = this.authz.getDemoActor(req);
    await this.authz.assertCanViewClass(actor, classId);
    return this.lessons.listStudentLessons(classId);
  }

  @Get("student/lessons/:lessonId")
  getStudentLesson(@Param("lessonId") lessonId: string) {
    return this.lessons.getLessonForStudent(lessonId);
  }

  @Get("admin/published-lessons")
  async listForAdmin(@Req() req: any) {
    const actor = this.authz.getDemoActor(req);
    this.authz.assertRole(actor, ["school_admin"]);
    return this.lessons.listPublishedForAdmin();
  }

  @Get("teacher/published-lessons")
  async listForTeacher(@Req() req: any, @Query("teacherId") teacherId?: string) {
    const actor = this.authz.getDemoActor(req);
    const effectiveTeacherId = teacherId || actor.userId;
    if (actor.role !== "school_admin" && actor.userId !== effectiveTeacherId) {
      return { ok: false, error: "teacher_scope_denied" };
    }
    return this.lessons.listPublishedForTeacher(effectiveTeacherId);
  }
}


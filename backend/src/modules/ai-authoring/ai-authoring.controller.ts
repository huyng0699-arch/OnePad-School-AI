import { Body, Controller, Get, Param, Post, Query, Req } from "@nestjs/common";
import { AiAuthoringService } from "./ai-authoring.service";
import { CreateAuthoringProjectDto } from "./dto/create-authoring-project.dto";
import { PublishLessonDto } from "./dto/publish-lesson.dto";
import { SaveAiKeyDto } from "./dto/save-ai-key.dto";
import { StandardizeLessonDto } from "./dto/standardize-lesson.dto";
import { TeacherAiAssistDto } from "./dto/teacher-ai-assist.dto";
import { PermissionService } from "../authz/permission.service";

@Controller("v1")
export class AiAuthoringController {
  constructor(
    private readonly authoring: AiAuthoringService,
    private readonly authz: PermissionService,
  ) {}

  @Post("ai-authoring/keys/school")
  saveSchoolKey(@Body() body: SaveAiKeyDto) {
    if (!body.schoolId) return { ok: false, error: "schoolId is required." };
    return this.authoring.saveSchoolKey(body.schoolId, body.apiKey, body.provider);
  }

  @Post("ai-authoring/keys/teacher")
  saveTeacherKey(@Body() body: SaveAiKeyDto) {
    if (!body.teacherId) return { ok: false, error: "teacherId is required." };
    return this.authoring.saveTeacherKey(body.teacherId, body.apiKey, body.provider);
  }

  @Get("ai-authoring/keys/status")
  keyStatus(@Query("teacherId") teacherId: string, @Query("schoolId") schoolId: string) {
    if (!teacherId || !schoolId) return { ok: false, error: "teacherId and schoolId are required." };
    return this.authoring.keyStatus(teacherId, schoolId);
  }

  @Post("ai-authoring/projects")
  createProject(@Body() body: CreateAuthoringProjectDto) {
    return this.authoring.createProject(body);
  }

  @Post("ai-authoring/projects/:projectId/standardize")
  standardizeProject(@Param("projectId") projectId: string, @Body() body: StandardizeLessonDto) {
    return this.authoring.standardizeProject(projectId, body);
  }

  @Get("ai-authoring/projects/:projectId")
  getProject(@Param("projectId") projectId: string) {
    return this.authoring.getProject(projectId);
  }

  @Get("ai-authoring/projects")
  listProjects(@Query("teacherId") teacherId: string) {
    if (!teacherId) return { ok: false, error: "teacherId is required." };
    return this.authoring.listProjects(teacherId);
  }

  @Post("ai-authoring/projects/:projectId/publish")
  publish(@Req() req: any, @Param("projectId") projectId: string, @Body() body: PublishLessonDto) {
    const actor = this.authz.getDemoActor(req);
    return this.authoring.publish(actor, projectId, body);
  }

  @Post("ai-authoring/assistant")
  teacherAssist(@Body() body: TeacherAiAssistDto) {
    return this.authoring.teacherAssist(body);
  }

  @Get("lessons/published")
  listPublished(@Query("classId") classId?: string) {
    return this.authoring.listPublished(classId);
  }

  @Get("admin/ai-authoring-usage")
  usageSummary() {
    return this.authoring.getUsageSummary();
  }
}

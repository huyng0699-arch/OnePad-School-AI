import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateAuthoringProjectDto } from "./dto/create-authoring-project.dto";
import { PublishLessonDto } from "./dto/publish-lesson.dto";
import { StandardizeLessonDto } from "./dto/standardize-lesson.dto";
import { AiAuthoringProviderService } from "./ai-authoring-provider.service";
import { LessonStandardizerService } from "./lesson-standardizer.service";
import { tryParseStructuredLesson } from "./structured-lesson.validator";
import { PermissionService } from "../authz/permission.service";
import { LessonsService } from "../lessons/lessons.service";
import { DemoActor } from "../authz/authz.types";
import { TeacherAiAssistDto } from "./dto/teacher-ai-assist.dto";

@Injectable()
export class AiAuthoringService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly provider: AiAuthoringProviderService,
    private readonly standardizer: LessonStandardizerService,
    private readonly authz: PermissionService,
    private readonly lessons: LessonsService,
  ) {}

  maskKey(key: string) {
    const head = key.slice(0, 4);
    const tail = key.slice(-4);
    return `${head}...${tail}`;
  }

  makeKeyId(ownerType: "school" | "teacher") {
    return `${ownerType}_gemini_${Date.now().toString(36)}`;
  }

  async saveSchoolKey(schoolId: string, apiKey: string, provider = "gemini") {
    const keyId = this.makeKeyId("school");
    await this.prisma.aiKeyCredential.create({
      data: {
        ownerType: "school",
        ownerId: schoolId,
        provider,
        keyId,
        encryptedApiKey: this.provider.encryptKey(apiKey),
        maskedKey: this.maskKey(apiKey),
        status: "active",
      },
    });
    return { ok: true, keyId, maskedKey: this.maskKey(apiKey) };
  }

  async saveTeacherKey(teacherId: string, apiKey: string, provider = "gemini") {
    const keyId = this.makeKeyId("teacher");
    await this.prisma.aiKeyCredential.create({
      data: {
        ownerType: "teacher",
        ownerId: teacherId,
        provider,
        keyId,
        encryptedApiKey: this.provider.encryptKey(apiKey),
        maskedKey: this.maskKey(apiKey),
        status: "active",
      },
    });
    return { ok: true, keyId, maskedKey: this.maskKey(apiKey) };
  }

  async keyStatus(teacherId: string, schoolId: string) {
    const schoolKey = await this.prisma.aiKeyCredential.findFirst({ where: { ownerType: "school", ownerId: schoolId, status: "active" }, orderBy: { updatedAt: "desc" } });
    const personalKey = await this.prisma.aiKeyCredential.findFirst({ where: { ownerType: "teacher", ownerId: teacherId, status: "active" }, orderBy: { updatedAt: "desc" } });

    return {
      ok: true,
      schoolKey: schoolKey
        ? { configured: true, keyId: schoolKey.keyId, maskedKey: schoolKey.maskedKey, lastUsedAt: schoolKey.lastUsedAt, requestCount: schoolKey.requestCount, status: schoolKey.status }
        : { configured: false },
      personalKey: personalKey
        ? { configured: true, keyId: personalKey.keyId, maskedKey: personalKey.maskedKey, lastUsedAt: personalKey.lastUsedAt, requestCount: personalKey.requestCount, status: personalKey.status }
        : { configured: false },
    };
  }

  async createProject(dto: CreateAuthoringProjectDto) {
    const created = await this.prisma.authoringProject.create({
      data: {
        teacherId: dto.teacherId,
        schoolId: dto.schoolId,
        title: dto.title,
        subject: dto.subject,
        grade: dto.grade,
        language: dto.language,
        rawInput: dto.rawInput,
        status: "draft",
        aiKeyScope: dto.aiKeyScope,
      },
    });
    return { ok: true, project: created };
  }

  async standardizeProject(projectId: string, dto: StandardizeLessonDto) {
    const project = await this.prisma.authoringProject.findUnique({ where: { id: projectId } });
    if (!project) return { ok: false, error: "Authoring project not found." };

    const modelId = dto.modelId || process.env.AUTHORING_DEFAULT_GEMINI_MODEL || "gemini-2.5-flash";
    let structuredLesson: any;
    let providerKeyId: string | null = null;
    let providerStatus: "success" | "error" = "success";
    let errorMessage: string | null = null;
    let latencyMs: number | null = null;
    let tokenEstimate = 0;

    if (dto.structuredLessonOverride && typeof dto.structuredLessonOverride === "object") {
      const override = dto.structuredLessonOverride as Record<string, unknown>;
      const overrideText = JSON.stringify(override);
      const parsed = tryParseStructuredLesson(overrideText);
      if (!parsed.ok) {
        return { ok: false, error: parsed.error };
      }
      structuredLesson = parsed.lesson;
      providerKeyId = "teacher_studio_override";
    } else if (project.aiKeyScope === "disabled") {
      structuredLesson = this.standardizer.buildFallbackLesson({
        projectId,
        title: project.title,
        subject: project.subject,
        grade: project.grade,
        language: project.language as "en" | "vi" | "bilingual",
        rawInput: project.rawInput,
      });
    } else {
      const key = await this.provider.resolveKey({ schoolId: project.schoolId, teacherId: project.teacherId, scope: project.aiKeyScope as any });
      if (!key && !process.env.AUTHORING_SCHOOL_GEMINI_API_KEY) return { ok: false, error: "No eligible AI key configured for selected scope." };
      providerKeyId = key?.keyId ?? "env_school_key";

      const prompt = this.standardizer.buildPrompt({
        title: project.title,
        subject: project.subject,
        grade: project.grade,
        language: project.language as "en" | "vi" | "bilingual",
        rawLessonText: project.rawInput,
        teacherInstructions: dto.teacherInstructions,
      });

      const apiKey = key ? this.provider.decryptKey(key.encryptedApiKey) : process.env.AUTHORING_SCHOOL_GEMINI_API_KEY || "";
      if (!apiKey) return { ok: false, error: "Stored AI key cannot be decrypted in current environment." };

      const aiResult = await this.provider.generateStructuredLesson({ apiKey, modelId, prompt });
      latencyMs = aiResult.latencyMs;
      tokenEstimate = aiResult.tokenEstimate;
      if (!aiResult.ok) {
        providerStatus = "error";
        errorMessage = aiResult.error || "authoring_provider_error";
        return { ok: false, error: errorMessage };
      }

      const parsed = tryParseStructuredLesson(aiResult.text);
      if (!parsed.ok) {
        providerStatus = "error";
        errorMessage = parsed.error;
        return { ok: false, error: parsed.error };
      }
      structuredLesson = parsed.lesson;

      if (key) {
        await this.prisma.aiKeyCredential.update({
          where: { id: key.id },
          data: {
            requestCount: { increment: 1 },
            tokenEstimate: { increment: tokenEstimate },
            lastUsedAt: new Date(),
          },
        });
      }
    }

    const lessonId = structuredLesson.id || `lesson_${project.id.slice(0, 8)}`;

    await this.prisma.structuredLessonRecord.create({
      data: {
        authoringProjectId: project.id,
        lessonId,
        title: structuredLesson.title,
        subject: structuredLesson.subject,
        grade: structuredLesson.grade,
        language: structuredLesson.language,
        structuredJson: JSON.stringify(structuredLesson),
        teacherGuideJson: JSON.stringify(structuredLesson.teacherGuide ?? null),
        quizSeedJson: JSON.stringify(structuredLesson.quizSeeds ?? []),
        rubricJson: JSON.stringify(structuredLesson.teacherGuide?.assessmentRubric ?? []),
        adaptiveVersionsJson: JSON.stringify(structuredLesson.adaptiveVersions ?? {}),
      },
    });

    await this.prisma.authoringProject.update({ where: { id: project.id }, data: { status: "standardized" } });

    await this.prisma.aiAuthoringUsage.create({
      data: {
        projectId: project.id,
        teacherId: project.teacherId,
        schoolId: project.schoolId,
        provider: "gemini",
        keyScope: project.aiKeyScope,
        keyId: providerKeyId,
        modelId,
        action: "standardize_lesson",
        status: providerStatus,
        latencyMs,
        tokenEstimate,
        errorMessage,
      },
    });

    return {
      ok: true,
      projectId: project.id,
      structuredLesson,
      teacherGuide: structuredLesson.teacherGuide,
      quizSeeds: structuredLesson.quizSeeds,
    };
  }

  async publish(actor: DemoActor, projectId: string, dto: PublishLessonDto) {
    const project = await this.prisma.authoringProject.findUnique({ where: { id: projectId } });
    if (!project) return { ok: false, error: "Authoring project not found." };

    const latest = await this.prisma.structuredLessonRecord.findFirst({ where: { authoringProjectId: projectId }, orderBy: { createdAt: "desc" } });
    if (!latest) return { ok: false, error: "No structured lesson found. Standardize before publish." };

    const targetClassId = dto.classId || "class_8a";
    await this.authz.assertCanPublishLesson(actor, targetClassId);

    const published = await this.prisma.publishedLesson.create({
      data: {
        lessonId: latest.lessonId,
        structuredLessonId: latest.id,
        classId: targetClassId,
        subject: latest.subject,
        grade: latest.grade,
        publishedByTeacherId: project.teacherId,
        status: "active",
      },
    });

    const structuredLesson = JSON.parse(latest.structuredJson);
    this.lessons.writePublishedLessonFile(latest.lessonId, structuredLesson);

    if (dto.dueDate || dto.requireQuiz || dto.groupWorkEnabled) {
      await this.prisma.assignment.create({
        data: {
          id: `asg_${Date.now().toString(36)}`,
          classId: targetClassId,
          lessonId: latest.lessonId,
          title: `${latest.title} Assignment`,
          status: "assigned",
          dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        },
      });
    }

    await this.authz.writeAccessAuditLog(actor, "lesson_publish", "StructuredLesson", latest.lessonId, `published_to_${targetClassId}`);

    await this.prisma.authoringProject.update({ where: { id: projectId }, data: { status: "published" } });

    return {
      ok: true,
      publishedLessonId: published.id,
      lessonId: latest.lessonId,
      fileUrl: `/v1/lessons/${latest.lessonId}/export-json`,
      studentApiUrl: `/v1/student/lessons/${latest.lessonId}`,
    };
  }

  async teacherAssist(dto: TeacherAiAssistDto) {
    const modelId = dto.modelId || process.env.AUTHORING_DEFAULT_GEMINI_MODEL || "gemini-2.5-flash";
    if ((dto.aiProvider || "school_default") === "local_cactus") {
      return {
        ok: true,
        text: "Local / Cactus mode selected. Use student-side local AI runtime for on-device assistance.",
        raw: { provider: "local_cactus" },
      };
    }

    const scope = (dto.aiProvider || "school_default") === "personal_gemini" ? "personal_key" : "school_key";
    const key = await this.provider.resolveKey({
      schoolId: dto.schoolId,
      teacherId: dto.teacherId,
      scope: scope as "school_key" | "personal_key" | "disabled",
    });
    const apiKey = key ? this.provider.decryptKey(key.encryptedApiKey) : process.env.AUTHORING_SCHOOL_GEMINI_API_KEY || "";
    if (!apiKey) return { ok: false, error: "AI API key is not configured." };

    const result = await this.provider.generateText({ apiKey, modelId, prompt: dto.prompt });
    if (!result.ok) return { ok: false, error: result.error || "authoring_provider_error" };
    return { ok: true, text: result.text, raw: result.raw };
  }

  async getProject(projectId: string) {
    const project = await this.prisma.authoringProject.findUnique({ where: { id: projectId } });
    if (!project) return { ok: false, error: "Authoring project not found." };
    const lesson = await this.prisma.structuredLessonRecord.findFirst({ where: { authoringProjectId: projectId }, orderBy: { createdAt: "desc" } });
    return {
      ok: true,
      project,
      lesson: lesson ? { ...lesson, structuredJson: JSON.parse(lesson.structuredJson) } : null,
    };
  }

  async listProjects(teacherId: string) {
    const projects = await this.prisma.authoringProject.findMany({ where: { teacherId }, orderBy: { createdAt: "desc" }, take: 50 });
    return { ok: true, projects };
  }

  async listPublished(classId?: string) {
    const published = await this.prisma.publishedLesson.findMany({ where: classId ? { classId } : {}, orderBy: { createdAt: "desc" }, take: 50 });
    const lessonIds = published.map((p) => p.structuredLessonId);
    const records = await this.prisma.structuredLessonRecord.findMany({ where: { id: { in: lessonIds } } });
    const map = new Map(records.map((r) => [r.id, r]));

    return {
      ok: true,
      lessons: published.map((p) => {
        const record = map.get(p.structuredLessonId);
        return {
          publishedLessonId: p.id,
          classId: p.classId,
          lessonId: p.lessonId,
          structuredLesson: record ? JSON.parse(record.structuredJson) : null,
        };
      }),
    };
  }

  async getUsageSummary() {
    const usage = await this.prisma.aiAuthoringUsage.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
    return { ok: true, usage };
  }
}

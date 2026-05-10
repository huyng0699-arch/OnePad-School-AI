import { Injectable } from "@nestjs/common";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) {}

  private publishedDir() {
    const dir = join(process.cwd(), "storage", "published-lessons");
    mkdirSync(dir, { recursive: true });
    return dir;
  }

  writePublishedLessonFile(lessonId: string, lesson: unknown) {
    const filePath = join(this.publishedDir(), `${lessonId}.json`);
    writeFileSync(filePath, JSON.stringify(lesson, null, 2), "utf-8");
    this.upsertManifest(lessonId, lesson as Record<string, unknown>);
    return filePath;
  }

  private upsertManifest(lessonId: string, lesson: Record<string, unknown>) {
    const indexPath = join(this.publishedDir(), "index.json");
    let index: any[] = [];
    try {
      index = JSON.parse(readFileSync(indexPath, "utf-8"));
      if (!Array.isArray(index)) index = [];
    } catch {
      index = [];
    }

    const next = {
      lessonId,
      title: String(lesson?.title || lessonId),
      subject: String(lesson?.subject || ""),
      grade: String(lesson?.grade || ""),
      language: String(lesson?.language || "en"),
      pageCount: Array.isArray(lesson?.pages) ? lesson.pages.length : 0,
      exportUrl: `/v1/lessons/${lessonId}/export-json`,
      updatedAt: new Date().toISOString(),
    };

    const filtered = index.filter((x) => x.lessonId !== lessonId);
    filtered.unshift(next);
    writeFileSync(indexPath, JSON.stringify(filtered, null, 2), "utf-8");
  }

  readPublishedLessonFile(lessonId: string) {
    try {
      const filePath = join(this.publishedDir(), `${lessonId}.json`);
      return JSON.parse(readFileSync(filePath, "utf-8"));
    } catch {
      return null;
    }
  }

  async getLessonForStudent(lessonId: string) {
    const fromFile = this.readPublishedLessonFile(lessonId);
    if (fromFile) return { ok: true, lesson: fromFile };
    const record = await this.prisma.structuredLessonRecord.findFirst({ where: { lessonId } });
    if (!record) return { ok: false, error: "lesson_not_found" };
    return { ok: true, lesson: JSON.parse(record.structuredJson) };
  }

  async listStudentLessons(classId: string) {
    const published = await this.prisma.publishedLesson.findMany({
      where: { classId, status: "active" },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return {
      ok: true,
      lessons: published.map((p) => ({
        publishedLessonId: p.id,
        lessonId: p.lessonId,
        classId: p.classId,
        publishedAt: p.createdAt,
        exportUrl: `/v1/lessons/${p.lessonId}/export-json`,
      })),
    };
  }

  async exportLessonJson(lessonId: string) {
    const lesson = await this.getLessonForStudent(lessonId);
    if (!lesson.ok) return lesson;
    return { ok: true, lessonId, structuredLesson: lesson.lesson };
  }

  async listPublishedForAdmin() {
    const lessons = await this.prisma.publishedLesson.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
    return { ok: true, lessons };
  }

  async listPublishedForTeacher(teacherId: string) {
    const lessons = await this.prisma.publishedLesson.findMany({
      where: { publishedByTeacherId: teacherId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return { ok: true, lessons };
  }
}

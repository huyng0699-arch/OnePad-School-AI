import { Controller, Get, Query, Req } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Controller("v1/student")
export class BootstrapController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("bootstrap")
  async getBootstrap(@Req() req: any, @Query("studentId") studentId?: string) {
    const effectiveStudentId =
      req?.demoActor?.role === "student"
        ? req.demoActor.userId
        : studentId || "stu_001";
    const student = await this.prisma.student.findUnique({ where: { id: effectiveStudentId } });
    const profile = student
      ? {
          studentId: student.id,
          name: student.fullName,
          classId: student.classId,
          schoolId: student.schoolId,
        }
      : {
          studentId: "stu_001",
          name: "Minh Nguyen",
          classId: "class_8a",
          schoolId: "school_001",
        };

    return {
      ok: true,
      profile,
      localAiPolicy: {
        localFirst: true,
        modelId: "gemma-4-e2b-it",
        quantization: "int4",
      },
      cloudFallbackPolicy: {
        enabled: true,
        provider: "gemini",
      },
      featureFlags: {
        studentEvents: true,
        teacherReports: true,
        parentReports: true,
        adminOverview: true,
      },
    };
  }
}

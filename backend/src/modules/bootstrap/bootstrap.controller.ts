import { Controller, Get } from "@nestjs/common";

@Controller("v1/student")
export class BootstrapController {
  @Get("bootstrap")
  getBootstrap() {
    return {
      ok: true,
      profile: {
        studentId: "stu_001",
        name: "Minh Nguyen",
        classId: "class_8a",
        schoolId: "school_001",
      },
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

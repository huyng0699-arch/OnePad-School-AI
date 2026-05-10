import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AiAuthoringProviderService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveKey(args: { schoolId: string; teacherId: string; scope: "school_key" | "personal_key" | "disabled" }) {
    if (args.scope === "disabled") return null;

    if (args.scope === "personal_key") {
      const key = await this.prisma.aiKeyCredential.findFirst({ where: { ownerType: "teacher", ownerId: args.teacherId, status: "active" }, orderBy: { updatedAt: "desc" } });
      if (key) return key;
    }

    if (args.scope === "school_key" || args.scope === "personal_key") {
      const key = await this.prisma.aiKeyCredential.findFirst({ where: { ownerType: "school", ownerId: args.schoolId, status: "active" }, orderBy: { updatedAt: "desc" } });
      return key;
    }

    return null;
  }

  decryptKey(encryptedApiKey: string): string {
    const payload = Buffer.from(encryptedApiKey, "base64").toString("utf8");
    const [secret, apiKey] = payload.split("::", 2);
    const expected = process.env.AUTHORING_KEY_ENCRYPTION_SECRET || "dev_secret_change_me";
    if (secret !== expected) return "";
    return apiKey;
  }

  encryptKey(rawApiKey: string): string {
    // Development-only reversible storage. Production should use proper encryption.
    const secret = process.env.AUTHORING_KEY_ENCRYPTION_SECRET || "dev_secret_change_me";
    return Buffer.from(`${secret}::${rawApiKey}`, "utf8").toString("base64");
  }

  async generateStructuredLesson(args: { apiKey: string; modelId: string; prompt: string }) {
    const startedAt = Date.now();
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${args.modelId}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": args.apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: args.prompt }],
          },
        ],
      }),
    });

    const json = await response.json().catch(() => ({} as any));
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined;

    return {
      ok: response.ok && !!text,
      text: text || "",
      latencyMs: Date.now() - startedAt,
      error: response.ok ? null : (json?.error?.message || "authoring_provider_error"),
      tokenEstimate: Math.ceil(args.prompt.length / 4),
    };
  }

  async generateText(args: { apiKey: string; modelId: string; prompt: string }) {
    const startedAt = Date.now();
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${args.modelId}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": args.apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: args.prompt }],
          },
        ],
      }),
    });

    const json = await response.json().catch(() => ({} as any));
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined;
    return {
      ok: response.ok && !!text,
      text: text || "",
      raw: json,
      latencyMs: Date.now() - startedAt,
      error: response.ok ? null : (json?.error?.message || "authoring_provider_error"),
      tokenEstimate: Math.ceil(args.prompt.length / 4),
    };
  }
}

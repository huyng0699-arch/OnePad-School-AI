import { Injectable } from "@nestjs/common";
import { StudentEvent } from "@prisma/client";
import { SafeSummaryEngine } from "./safe-summary.engine";

function parseMetadata(metadataJson: string | null): Record<string, unknown> {
  if (!metadataJson) return {};
  try {
    return JSON.parse(metadataJson) as Record<string, unknown>;
  } catch {
    return {};
  }
}

@Injectable()
export class RoleReportBuilder {
  constructor(private readonly safeSummary: SafeSummaryEngine) {}

  buildTeacherReport(events: StudentEvent[]) {
    const recent = events.slice(0, 10);
    const summaries = recent.map((event) =>
      this.safeSummary.summarize({
        type: event.type,
        source: event.source,
        safeSummary: event.safeSummary,
        severity: event.severity,
        metadata: parseMetadata(event.metadataJson),
      }),
    );

    const learningSupport = summaries.find((summary) => summary.teacherSummary.includes("review"))?.teacherSummary
      ?? "No major learning support issue detected in recent events.";

    const wellbeing = summaries.find((summary) =>
      summary.teacherSummary.includes("uncertainty")
      || summary.teacherSummary.includes("frustration")
      || summary.teacherSummary.includes("requested help")
    )?.teacherSummary ?? "No high-risk wellbeing signal is shown. No diagnosis is made.";

    return {
      academicSummary: "Student learning activity has been recorded through OnePad events.",
      learningSupportSummary: learningSupport,
      wellbeingSummary: wellbeing,
      groupWorkSummary: summaries.find((summary) => summary.teacherSummary.includes("group work"))?.teacherSummary ?? "No recent group work issue detected.",
      recommendedTeacherAction: summaries.find((summary) => summary.recommendedTeacherAction !== "No immediate action required.")?.recommendedTeacherAction ?? "Continue normal learning support.",
      recentEvents: recent.map((event) => ({
        eventId: event.id,
        type: event.type,
        source: event.source,
        severity: event.severity,
        safeSummary: event.safeSummary,
        createdAt: event.createdAt.toISOString(),
      })),
    };
  }

  buildParentReport(events: StudentEvent[]) {
    const recent = events.slice(0, 10);
    const summaries = recent.map((event) =>
      this.safeSummary.summarize({
        type: event.type,
        source: event.source,
        safeSummary: event.safeSummary,
        severity: event.severity,
        metadata: parseMetadata(event.metadataJson),
      }),
    );

    return {
      todayLearningSummary: "Your child completed learning activities recorded by OnePad today.",
      progressSummary: summaries.find((summary) => summary.parentSummary.includes("review"))?.parentSummary ?? "Your child is continuing regular learning progress.",
      mentalAndCharacterGrowthSummary: summaries.find((summary) =>
        summary.parentSummary.includes("encouragement")
        || summary.parentSummary.includes("patient")
        || summary.parentSummary.includes("support")
      )?.parentSummary ?? "No sensitive concern is shown in the parent report.",
      recommendedParentAction: summaries.find((summary) => summary.recommendedParentAction !== "No immediate action required.")?.recommendedParentAction ?? "Ask your child what they learned today.",
      teacherNote: "This report excludes private raw chat, internal hidden scores, and internal severity labels.",
    };
  }
}

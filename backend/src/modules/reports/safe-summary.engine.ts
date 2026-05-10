import { Injectable } from "@nestjs/common";

export type SafeSummaryInput = {
  type: string;
  source: string;
  safeSummary: string;
  severity?: string | null;
  metadata?: Record<string, unknown>;
};

export type SafeSummaryOutput = {
  teacherSummary: string;
  parentSummary: string;
  adminSummary: string;
  recommendedTeacherAction: string;
  recommendedParentAction: string;
};

@Injectable()
export class SafeSummaryEngine {
  summarize(event: SafeSummaryInput): SafeSummaryOutput {
    if (event.type === "quiz_completed") {
      const accuracy = Number(event.metadata?.["accuracy"] ?? 1);
      if (accuracy < 0.6) {
        return {
          teacherSummary: "Student may need a short review on the current concept. Recent quiz accuracy was below the expected level.",
          parentSummary: "Your child may benefit from a calm review session. Ask them what they already understand before correcting mistakes.",
          adminSummary: "Learning support signal recorded.",
          recommendedTeacherAction: "Offer a focused concept review.",
          recommendedParentAction: "Use a calm review routine at home.",
        };
      }
    }

    if (event.type === "low_confidence_signal") {
      return {
        teacherSummary: "Student showed uncertainty during learning. A short check-in may help.",
        parentSummary: "Your child may need encouragement and a slower review pace today.",
        adminSummary: "Low confidence support signal recorded.",
        recommendedTeacherAction: "Check whether the student needs learning support.",
        recommendedParentAction: "Encourage the child to explain what they already understand.",
      };
    }

    if (event.type === "frustration_signal") {
      return {
        teacherSummary: "Student may be experiencing learning frustration. Offer a calm explanation or lower the difficulty.",
        parentSummary: "Your child may benefit from a patient review pace today.",
        adminSummary: "Frustration support signal recorded.",
        recommendedTeacherAction: "Lower difficulty temporarily and explain step by step.",
        recommendedParentAction: "Avoid pressure and support a calm study session.",
      };
    }

    if (event.type === "support_requested" || event.type === "teacher_help_requested") {
      return {
        teacherSummary: "Student requested help. Please follow up when available.",
        parentSummary: "Your child requested learning support at school.",
        adminSummary: "Support request recorded.",
        recommendedTeacherAction: "Follow up with the student.",
        recommendedParentAction: "Ask whether the child received support at school.",
      };
    }

    if (event.type === "group_work_activity" || event.type === "collaboration_activity") {
      return {
        teacherSummary: "Student participated in group work activity.",
        parentSummary: "Your child participated in a collaborative learning activity.",
        adminSummary: "Group work activity recorded.",
        recommendedTeacherAction: "Review group progress if needed.",
        recommendedParentAction: "Ask about the group task.",
      };
    }

    if (event.type === "assignment_submitted") {
      return {
        teacherSummary: "Student submitted an assignment.",
        parentSummary: "Your child completed a school task.",
        adminSummary: "Assignment submission recorded.",
        recommendedTeacherAction: "Review the assignment when available.",
        recommendedParentAction: "Acknowledge the completed task.",
      };
    }

    if (event.type === "local_ai_used") {
      return {
        teacherSummary: "Student used on-device AI support for learning.",
        parentSummary: "Your child used private on-device AI learning support.",
        adminSummary: "Local AI used on device: Gemma 4 E2B int4.",
        recommendedTeacherAction: "Review learning activity if needed.",
        recommendedParentAction: "No action needed.",
      };
    }

    if (event.type === "cloud_ai_used") {
      return {
        teacherSummary: "Student used cloud AI support for learning.",
        parentSummary: "Your child used AI learning support.",
        adminSummary: "Cloud AI fallback used.",
        recommendedTeacherAction: "No immediate action required.",
        recommendedParentAction: "No action needed.",
      };
    }

    return {
      teacherSummary: event.safeSummary,
      parentSummary: event.safeSummary,
      adminSummary: event.safeSummary,
      recommendedTeacherAction: "No immediate action required.",
      recommendedParentAction: "No immediate action required.",
    };
  }
}

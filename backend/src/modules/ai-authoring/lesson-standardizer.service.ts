import { Injectable } from "@nestjs/common";

@Injectable()
export class LessonStandardizerService {
  buildPrompt(args: {
    title: string;
    subject: string;
    grade: string;
    language: "en" | "vi" | "bilingual";
    rawLessonText: string;
    teacherInstructions?: string;
  }): string {
    const instruction = [
      "You are OnePad Lesson Authoring AI.",
      "Convert the teacher raw lesson into a valid StructuredLesson JSON object for a student learning app.",
      "The Student App consumes: lesson -> pages -> blocks -> aiText",
      "Rules:",
      "- Return JSON only.",
      "- No markdown.",
      "- No code fences.",
      "- Do not invent facts outside the teacher input unless clearly marked as explanation.",
      "- Keep language consistent with requested language.",
      "- UI is English, but lesson content may be English, Vietnamese, or bilingual.",
      "- Make the lesson age-appropriate for the grade.",
      "- Split long content into pages.",
      "- Each page must have aiText.",
      "- Add key concepts, examples, check-your-understanding blocks.",
      "- Add quizSeeds with multiple_choice and short_answer.",
      "- Add teacherGuide.",
      "- Add adaptiveVersions: foundation, standard, advanced.",
      "- Do not include private student data.",
      "Input:",
      `title: ${args.title}`,
      `subject: ${args.subject}`,
      `grade: ${args.grade}`,
      `language: ${args.language}`,
      `rawLessonText: ${args.rawLessonText}`,
      `teacherInstructions: ${args.teacherInstructions ?? ""}`,
      "Output: StructuredLesson JSON only."
    ];

    return instruction.join("\n");
  }

  buildFallbackLesson(args: {
    projectId: string;
    title: string;
    subject: string;
    grade: string;
    language: "en" | "vi" | "bilingual";
    rawInput: string;
  }) {
    return {
      id: `lesson_${args.projectId.slice(0, 8)}`,
      title: args.title,
      subject: args.subject,
      grade: args.grade,
      language: args.language,
      estimatedMinutes: 35,
      learningObjectives: [
        `Understand the core idea of ${args.title}.`,
        "Apply the concept in a short check-your-understanding activity."
      ],
      pages: [
        {
          pageNumber: 1,
          title: "Concept Overview",
          aiText: `This page introduces ${args.title} in student-friendly language.`,
          blocks: [
            { id: "b1", type: "heading", text: args.title },
            { id: "b2", type: "paragraph", text: args.rawInput.slice(0, 400) || "Teacher draft content." },
            { id: "b3", type: "key_concept", text: "Identify one key concept and explain it in your own words." }
          ]
        },
        {
          pageNumber: 2,
          title: "Practice",
          aiText: "This page reinforces the concept with examples and a quick check.",
          blocks: [
            { id: "b4", type: "example", text: "Review one short practical example linked to the topic." },
            { id: "b5", type: "check_your_understanding", text: "What is the most important idea from this lesson?" },
            { id: "b6", type: "summary", text: "Summarize the lesson in two sentences." }
          ]
        }
      ],
      quizSeeds: [
        {
          id: "q1",
          type: "multiple_choice",
          question: `Which option best describes ${args.title}?`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: "Option A",
          explanation: "Choose the most conceptually accurate option.",
          difficulty: "standard",
          skillTag: "concept_understanding"
        },
        {
          id: "q2",
          type: "short_answer",
          question: "Explain one key concept from this lesson.",
          expectedAnswer: "Student provides a concise concept explanation.",
          explanation: "Check conceptual clarity and terminology.",
          difficulty: "foundation",
          skillTag: "explanation"
        }
      ],
      teacherGuide: {
        lessonOverview: `Guide for teaching ${args.title} at grade ${args.grade}.`,
        keyMisconceptions: ["Students may confuse definitions without examples."],
        teachingSteps: ["Introduce concept", "Work through one example", "Check understanding"],
        discussionPrompts: ["How does this concept connect to daily learning?"],
        differentiationTips: {
          foundation: "Use simpler terms and shorter examples.",
          standard: "Use grade-level examples and checks.",
          advanced: "Ask for deeper explanation and transfer."
        },
        assessmentRubric: [
          {
            criterion: "Concept understanding",
            excellent: "Explains accurately with clear example.",
            developing: "Explains partially with minor gaps.",
            needsSupport: "Needs guided prompts to explain."
          }
        ]
      },
      adaptiveVersions: {
        foundation: "Provide guided vocabulary and short checkpoints.",
        standard: "Keep core lesson structure with independent checks.",
        advanced: "Add extension question requiring transfer of concept."
      }
    };
  }
}

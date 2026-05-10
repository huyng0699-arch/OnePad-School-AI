import type { Lesson } from '../types';

export type QuizMockQuestion = {
  question: string;
  aiText: string;
  options: string[];
  correctIndex: number;
};

export function buildQuizQuestionsFromLesson(lesson: Lesson): QuizMockQuestion[] {
  return lesson.pages.flatMap((page, pageIndex) =>
    page.blocks
      .filter((block) => block.type === 'question')
      .map((block, questionIndex) =>
        block.type === 'question'
          ? {
              question: block.question,
              aiText: page.aiText,
              options: block.options,
              correctIndex: Math.max(0, block.options.indexOf(block.correctAnswer))
            }
          : null
      )
      .filter((item): item is QuizMockQuestion => item !== null)
  );
}

export function getQuizExplanation(question: QuizMockQuestion, currentIndex: number): string {
  return `Explanation: Question ${currentIndex + 1} is best answered by "${question.options[question.correctIndex]}". Review context: ${question.aiText}`;
}

import type { Lesson } from '../types';
import { getQuestionBlocksFromLesson } from './lessonEngine';

export type DemoQuizQuestion = {
  id: string;
  type: 'multiple_choice' | 'short_answer' | 'spoken_answer';
  question: string;
  options?: string[];
  correctAnswer?: string;
  expectedAnswer?: string;
  rubric?: string;
  explanation: string;
  difficulty: 'basic' | 'standard' | 'advanced';
  sourcePage?: number;
};

const DEFAULT_OPTIONS = ['Dap an A', 'Dap an B', 'Dap an C', 'Dap an D'];

export function buildQuizFromLesson(lesson: Lesson): DemoQuizQuestion[] {
  const questionBlocks = getQuestionBlocksFromLesson(lesson);

  if (questionBlocks.length === 0) {
    return lesson.pages.map((page, index) => ({
      id: `generated-${page.pageNumber}`,
      type: 'multiple_choice',
      question: `What is the key idea of page ${page.pageNumber}?`,
      options: DEFAULT_OPTIONS,
      correctAnswer: DEFAULT_OPTIONS[index % DEFAULT_OPTIONS.length],
      explanation: `Based on lesson context: ${page.aiText}`,
      difficulty: 'basic',
      sourcePage: page.pageNumber
    }));
  }

  return questionBlocks.map(({ page, block }, index) => {
    if (block.type !== 'question') {
      const generatedCorrect = DEFAULT_OPTIONS[index % DEFAULT_OPTIONS.length];
      return {
        id: `q-${page.pageNumber}-${index}`,
        type: 'multiple_choice',
        question: `What is the key idea of page ${page.pageNumber}?`,
        options: DEFAULT_OPTIONS,
        correctAnswer: generatedCorrect,
        explanation: `Based on lesson context: ${page.aiText}`,
        difficulty: 'basic',
        sourcePage: page.pageNumber
      };
    }

    return {
      id: `q-${page.pageNumber}-${index}`,
      type: 'multiple_choice',
      question: block.question,
      options: block.options,
      correctAnswer: block.correctAnswer,
      explanation: block.explanation,
      difficulty: 'standard',
      sourcePage: page.pageNumber
    };
  });
}

export function gradeAnswer(
  question: DemoQuizQuestion,
  selectedAnswer: string | null
): { isCorrect: boolean; resultText: string; explanation: string } {
  if (question.type !== 'multiple_choice') {
    return {
      isCorrect: false,
      resultText: 'Manual grading required',
      explanation: question.explanation
    };
  }

  if (!selectedAnswer) {
    return {
      isCorrect: false,
      resultText: 'No answer selected',
      explanation: 'Please select an answer before submitting.'
    };
  }

  const isCorrect = selectedAnswer === question.correctAnswer;
  return {
    isCorrect,
    resultText: isCorrect ? 'Correct' : 'Incorrect',
    explanation: question.explanation
  };
}

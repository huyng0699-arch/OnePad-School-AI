export type ISODateString = string;

export interface Student {
  id: string;
  name: string;
  grade: string;
  email: string;
  className?: string;
  studentCode?: string;
  schoolName?: string;
  homeroomTeacher?: string;
}

export type LessonBlock =
  | {
      type: 'heading';
      text: string;
    }
  | {
      type: 'paragraph';
      text: string;
    }
  | {
      type: 'key_point';
      text: string;
    }
  | {
      type: 'example';
      text: string;
    }
  | {
      type: 'image';
      imageUrl: string;
      caption: string;
      aiDescription: string;
    }
  | {
      type: 'question';
      question: string;
      options: string[];
      correctAnswer: string;
      explanation: string;
    }
  | {
      type: 'ar_model';
      label: string;
      modelUrl: string;
      description: string;
    };

export interface LessonPage {
  pageNumber: number;
  title: string;
  blocks: LessonBlock[];
  aiText: string;
}

export interface Lesson {
  id: string;
  title: string;
  subject: string;
  grade: string;
  pages: LessonPage[];
}

export interface Assignment {
  id: string;
  lessonId: string;
  title: string;
  dueDate: ISODateString;
  completed: boolean;
}

export interface Quiz {
  id: string;
  lessonId: string;
  questions: string[];
  score?: number;
}

export interface QuizQuestion {
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
}

export type QuizMode = 'quick' | 'test_10';

export type StudentAnswer = {
  questionId: string;
  questionType: 'multiple_choice' | 'short_answer' | 'spoken_answer';
  selectedOption?: string;
  textAnswer?: string;
  isCorrectLocal?: boolean;
};

export interface Mastery {
  id: string;
  studentId: string;
  topic: string;
  level: number; // 0-100
}

export type GroupAssignmentStatus = 'not_started' | 'in_progress' | 'submitted';
export type GroupTaskStatus = 'todo' | 'doing' | 'done';

export type GroupMember = {
  id: string;
  name: string;
  role: 'leader' | 'member';
  avatarLabel?: string;
};

export type GroupTask = {
  id: string;
  title: string;
  assignedToStudentId?: string;
  status: GroupTaskStatus;
};

export type GroupMessage = {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
  source: 'mock' | 'local';
};

export type GroupSubmission = {
  answerText: string;
  submittedAt?: string;
  submittedByStudentId?: string;
};

export type GroupAssignment = {
  id: string;
  title: string;
  subject: string;
  lessonId?: string;
  teacherName: string;
  dueDate: string;
  status: GroupAssignmentStatus;
  instruction: string;
  expectedOutput: string;
  groupName: string;
  members: GroupMember[];
  tasks: GroupTask[];
  discussion: GroupMessage[];
  submission?: GroupSubmission;
};

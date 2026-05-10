import { setPendingLessonCommand, type PendingLessonCommand } from './lessonCommandBridge';
import type { HomeRouteTarget } from '../screens/HomeScreen';
import type { VoiceCommandResult } from './voiceLocalCommandMatcher';

type StudentHubSectionTarget = 'schedule' | 'grades' | 'assignments' | 'reports' | 'tools' | 'settings';

type ExecuteDependencies = {
  navigate: (target: HomeRouteTarget) => void;
  openStudentHub: () => void;
  openStudentHubSection: (section: StudentHubSectionTarget) => void;
  currentScreen: string;
};

export type ExecuteOutcome = {
  executed: boolean;
  needsConfirmation: boolean;
  message: string;
};

const LESSON_ACTIONS: PendingLessonCommand[] = [
  'next_page',
  'previous_page',
  'summarize_current_page',
  'explain_current_page',
  'create_quiz_from_current_page'
];

export function executeVoiceCommand(command: VoiceCommandResult, deps: ExecuteDependencies): ExecuteOutcome {
  if (command.source === 'ai' && command.confidence < 0.55) {
    return { executed: false, needsConfirmation: false, message: command.confirmation };
  }
  if (command.source === 'ai' && command.confidence < 0.75) {
    return { executed: false, needsConfirmation: true, message: `Did you mean: ${command.confirmation}` };
  }

  switch (command.action) {
    case 'open_home':
      deps.openStudentHub();
      return { executed: true, needsConfirmation: false, message: 'Opening Home menu.' };
    case 'open_lesson_reader':
      deps.navigate('lessonReader');
      return { executed: true, needsConfirmation: false, message: 'Opening lesson.' };
    case 'open_ai_tutor':
      deps.navigate('aiTutor');
      return { executed: true, needsConfirmation: false, message: 'Opening AI Tutor.' };
    case 'open_quiz':
    case 'start_quick_test':
    case 'start_10_question_test':
      deps.navigate('quiz');
      return { executed: true, needsConfirmation: false, message: 'Opening quiz.' };
    case 'open_progress':
      deps.navigate('progress');
      return { executed: true, needsConfirmation: false, message: 'Opening progress.' };
    case 'open_ar_lab':
      deps.navigate('arLab');
      return { executed: true, needsConfirmation: false, message: 'Opening AR Lab.' };
    case 'open_lecture_recorder':
      deps.navigate('lectureRecorder');
      return { executed: true, needsConfirmation: false, message: 'Opening Lecture Recorder.' };
    case 'open_support':
    case 'ask_teacher_help':
    case 'open_private_support':
      deps.navigate('support');
      return { executed: true, needsConfirmation: false, message: 'Opening support.' };
    case 'open_group_work':
      deps.navigate('groupWork');
      return { executed: true, needsConfirmation: false, message: 'Opening Group Work.' };
    case 'open_student_hub':
      deps.openStudentHub();
      return { executed: true, needsConfirmation: false, message: 'Opening Student Hub.' };
    case 'open_settings':
      deps.openStudentHubSection('settings');
      return { executed: true, needsConfirmation: false, message: 'Opening settings.' };
    case 'show_schedule':
      deps.openStudentHubSection('schedule');
      return { executed: true, needsConfirmation: false, message: 'Showing schedule.' };
    case 'show_grades':
      deps.openStudentHubSection('grades');
      return { executed: true, needsConfirmation: false, message: 'Showing grades.' };
    case 'show_assignments':
      deps.openStudentHubSection('assignments');
      return { executed: true, needsConfirmation: false, message: 'Showing assignments.' };
    case 'show_reports':
      deps.openStudentHubSection('reports');
      return { executed: true, needsConfirmation: false, message: 'Showing reports.' };
    case 'show_tools':
      deps.openStudentHubSection('tools');
      return { executed: true, needsConfirmation: false, message: 'Showing tools.' };
    default:
      if (LESSON_ACTIONS.includes(command.action as PendingLessonCommand)) {
        setPendingLessonCommand(command.action as PendingLessonCommand);
        deps.navigate('lessonReader');
        return { executed: true, needsConfirmation: false, message: 'Opening lesson to run this command.' };
      }
      return { executed: false, needsConfirmation: false, message: 'Unknown command. Please try again.' };
  }
}

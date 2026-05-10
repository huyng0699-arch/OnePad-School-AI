export type VoiceCommandAction =
  | 'open_home'
  | 'open_lesson_reader'
  | 'open_ai_tutor'
  | 'open_quiz'
  | 'open_progress'
  | 'open_ar_lab'
  | 'open_lecture_recorder'
  | 'open_support'
  | 'open_student_hub'
  | 'open_group_work'
  | 'open_settings'
  | 'summarize_current_page'
  | 'explain_current_page'
  | 'create_quiz_from_current_page'
  | 'next_page'
  | 'previous_page'
  | 'start_quick_test'
  | 'start_10_question_test'
  | 'submit_answer'
  | 'finish_test'
  | 'show_schedule'
  | 'show_grades'
  | 'show_assignments'
  | 'show_reports'
  | 'show_tools'
  | 'summarize_group_discussion'
  | 'suggest_group_answer_outline'
  | 'ask_teacher_help'
  | 'open_private_support'
  | 'unknown';

export type VoiceCommandResult = {
  action: VoiceCommandAction;
  confidence: number;
  spokenText: string;
  target: string | null;
  params: Record<string, unknown>;
  confirmation: string;
  source: 'local' | 'ai';
};

const RULES: Array<{ patterns: RegExp[]; action: VoiceCommandAction; target?: string; confirmation: string }> = [
  { patterns: [/\b(open home|mở trang chủ)\b/i], action: 'open_home', target: 'home', confirmation: 'Opening Home.' },
  { patterns: [/\b(open lesson|mở bài học|mở bài hôm nay)\b/i], action: 'open_lesson_reader', target: 'lessonReader', confirmation: 'Opening Lesson Reader.' },
  { patterns: [/\b(open ai tutor|mở ai tutor|hỏi ai)\b/i], action: 'open_ai_tutor', target: 'aiTutor', confirmation: 'Opening AI Tutor.' },
  { patterns: [/\b(open quiz|mở quiz|mở bài kiểm tra)\b/i], action: 'open_quiz', target: 'quiz', confirmation: 'Opening Quiz.' },
  { patterns: [/\b(open progress|mở tiến độ)\b/i], action: 'open_progress', target: 'progress', confirmation: 'Opening Progress.' },
  { patterns: [/\b(open ar lab|mở ar)\b/i], action: 'open_ar_lab', target: 'arLab', confirmation: 'Opening AR Lab.' },
  { patterns: [/\b(open lecture recorder|mở ghi bài)\b/i], action: 'open_lecture_recorder', target: 'lectureRecorder', confirmation: 'Opening Lecture Recorder.' },
  { patterns: [/\b(open support|mở hỗ trợ)\b/i], action: 'open_support', target: 'support', confirmation: 'Opening Support.' },
  { patterns: [/\b(open student hub|mở menu học sinh)\b/i], action: 'open_student_hub', confirmation: 'Opening Student Hub.' },
  { patterns: [/\b(open group work|mở bài tập nhóm)\b/i], action: 'open_group_work', target: 'groupWork', confirmation: 'Opening Group Work.' },
  { patterns: [/\b(open settings|mở cài đặt)\b/i], action: 'open_settings', confirmation: 'Opening settings.' },
  { patterns: [/\b(next page|trang sau)\b/i], action: 'next_page', confirmation: 'Moving to next page.' },
  { patterns: [/\b(previous page|trang trước)\b/i], action: 'previous_page', confirmation: 'Moving to previous page.' },
  { patterns: [/\b(summarize this page|tóm tắt trang này)\b/i], action: 'summarize_current_page', confirmation: 'Summarizing current page.' },
  { patterns: [/\b(explain this page|giải thích trang này|giảng bài này)\b/i], action: 'explain_current_page', confirmation: 'Explaining current page.' },
  { patterns: [/\b(create quiz|tạo quiz|tạo bài kiểm tra)\b/i], action: 'create_quiz_from_current_page', confirmation: 'Creating quiz from current page.' },
  { patterns: [/\b(show schedule|mở thời khóa biểu)\b/i], action: 'show_schedule', confirmation: 'Showing schedule.' },
  { patterns: [/\b(show grades|mở điểm số)\b/i], action: 'show_grades', confirmation: 'Showing grades.' },
  { patterns: [/\b(show assignments|mở bài tập)\b/i], action: 'show_assignments', confirmation: 'Showing assignments.' },
  { patterns: [/\b(show reports|mở báo cáo)\b/i], action: 'show_reports', confirmation: 'Showing reports.' },
  { patterns: [/\b(show tools|mở công cụ)\b/i], action: 'show_tools', confirmation: 'Showing tools.' }
];

export function matchVoiceLocalCommand(transcript: string): { matched: true; command: VoiceCommandResult } | { matched: false } {
  const normalized = transcript.trim();
  if (!normalized) {
    return { matched: false };
  }
  for (const rule of RULES) {
    if (rule.patterns.some((pattern) => pattern.test(normalized))) {
      return {
        matched: true,
        command: {
          action: rule.action,
          confidence: 0.98,
          spokenText: normalized,
          target: rule.target ?? null,
          params: {},
          confirmation: rule.confirmation,
          source: 'local'
        }
      };
    }
  }
  return { matched: false };
}

export const VOICE_ACTION_ALLOWLIST: VoiceCommandAction[] = [
  'open_home',
  'open_lesson_reader',
  'open_ai_tutor',
  'open_quiz',
  'open_progress',
  'open_ar_lab',
  'open_lecture_recorder',
  'open_support',
  'open_student_hub',
  'open_group_work',
  'open_settings',
  'summarize_current_page',
  'explain_current_page',
  'create_quiz_from_current_page',
  'next_page',
  'previous_page',
  'start_quick_test',
  'start_10_question_test',
  'submit_answer',
  'finish_test',
  'show_schedule',
  'show_grades',
  'show_assignments',
  'show_reports',
  'show_tools',
  'summarize_group_discussion',
  'suggest_group_answer_outline',
  'ask_teacher_help',
  'open_private_support',
  'unknown'
];


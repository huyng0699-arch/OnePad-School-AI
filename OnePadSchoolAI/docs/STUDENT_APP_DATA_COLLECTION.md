# Student App Data Collection

- `LessonReaderScreen`: `lesson_started`, `lesson_completed`, `ai_tutor_used`.
- `QuizScreen`: `quiz_started`, `quiz_completed`, `short_answer_submitted`, optional `learning_decline_signal`.
- `AiTutorScreen`: `ai_tutor_used`, `low_confidence_signal`, `frustration_signal`.
- `SupportScreen`: `support_requested`, `teacher_help_requested` with privacy-aware levels.
- `GroupWorkScreen`: `group_work_activity`, `collaboration_activity`, `assignment_submitted`.
- `ArLabScreen`: `ar_assignment_received`, `ar_assignment_opened`, `ar_model_explained`, `ar_quiz_completed`.
- `LectureRecorderScreen`: `transcript_summarized`, `transcript_quiz_created`.

Each event includes `safeSummary`, metadata, privacy flags, and role visibility controls.

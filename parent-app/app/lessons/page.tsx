export const dynamic = "force-dynamic";

import ParentShell from "../../components/ParentShell";
import { onepadApi, statusText } from "../../lib/api";

export default async function LessonsPage() {
  const response = await onepadApi.parentLessons() as any;
  const lessons = Array.isArray(response.lessons) ? response.lessons : [];

  return (
    <ParentShell>
      <section className="section card solid parent-home-intro"><h2>Lessons</h2><p>Current lessons, completed lessons, review lessons, key points, and home review questions.</p></section>
      <section className="section grid cols-3">
        {lessons.length ? lessons.map((lesson: any) => (
          <div className="card solid" key={lesson.lessonId || lesson.id || lesson.title}>
            <span className="badge">{statusText(lesson.status)}</span><h3>{lesson.title}</h3><p>{lesson.subject} · {lesson.grade}</p>
            <div className="trait-list section">{(Array.isArray(lesson.keyPoints) ? lesson.keyPoints : []).map((point: string) => <span key={point}>{point}</span>)}</div>
            <p>{lesson.parentExplanation || "Parent-safe explanation pending from backend."}</p>
            <div className="health-stack section">{(Array.isArray(lesson.homeQuestions) ? lesson.homeQuestions : []).map((q: string) => <div key={q}><span>Home question</span><strong>{q}</strong></div>)}</div>
          </div>
        )) : <div className="card solid"><h3>No lessons yet</h3><p>Backend should return current, completed, and recommended review lessons.</p></div>}
      </section>
    </ParentShell>
  );
}

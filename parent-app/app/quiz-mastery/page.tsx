export const dynamic = "force-dynamic";

import ParentShell from "../../components/ParentShell";
import { onepadApi } from "../../lib/api";

export default async function QuizMasteryPage() {
  const response = await onepadApi.learningAcrossSubjects() as any;
  const subjects = Array.isArray(response.subjects) ? response.subjects : [];

  return (
    <ParentShell>
      <section className="section card solid parent-home-intro"><h2>Quiz & Mastery</h2><p>Latest quiz, accuracy, repeated mistakes, baseline comparison, and home review plan.</p></section>
      <section className="section grid cols-3">
        {subjects.length ? subjects.map((subject: any) => (
          <div className="card solid" key={subject.subject || subject.id}>
            <div className="score-ring"><span>{subject.accuracy ?? "-"}%</span></div><h3>{subject.latestQuiz || "Latest quiz pending"}</h3><p>{subject.subject} · mastery {subject.mastery ?? "-"}%</p>
            <div className="trait-list section">{(Array.isArray(subject.weakSkills) ? subject.weakSkills : []).map((skill: string) => <span key={skill}>{skill}</span>)}</div><p>{subject.parentAction || "Home review plan pending from backend."}</p>
          </div>
        )) : <div className="card solid"><h3>No quiz data yet</h3><p>Backend should return latest quiz, accuracy, skill mastery, repeated mistakes, and baseline comparison.</p></div>}
      </section>
    </ParentShell>
  );
}

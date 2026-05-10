export const dynamic = "force-dynamic";

import ParentShell from "../../components/ParentShell";
import { onepadApi } from "../../lib/api";

function trendText(trend: string) {
  if (trend === "improving") return "Improving";
  if (trend === "declining") return "Needs support";
  return "Stable";
}

export default async function LearningAcrossSubjectsPage() {
  const response = await onepadApi.learningAcrossSubjects() as any;
  const subjects = Array.isArray(response.subjects) ? response.subjects : [];

  return (
    <ParentShell>
      <section className="section card solid parent-home-intro"><h2>Learning Across Subjects</h2><p>Mastery, weak skills, learning trend, teacher contact, and recommended parent action.</p></section>
      <section className="section grid cols-3">
        {subjects.length ? subjects.map((subject: any) => (
          <div className="card solid" key={subject.subject || subject.id}>
            <div className="metric"><span>{subject.teacher || "Teacher pending"}</span><strong>{subject.mastery ?? "-"}%</strong></div>
            <h3>{subject.subject || "Subject"}</h3>
            <p>Latest quiz: {subject.latestQuiz || "Pending"} · Accuracy {subject.accuracy ?? "-"}%</p>
            <div className="trait-list section">{(Array.isArray(subject.weakSkills) ? subject.weakSkills : []).map((skill: string) => <span key={skill}>{skill}</span>)}</div>
            <p><strong>{trendText(subject.trend)}.</strong> {subject.parentAction || "Parent action pending from backend."}</p>
          </div>
        )) : <div className="card solid"><h3>No subject data yet</h3><p>Backend should return Biology, Math, Literature, English, Science, History, or any configured school subjects.</p></div>}
      </section>
    </ParentShell>
  );
}

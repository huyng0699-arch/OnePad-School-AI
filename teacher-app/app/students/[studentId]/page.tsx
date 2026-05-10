import { demoStudents } from "../../../lib/demoData";

export default function TeacherStudentDetailPage({ params }: { params: { studentId: string } }) {
  const s = demoStudents.find((x) => x.studentId === params.studentId) ?? demoStudents[0];
  return <div className="shell"><main className="main"><section className="hero"><div className="hero-top"><div><div className="kicker">Student Detail</div><h2>{s.fullName}</h2><p>{s.safeSummary}</p></div></div></section><section className="section grid cols-3"><div className="card"><h3>Academic summary</h3><p>Mastery {s.masteryOverall}% · Strongest: {s.strongestSkill}</p></div><div className="card"><h3>Learning support</h3><p>Weakest: {s.weakestSkill}</p></div><div className="card"><h3>AI activity</h3><p>Local: {s.localAiEvents} · Cloud: {s.cloudAiEvents}</p></div></section></main></div>;
}

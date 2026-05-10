import Link from "next/link";
import { onepadApi } from "../lib/api";
import { assignments, messages, supportTickets } from "../lib/demoData";
import { teacherSnapshot } from "../lib/teacherMetrics";
import TeacherQuickActions from "../components/TeacherQuickActions";

export default async function TeacherPage() {
  const data = await onepadApi.dataset();
  const snapshot = teacherSnapshot();
  const reviewStudents = data.class8AStudents.filter((s: any) => s.biologyMastery < 65 || s.missingAssignments > 2).slice(0, 6);

  return (
    <>
      <section className="hero">
        <div className="hero-top">
          <div>
            <div className="kicker">Teacher Workspace</div>
            <h2>Today is about getting Class 8A unstuck before the next Biology lab.</h2>
            <p>Scope-driven access is active: subject learning data, homeroom safe summaries, and consent-based guardian cases stay separated.</p>
          </div>
          <div className="status-pill"><span className="dot" /> Live demo data</div>
        </div>
        <div className="envbar">
          <code>Biology 8A</code><code>20 students</code><code>2 guardian cases</code><code>Local AI first</code>
        </div>
      </section>

      <section className="section grid cols-4">
        <div className="card"><div className="metric"><span>Biology mastery</span><strong>{snapshot.masteryAverage}%</strong></div></div>
        <div className="card"><div className="metric"><span>Need review</span><strong>{snapshot.needsReview}</strong></div></div>
        <div className="card"><div className="metric"><span>Support queue</span><strong>{snapshot.supportOpen}</strong></div></div>
        <div className="card"><div className="metric"><span>Present today</span><strong>{snapshot.presentToday}/20</strong></div></div>
      </section>

      <section className="section split">
        <div className="card solid">
          <h3>Priority Students</h3>
          <div className="table-wrap"><table className="table"><thead><tr><th>Student</th><th>Reason</th><th>Suggested action</th><th></th></tr></thead><tbody>
            {reviewStudents.map((s: any) => <tr key={s.id}><td><strong>{s.fullName}</strong><br /><span className="muted">{s.group}</span></td><td>{s.weakestSkill}<br />Missing: {s.missingAssignments}</td><td>{s.safeSummary}</td><td><Link className="badge" href={`/students/${s.id}`}>Open</Link></td></tr>)}
          </tbody></table></div>
        </div>
        <div className="card dark">
          <h3>Next Best Moves</h3>
          <div className="task-list">
            <Link href="/assignments">Create membrane transport exit ticket</Link>
            <Link href="/ar-assignments">Assign AR cell lab to review group</Link>
            <Link href="/messages">Reply to {messages[0].from}</Link>
            <Link href="/support">Review {supportTickets.length} support signals</Link>
          </div>
        </div>
      </section>

      <section className="section grid cols-2">
        <div className="card solid"><h3>Assignments In Motion</h3>{assignments.slice(0, 3).map((a) => <div className="compact-row" key={a.id}><div><strong>{a.title}</strong><small>{a.type} · Due {a.due}</small></div><span className="badge teal">{a.completion}%</span></div>)}</div>
        <div className="card solid"><h3>Messages</h3>{messages.map((m) => <div className="compact-row" key={m.id}><div><strong>{m.subject}</strong><small>{m.from} · {m.student}</small></div><span className="badge amber">{m.status}</span></div>)}</div>
      </section>
      <TeacherQuickActions />
    </>
  );
}


import { assignments, class8AStudents, supportTickets } from "../../lib/demoData";
import { onepadApi } from "../../lib/api";
import { teacherSnapshot } from "../../lib/teacherMetrics";

export default async function Page() {
  const snap = teacherSnapshot();
  const syncedSummary = await onepadApi.syncedTeacherSummary("student_minh_001");
  const syncedEvents = await onepadApi.syncedStudentSupportEvents("student_minh_001");

  return (
    <>
      <section className="hero">
        <div className="hero-top">
          <div>
            <div className="kicker">Reports</div>
            <h2>Generate teacher-safe reports for learning progress and follow-up.</h2>
            <p>Reports use aggregated signals and safe summaries only.</p>
          </div>
        </div>
      </section>
      <section className="section grid cols-4">
        <div className="card"><div className="metric"><span>Mastery avg</span><strong>{snap.masteryAverage}%</strong></div></div>
        <div className="card"><div className="metric"><span>Review list</span><strong>{snap.needsReview}</strong></div></div>
        <div className="card"><div className="metric"><span>Open support</span><strong>{supportTickets.length}</strong></div></div>
        <div className="card"><div className="metric"><span>Assignments</span><strong>{assignments.length}</strong></div></div>
      </section>
      <section className="section split">
        <div className="card solid">
          <h3>Synced Teacher Summary ({syncedSummary.source})</h3>
          <p>{syncedSummary.summary}</p>
          <p>Synced support events: {Array.isArray(syncedEvents.data) ? syncedEvents.data.length : 0}</p>
        </div>
        <div className="card solid">
          <h3>Auto Preview</h3>
          <p>Class 8A shows {snap.needsReview} learners needing structured review. Main Biology gap: cell membrane transport. Recommended next action: short exit ticket and AR model reflection.</p>
        </div>
      </section>
      <section className="section card solid">
        <h3>Students Flagged For Report</h3>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Student</th><th>Mastery</th><th>Trend</th><th>Safe summary</th></tr></thead>
            <tbody>
              {class8AStudents.filter(s => s.biologyMastery < 70 || s.supportSignals > 0).map(s => (
                <tr key={s.id}><td>{s.fullName}</td><td>{s.biologyMastery}%</td><td>{s.trend}</td><td>{s.safeSummary}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

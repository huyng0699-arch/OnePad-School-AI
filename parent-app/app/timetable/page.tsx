export const dynamic = "force-dynamic";

import ParentShell from "../../components/ParentShell";
import { onepadApi } from "../../lib/api";

export default async function TimetablePage() {
  const response = await onepadApi.timetable() as any;
  const timetable = Array.isArray(response.timetable) ? response.timetable : [];

  return (
    <ParentShell>
      <section className="section card solid parent-home-intro"><h2>Timetable</h2><p>Weekly schedule, subject, teacher, room, current lesson, and related assignment.</p></section>
      <section className="section card solid"><div className="table-wrap"><table className="table"><thead><tr><th>Day</th><th>Subject</th><th>Teacher</th><th>Room</th><th>Current lesson</th><th>Related assignment</th></tr></thead><tbody>{timetable.length ? timetable.map((row: any) => <tr key={`${row.day}-${row.subject}`}><td>{row.day}</td><td>{row.subject}</td><td>{row.teacher}</td><td>{row.room}</td><td>{row.currentLesson}</td><td>{row.assignment}</td></tr>) : <tr><td colSpan={6}>Backend has not returned timetable yet.</td></tr>}</tbody></table></div></section>
    </ParentShell>
  );
}

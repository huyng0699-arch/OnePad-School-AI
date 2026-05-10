export const dynamic = "force-dynamic";

import ParentShell from "../../components/ParentShell";
import { formatDate, onepadApi, statusText } from "../../lib/api";

export default async function ParentAssignmentsPage() {
  const response = await onepadApi.assignments() as any;
  const assignments = Array.isArray(response.assignments) ? response.assignments : [];

  return (
    <ParentShell>
      <section className="section card solid parent-home-intro"><h2>Assignments</h2><p>Due date, status, related lesson, and recommended parent action.</p></section>
      <section className="section card solid"><div className="table-wrap"><table className="table"><thead><tr><th>Assignment</th><th>Subject</th><th>Teacher</th><th>Due date</th><th>Status</th><th>Parent action</th></tr></thead><tbody>{assignments.length ? assignments.map((item: any)=><tr key={item.id || item.title}><td><strong>{item.title}</strong><br/><small>{item.relatedLesson}</small></td><td>{item.subject}</td><td>{item.teacher}</td><td>{formatDate(item.dueDate)}</td><td>{statusText(item.status)}</td><td>{item.parentAction}</td></tr>) : <tr><td colSpan={6}>Backend has not returned assignments yet.</td></tr>}</tbody></table></div></section>
    </ParentShell>
  );
}

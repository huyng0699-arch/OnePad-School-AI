import Link from "next/link";
import AdminLayout from "../../../components/AdminLayout";
import { ActionGroup } from "../../../components/PageBits";
import { onepadApi } from "../../../lib/api";
import { getPermissionExpiryQueue, getTeacherRoleHistory } from "../../../lib/opsData";

export default async function TeacherWorkspacePage({ params }: { params: { teacherId: string } }) {
  const data = await onepadApi.dataset();
  const teacher = data.teachers.find((t:any) => t.id === params.teacherId) ?? data.teachers[0];
  const history = getTeacherRoleHistory(teacher.id);
  const expiry = getPermissionExpiryQueue(teacher.id);

  return <AdminLayout active="teachers" title={`Teacher Workspace: ${teacher.name}`} subtitle="Role governance workspace with role history and permission expiry queue.">
    <section className="section card"><Link href="/teachers">← Back to Teachers</Link></section>
    <section className="section grid cols-4">
      <div className="card"><div className="metric"><span>Role</span><strong>Teacher</strong></div></div>
      <div className="card"><div className="metric"><span>Classes</span><strong>{teacher.classesTaught.join(", ")}</strong></div></div>
      <div className="card"><div className="metric"><span>Subjects</span><strong>{teacher.subjects.join(", ") || "-"}</strong></div></div>
      <div className="card"><div className="metric"><span>Status</span><strong>{teacher.status}</strong></div></div>
    </section>
    <section className="section card solid">
      <h3>Role history</h3>
      <div className="table-wrap"><table className="table"><thead><tr><th>Effective date</th><th>Role</th><th>Class scope</th><th>Subject scope</th><th>Actor</th><th>Reason</th></tr></thead><tbody>
        {history.map((h) => <tr key={`${h.effectiveDate}-${h.role}`}><td>{h.effectiveDate}</td><td>{h.role}</td><td>{h.classScope}</td><td>{h.subjectScope}</td><td>{h.actor}</td><td>{h.reason}</td></tr>)}
      </tbody></table></div>
    </section>
    <section className="section card solid">
      <h3>Permission expiry queue</h3>
      <div className="table-wrap"><table className="table"><thead><tr><th>Permission set</th><th>Expires at</th><th>Days left</th><th>Impact</th><th>Actions</th></tr></thead><tbody>
        {expiry.map((q) => <tr key={q.id}><td>{q.permissionSet}</td><td>{q.expiresAt}</td><td>{q.daysLeft}</td><td>{q.impact}</td><td><ActionGroup items={[{ label: "Renew permission", title: "Renew permission", description: "Extend permission expiry and update reason.", variant: "modal", confirmLabel: "Renew" }, { label: "Change scope", title: "Change role scope", description: "Adjust class/subject scope under policy controls.", variant: "drawer", confirmLabel: "Save" }]} /></td></tr>)}
      </tbody></table></div>
    </section>
  </AdminLayout>;
}


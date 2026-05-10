import AdminLayout from "../../components/AdminLayout";
import { ActionGroup } from "../../components/PageBits";

const rows = [
  { lesson: "Cell Basics", class: "8A", teacher: "Ms. Linh", date: "2026-05-08", status: "Draft", sync: "Pending" },
  { lesson: "Solar System Model", class: "8B", teacher: "Mr. Bao", date: "2026-05-09", status: "Scheduled", sync: "Queued" },
];

export default function LessonPublishingPage() {
  return <AdminLayout active="lesson-publishing" title="Lesson Publishing" subtitle="Push school-approved content to Student App with publish scheduling and sync tracking.">
    <section className="section card"><div className="pill-row"><span className="badge">Draft lessons</span><span className="badge">Published lessons</span><span className="badge">Scheduled lessons</span><span className="badge amber">Failed sync</span></div></section>
    <section className="section card solid"><div className="table-wrap"><table className="table"><thead><tr><th>Lesson</th><th>Class</th><th>Teacher</th><th>Publish date</th><th>Status</th><th>Student sync</th><th>Actions</th></tr></thead><tbody>
      {rows.map((r)=><tr key={`${r.lesson}-${r.class}`}><td>{r.lesson}</td><td>{r.class}</td><td>{r.teacher}</td><td>{r.date}</td><td>{r.status}</td><td>{r.sync}</td><td><ActionGroup items={[
        {label:"Publish now",title:"Publish Lesson",description:"Lesson, target class, optional target students, publish time, require quiz, include AR.",variant:"modal",confirmLabel:"Publish"},
        {label:"Schedule publish",title:"Schedule Publish",description:"Set publish window and sync policy.",variant:"modal",confirmLabel:"Schedule"},
        {label:"Unpublish",title:"Unpublish Lesson",description:"Withdraw lesson from student app.",variant:"modal",confirmLabel:"Unpublish"},
        {label:"View sync status",title:"Sync Status",description:"Per-class sync status and retry queue.",variant:"drawer"}
      ]}/></td></tr>)}
    </tbody></table></div></section>
  </AdminLayout>;
}

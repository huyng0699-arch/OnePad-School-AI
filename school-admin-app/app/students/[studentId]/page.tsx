import Link from "next/link";
import AdminLayout from "../../../components/AdminLayout";
import { ActionGroup } from "../../../components/PageBits";
import { onepadApi } from "../../../lib/api";
import { getInterventionPlan, getStudentTimeline } from "../../../lib/opsData";

export default async function StudentWorkspacePage({ params }: { params: { studentId: string } }) {
  const data = await onepadApi.dataset();
  const student = data.students.find((s:any) => s.id === params.studentId) ?? data.students[0];
  const parent = data.parents.find((p:any) => p.linkedStudent === student.fullName);
  const teachers = data.teachers.filter((t:any) => t.classes.includes(student.className.replace("Class ", "")));
  const timeline = getStudentTimeline(student.id);
  const plan = getInterventionPlan(student.id);

  return <AdminLayout active="students" title={`Student Workspace: ${student.fullName}`} subtitle="School-safe profile with operational timeline and intervention planning. No private wellbeing detail, no raw health data, no hidden score.">
    <section className="section card"><Link href="/students">← Back to Students</Link></section>
    <section className="section grid cols-4">
      <div className="card"><div className="metric"><span>Class</span><strong>{student.className}</strong></div></div>
      <div className="card"><div className="metric"><span>Parent linked</span><strong>{parent ? "Yes" : "No"}</strong></div></div>
      <div className="card"><div className="metric"><span>Device status</span><strong>{student.deviceStatus}</strong></div></div>
      <div className="card"><div className="metric"><span>Completion</span><strong>{Math.round(student.assignmentCompletionRate * 100)}%</strong></div></div>
    </section>
    <section className="section card solid">
      <h3>School-safe profile</h3>
      <p>Student: {student.fullName}</p>
      <p>Class: {student.className}</p>
      <p>Linked parent: {parent?.name ?? "Not linked"}</p>
      <p>Assigned teachers: {teachers.map((t:any) => t.name).join(", ")}</p>
      <p>Aggregate learning status: {student.aggregateLearningStatus}</p>
      <p>Policy note: No raw private text. No raw health data. No hidden score.</p>
    </section>
    <section className="section card solid">
      <h3>Operational timeline</h3>
      <div className="table-wrap"><table className="table"><thead><tr><th>Time</th><th>Type</th><th>Title</th><th>Summary</th></tr></thead><tbody>
        {timeline.map((e) => <tr key={`${e.time}-${e.title}`}><td>{new Date(e.time).toLocaleString("en-US")}</td><td>{e.type}</td><td>{e.title}</td><td>{e.summary}</td></tr>)}
      </tbody></table></div>
    </section>
    <section className="section card solid">
      <h3>Intervention plan</h3>
      <div className="table-wrap"><table className="table"><thead><tr><th>Owner</th><th>Task</th><th>Due date</th><th>Status</th><th>Priority</th><th>Actions</th></tr></thead><tbody>
        {plan.map((task) => <tr key={task.id}><td>{task.owner}</td><td>{task.task}</td><td>{task.dueDate}</td><td>{task.status}</td><td>{task.priority}</td><td><ActionGroup items={[{ label: "Update task", title: `Update intervention task`, description: "Adjust owner, deadline, and operational status.", variant: "modal", confirmLabel: "Save" }, { label: "Close task", title: "Close task", description: "Mark this intervention task as done.", variant: "modal", confirmLabel: "Close" }]} /></td></tr>)}
      </tbody></table></div>
    </section>
  </AdminLayout>;
}

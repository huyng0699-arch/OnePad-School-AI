import AdminLayout from "../../components/AdminLayout";
import { ActionGroup } from "../../components/PageBits";
import { onepadApi } from "../../lib/api";

export default async function TeachingAssignmentMatrixPage() {
  const data = await onepadApi.dataset();
  return <AdminLayout active="role-permission-matrix" title="Teaching Assignment Matrix" subtitle="Manage who teaches which subject, class, and students.">
    <section className="section card solid"><div className="table-wrap"><table className="table"><thead><tr><th>Teacher</th><th>Subject</th><th>Class</th><th>Students covered</th><th>Assignment type</th><th>Start date</th><th>Status</th><th>Actions</th></tr></thead><tbody>
      {data.assignments.map((a:any)=>{const t=data.teachers.find((x:any)=>x.id===a.teacherId); const whole=a.studentIds==="all_class"; return <tr key={a.id}><td>{t?.name}</td><td>{a.subject}</td><td>{a.classId.replace("class_","").toUpperCase()}</td><td>{whole?"20":"Selected"}</td><td>{whole?"Whole class":"Selected students"}</td><td>{a.startDate}</td><td>{a.status}</td><td><ActionGroup items={[{label:"Assign teacher to class",title:"Assign teacher",description:"Teacher, subject, class, scope, student picker, start date, notes.",variant:"modal",confirmLabel:"Save assignment"},{label:"Assign teacher to selected students",title:"Assign selected students",description:"Select teacher and students.",variant:"modal",confirmLabel:"Save assignment"},{label:"Change subject",title:"Change subject",description:"Update assignment subject.",variant:"modal",confirmLabel:"Save"},{label:"Remove assignment",title:"Remove assignment",description:"Remove teaching assignment.",variant:"modal",confirmLabel:"Remove"},{label:"View affected students",title:"Affected students",description:"Show impacted student list.",variant:"drawer"}]}/></td></tr>;})}
    </tbody></table></div></section>
  </AdminLayout>;
}


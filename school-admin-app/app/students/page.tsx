import AdminLayout from "../../components/AdminLayout";
import { ActionGroup } from "../../components/PageBits";
import { onepadApi } from "../../lib/api";

export default async function StudentsPage() {
  const data = await onepadApi.dataset();
  return <AdminLayout active="students" title="Students" subtitle="School-safe student operations and assignment coverage.">
    <section className="section card solid"><div className="table-wrap"><table className="table"><thead><tr><th>Student</th><th>Class</th><th>Parent linked</th><th>Homeroom teacher</th><th>Subject teachers</th><th>Device status</th><th>Aggregate learning status</th><th>Actions</th></tr></thead><tbody>
      {data.students.map((s:any)=><tr key={s.id}><td>{s.fullName}</td><td>{s.classId.replace("class_","").toUpperCase()}</td><td>{s.parentAccountId}</td><td>{data.teachers.find((t:any)=>t.id===s.homeroomTeacherId)?.name}</td><td>{Object.entries(s.assignedTeachersBySubject).map(([k,v])=>`${k}:${data.teachers.find((t:any)=>t.id===v)?.name}`).join(" | ")}</td><td>{s.deviceStatus}</td><td>{s.aggregateLearningStatus}</td><td><ActionGroup items={[{label:"View school-safe profile",title:"School-safe profile",description:"No private data.",variant:"drawer"},{label:"View assigned teachers",title:"Assigned teachers",description:"Subject-teacher mapping.",variant:"panel"},{label:"View parent link",title:"Parent link",description:"Linked parent account.",variant:"panel"},{label:"View device status",title:"Device status",description:"Device sync details.",variant:"panel"}]}/></td></tr>)}
    </tbody></table></div></section>
  </AdminLayout>;
}


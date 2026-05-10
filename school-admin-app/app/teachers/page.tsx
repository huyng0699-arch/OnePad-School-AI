import AdminLayout from "../../components/AdminLayout";
import { ActionGroup } from "../../components/PageBits";
import { onepadApi } from "../../lib/api";

export default async function TeachersPage() {
  const data = await onepadApi.dataset();
  return <AdminLayout active="teachers" title="Teachers" subtitle="Teacher assignment load, classes, and guardianship case count.">
    <section className="section card solid"><div className="table-wrap"><table className="table"><thead><tr><th>Teacher</th><th>Subjects</th><th>Classes taught</th><th>Homeroom class</th><th>Assigned students</th><th>Guardian cases</th><th>Status</th><th>Actions</th></tr></thead><tbody>
      {data.teachers.map((t:any)=>{const assigned=data.students.filter((s:any)=>Object.values(s.assignedTeachersBySubject).includes(t.id)).length; const gc=data.guardianCases.filter((g:any)=>g.assignedGuardianTeacherId===t.id).length; return <tr key={t.id}><td>{t.name}</td><td>{t.subjects.join(", ")}</td><td>{t.classesTaught.map((c:string)=>c.replace("class_","").toUpperCase()).join(", ")}</td><td>{t.homeroomClassId? t.homeroomClassId.replace("class_","").toUpperCase() : "-"}</td><td>{assigned}</td><td>{gc}</td><td>{t.status}</td><td><ActionGroup items={[{label:"Open teacher profile",title:"Teacher profile",description:"Open assignment and load profile.",variant:"drawer"},{label:"Assign subject/class",title:"Assign subject/class",description:"Update teaching assignment.",variant:"modal",confirmLabel:"Save"},{label:"Assign homeroom",title:"Assign homeroom",description:"Set homeroom assignment.",variant:"modal",confirmLabel:"Save"},{label:"View teaching load",title:"Teaching load",description:"Class and student load.",variant:"panel"},{label:"View audit",title:"Teacher audit",description:"Audit events.",variant:"panel"}]}/></td></tr>;})}
    </tbody></table></div></section>
  </AdminLayout>;
}


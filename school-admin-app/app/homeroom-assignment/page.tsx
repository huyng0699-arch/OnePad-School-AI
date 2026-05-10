import AdminLayout from "../../components/AdminLayout";
import { ActionGroup } from "../../components/PageBits";
import { onepadApi } from "../../lib/api";

export default async function HomeroomAssignmentPage() {
  const data = await onepadApi.dataset();
  return <AdminLayout active="homeroom-assignment" title="Homeroom Assignment" subtitle="Assign and maintain homeroom teacher coverage by class.">
    <section className="section card solid"><div className="table-wrap"><table className="table"><thead><tr><th>Class</th><th>Current homeroom teacher</th><th>Students</th><th>Support cases</th><th>Actions</th></tr></thead><tbody>
      {data.classes.map((c:any)=><tr key={c.id}><td>{c.name}</td><td>{c.homeroomTeacherName}</td><td>{c.students}</td><td>{data.guardianCases.filter((g:any)=>data.students.find((s:any)=>s.id===g.studentId)?.classId===c.id).length}</td><td><ActionGroup items={[{label:"Assign homeroom teacher",title:"Assign homeroom",description:"Set homeroom teacher.",variant:"modal",confirmLabel:"Save"},{label:"Change homeroom teacher",title:"Change homeroom",description:"Change current homeroom teacher.",variant:"modal",confirmLabel:"Save"},{label:"View class roster",title:"Class roster",description:"View student roster.",variant:"drawer"}]}/></td></tr>)}
    </tbody></table></div></section>
  </AdminLayout>;
}


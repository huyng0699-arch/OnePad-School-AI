import AdminLayout from "../../components/AdminLayout";
import { ActionGroup } from "../../components/PageBits";
import { onepadApi } from "../../lib/api";

export default async function ClassesPage() {
  const data = await onepadApi.dataset();
  return <AdminLayout active="classes" title="Classes" subtitle="Class operations, staffing, and aggregate learning status.">
    <section className="section card solid">
      <div className="table-wrap"><table className="table"><thead><tr><th>Class</th><th>Homeroom teacher</th><th>Students</th><th>Subjects covered</th><th>Completion rate</th><th>Local AI events</th><th>AR assignments</th><th>Actions</th></tr></thead><tbody>
        {data.classes.map((c:any)=><tr key={c.id}><td>{c.name}</td><td>{c.homeroomTeacherName}</td><td>{c.students}</td><td>{c.subjectsCovered.join(", ")}</td><td>{Math.round(c.completionRate*100)}%</td><td>{c.localAiEvents}</td><td>{c.arAssignments}</td><td><ActionGroup items={[{label:"Open class profile",title:"Class profile",description:"School-safe class profile.",variant:"drawer"},{label:"Assign homeroom teacher",title:"Assign homeroom teacher",description:"Assign class homeroom teacher.",variant:"modal",confirmLabel:"Save"},{label:"Manage subject teachers",title:"Manage subject teachers",description:"Map subjects to teachers.",variant:"modal",confirmLabel:"Save"},{label:"View students",title:"View students",description:"Open class roster.",variant:"drawer"},{label:"View aggregate report",title:"Aggregate report",description:"Class aggregate analytics.",variant:"panel"}]}/></td></tr>)}
      </tbody></table></div>
    </section>
  </AdminLayout>;
}


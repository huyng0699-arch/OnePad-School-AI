import AdminLayout from "../../components/AdminLayout";
import { ActionGroup } from "../../components/PageBits";
import { onepadApi } from "../../lib/api";

export default async function AssignmentsPage() {
  const data = await onepadApi.dataset();
  return <AdminLayout active="assignments" title="Assignments Operations" subtitle="View aggregate assignment performance by class and teacher without private individual detail.">
    <section className="section card solid"><div className="table-wrap"><table className="table"><thead><tr><th>Assignment</th><th>Type</th><th>Subject</th><th>Class</th><th>Teacher</th><th>Due date</th><th>Completion rate</th><th>Missing count</th><th>Actions</th></tr></thead><tbody>
      {data.assignmentOperations.map((a:any)=><tr key={a.id}><td>{a.name}</td><td>{a.type}</td><td>{a.subject}</td><td>{a.class}</td><td>{a.teacher}</td><td>{a.dueDate}</td><td>{Math.round(a.completionRate*100)}%</td><td>{a.missingCount}</td><td><ActionGroup items={[
        {label:"View aggregate",title:"Assignment Aggregate",description:"Class-level aggregate only. No private student detail.",variant:"drawer"},
        {label:"Extend deadline",title:"Extend Deadline",description:"Update assignment due date for selected class.",variant:"modal",confirmLabel:"Extend"},
        {label:"Notify teacher",title:"Notify Teacher",description:"Send operation notice to assignment owner.",variant:"modal",confirmLabel:"Send"},
        {label:"Export",title:"Export Assignment Aggregate",description:"Export aggregate assignment operations report.",variant:"modal",confirmLabel:"Export"}
      ]}/></td></tr>)}
    </tbody></table></div></section>
  </AdminLayout>;
}

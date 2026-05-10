import AdminLayout from "../../components/AdminLayout";
import { ActionGroup } from "../../components/PageBits";
import { onepadApi } from "../../lib/api";

export default async function ArContentPage() {
  const data = await onepadApi.dataset();
  return <AdminLayout active="ar-content" title="AR Content Governance" subtitle="Control AR content quality, safety status, assignment scope, and completion analytics.">
    <section className="section card"><div className="pill-row"><span className="badge">AR Library</span><span className="badge amber">Pending review</span><span className="badge">Assigned AR lessons</span><span className="badge">Completion analytics</span><span className="badge">Content safety status</span></div></section>
    <section className="section card solid"><div className="table-wrap"><table className="table"><thead><tr><th>AR title</th><th>Subject</th><th>Uploaded by</th><th>Status</th><th>Assigned classes</th><th>Completion rate</th><th>Actions</th></tr></thead><tbody>
      {data.arContent.map((a:any)=><tr key={a.id}><td>{a.title}</td><td>{a.subject}</td><td>{a.uploadedBy}</td><td>{a.status}</td><td>{a.assignedClasses.join(", ")||"-"}</td><td>{Math.round(a.completionRate*100)}%</td><td><ActionGroup items={[
        {label:"Add AR content",title:"Add AR Content",description:"Title, subject, AR model URL, AR viewer URL, thumbnail URL, instructions, grade.",variant:"modal",confirmLabel:"Save"},
        {label:"Review AR content",title:"Review AR Content",description:"Preview, metadata, teacher, target classes, approve/reject.",variant:"drawer"},
        {label:"Approve",title:"Approve AR Content",description:"Approve and move to assignable state.",variant:"modal",confirmLabel:"Approve"},
        {label:"Reject",title:"Reject AR Content",description:"Reject with feedback to uploader.",variant:"modal",confirmLabel:"Reject"},
        {label:"Assign to class",title:"Assign to Class",description:"AR content, class, due date, instructions.",variant:"modal",confirmLabel:"Assign"},
        {label:"Disable content",title:"Disable Content",description:"Disable AR access by policy.",variant:"modal",confirmLabel:"Disable"},
        {label:"Preview link",title:"AR Preview",description:"Open AR preview metadata panel.",variant:"panel"}
      ]}/></td></tr>)}
    </tbody></table></div></section>
  </AdminLayout>;
}

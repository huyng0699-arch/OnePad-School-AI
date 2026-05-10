import AdminLayout from "../../components/AdminLayout";
import { ActionGroup } from "../../components/PageBits";
import { onepadApi } from "../../lib/api";

export default async function CurriculumLibraryPage() {
  const data = await onepadApi.dataset();
  return <AdminLayout active="curriculum-library" title="Curriculum Library" subtitle="Manage structured lessons, templates, teacher-created content, and publishing readiness.">
    <section className="section card"><div className="pill-row"><span className="badge">Subjects</span><span className="badge">Structured lessons</span><span className="badge">Lesson templates</span><span className="badge">Teacher-created content</span><span className="badge">Published curriculum</span><span className="badge">Import future</span></div></section>
    <section className="section card solid"><div className="table-wrap"><table className="table"><thead><tr><th>Lesson</th><th>Subject</th><th>Grade</th><th>Created by</th><th>Status</th><th>Published to classes</th><th>AR linked</th><th>Actions</th></tr></thead><tbody>
      {data.lessons.map((l:any)=><tr key={l.id}><td>{l.title}</td><td>{l.subject}</td><td>{l.grade}</td><td>{l.createdBy}</td><td>{l.status}</td><td>{l.publishedTo.join(", ")||"-"}</td><td>{l.arLinked?"Yes":"No"}</td><td><ActionGroup items={[
        {label:"Add lesson",title:"Add Lesson",description:"Title, subject, grade, objectives, content source, optional AR link.",variant:"modal",confirmLabel:"Save draft"},
        {label:"Review teacher content",title:"Review Teacher Content",description:"Lesson summary, teacher, target class, approval status, approve/reject.",variant:"drawer",confirmLabel:"Approve"},
        {label:"Publish to class",title:"Publish to Class",description:"Push approved lesson to selected class.",variant:"modal",confirmLabel:"Publish"},
        {label:"Archive",title:"Archive Lesson",description:"Archive from active curriculum list.",variant:"modal",confirmLabel:"Archive"},
        {label:"View lesson structure",title:"Lesson Structure",description:"Objectives, activities, and assessment sequence.",variant:"panel"}
      ]}/></td></tr>)}
    </tbody></table></div></section>
  </AdminLayout>;
}

import AdminLayout from "../../components/AdminLayout";
import { ActionGroup } from "../../components/PageBits";

const guides = [
  "Admin guide",
  "Permission guide",
  "Privacy guide",
  "AI usage guide",
  "AR content guide",
  "Contact support",
];

export default function HelpPage() {
  return <AdminLayout active="help" title="Help" subtitle="Find operation guides and contact OnePad support.">
    <section className="section card solid"><div className="table-wrap"><table className="table"><thead><tr><th>Section</th><th>Actions</th></tr></thead><tbody>
      {guides.map((g)=><tr key={g}><td>{g}</td><td><ActionGroup items={[
        {label:"Open article",title:g,description:"Open help article panel.",variant:"panel"},
        {label:"Contact OnePad support",title:"Contact Support",description:"Send support request to OnePad operations.",variant:"modal",confirmLabel:"Send"},
        {label:"Report issue",title:"Report Issue",description:"Create issue ticket with environment details.",variant:"modal",confirmLabel:"Report"}
      ]}/></td></tr>)}
    </tbody></table></div></section>
  </AdminLayout>;
}

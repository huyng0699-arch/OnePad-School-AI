import AdminLayout from "../../components/AdminLayout";
import { ActionGroup } from "../../components/PageBits";

const reportTypes = [
  "School overview report",
  "Class aggregate report",
  "AI usage report",
  "Privacy readiness report",
  "Curriculum publishing report",
  "AR content report",
  "Audit report",
];

export default function ReportsPage() {
  return <AdminLayout active="reports" title="Reports Center" subtitle="Generate and schedule aggregate operations reports for school leadership.">
    <section className="section card solid"><div className="table-wrap"><table className="table"><thead><tr><th>Report</th><th>Period</th><th>Summary</th><th>Actions</th></tr></thead><tbody>
      {reportTypes.map((r)=><tr key={r}><td>{r}</td><td>2026 Q2</td><td>Operational aggregate metrics</td><td><ActionGroup items={[
        {label:"View report",title:r,description:"Title, period, summary cards, data table, export options.",variant:"drawer"},
        {label:"Export PDF",title:"Export PDF",description:"Generate PDF version.",variant:"modal",confirmLabel:"Export PDF"},
        {label:"Export CSV",title:"Export CSV",description:"Generate CSV version.",variant:"modal",confirmLabel:"Export CSV"},
        {label:"Schedule report",title:"Schedule Report",description:"Set automated reporting schedule.",variant:"modal",confirmLabel:"Schedule"}
      ]}/></td></tr>)}
    </tbody></table></div></section>
  </AdminLayout>;
}

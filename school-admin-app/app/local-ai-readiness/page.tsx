import AdminLayout from "../../components/AdminLayout";
import { ActionGroup } from "../../components/PageBits";
import { onepadApi } from "../../lib/api";

export default async function LocalAiReadinessPage() {
  const data = await onepadApi.dataset();
  const rows = data.students.slice(0, 20).map((s) => ({
    device: `device_${s.id}`,
    student: s.fullName,
    className: s.className,
    model: "gemma-4-e2b-it",
    quantization: "int4",
    status: s.deviceStatus,
    lastCheck: new Date(s.lastSyncAt).toLocaleString("en-US"),
    tests: s.localAiEvents > 20 ? "Pass" : "Retry",
  }));

  return <AdminLayout active="local-ai-readiness" title="Local AI Readiness" subtitle="Track device-level readiness, local generation health, and fallback dependency trends.">
    <section className="section grid cols-4">
      <div className="card"><div className="metric"><span>Ready devices</span><strong>{rows.filter((r)=>r.status==="Ready").length}</strong></div></div>
      <div className="card"><div className="metric"><span>Pending model download</span><strong>8</strong></div></div>
      <div className="card"><div className="metric"><span>Failed local AI</span><strong>5</strong></div></div>
      <div className="card"><div className="metric"><span>Cloud fallback dependency</span><strong>16%</strong></div></div>
      <div className="card"><div className="metric"><span>Gemma 4 E2B int4 usage</span><strong>1,350</strong></div></div>
    </section>
    <section className="section card solid"><div className="table-wrap"><table className="table"><thead><tr><th>Device</th><th>Student</th><th>Class</th><th>Model</th><th>Quantization</th><th>Status</th><th>Last check</th><th>Local tests</th><th>Actions</th></tr></thead><tbody>
      {rows.map((r)=><tr key={r.device}><td>{r.device}</td><td>{r.student}</td><td>{r.className}</td><td>{r.model}</td><td>{r.quantization}</td><td>{r.status}</td><td>{r.lastCheck}</td><td>{r.tests}</td><td><ActionGroup items={[
        {label:"View device",title:`Device: ${r.device}`,description:"App version, model, last local generation, fallback count, sync status.",variant:"drawer"},
        {label:"Mark for recheck",title:"Mark for Recheck",description:"Queue local AI readiness recheck.",variant:"modal",confirmLabel:"Mark"},
        {label:"Open student school-safe profile",title:"Student School-safe Profile",description:"Aggregate operational profile only.",variant:"panel"},
        {label:"Export readiness",title:"Export Readiness",description:"Export local AI readiness report.",variant:"modal",confirmLabel:"Export"}
      ]}/></td></tr>)}
    </tbody></table></div></section>
  </AdminLayout>;
}

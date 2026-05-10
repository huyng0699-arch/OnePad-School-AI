import AdminLayout from "../../components/AdminLayout";
import { ActionGroup } from "../../components/PageBits";
import { getApprovalInbox } from "../../lib/opsData";

export default function ApprovalInboxPage() {
  const rows = getApprovalInbox();
  const now = Date.now();

  return <AdminLayout active="approval-inbox" title="Approval Inbox" subtitle="Central approval workflow for privacy, AR content, and permissions with SLA tracking.">
    <section className="section grid cols-4">
      <div className="card"><div className="metric"><span>Total requests</span><strong>{rows.length}</strong></div></div>
      <div className="card"><div className="metric"><span>New</span><strong>{rows.filter(r=>r.status==="New").length}</strong></div></div>
      <div className="card"><div className="metric"><span>In review</span><strong>{rows.filter(r=>r.status==="In Review").length}</strong></div></div>
      <div className="card"><div className="metric"><span>SLA at risk</span><strong>{rows.filter(r => ((now - new Date(r.submittedAt).getTime()) / 3600000) > r.slaHours * 0.8 && r.status !== "Approved" && r.status !== "Rejected").length}</strong></div></div>
    </section>

    <section className="section card solid">
      <h3>Approval workflow queue</h3>
      <div className="table-wrap"><table className="table"><thead><tr><th>Category</th><th>Title</th><th>Requested by</th><th>Target</th><th>Submitted</th><th>SLA</th><th>Status</th><th>Risk</th><th>Actions</th></tr></thead><tbody>
        {rows.map((r) => {
          const elapsed = (now - new Date(r.submittedAt).getTime()) / 3600000;
          const slaState = elapsed > r.slaHours ? "Overdue" : `${Math.max(0, Math.round(r.slaHours - elapsed))}h left`;
          return <tr key={r.id}><td>{r.category}</td><td>{r.title}</td><td>{r.requestedBy}</td><td>{r.target}</td><td>{new Date(r.submittedAt).toLocaleString("en-US")}</td><td>{r.slaHours}h ({slaState})</td><td>{r.status}</td><td>{r.riskLevel}</td><td><ActionGroup items={[
            { label: "Open review", title: `${r.category} review`, description: "Review request details, policy impacts, and related audit entries.", variant: "drawer" },
            { label: "Approve", title: "Approve request", description: "Approve and generate audit entry.", variant: "modal", confirmLabel: "Approve" },
            { label: "Reject", title: "Reject request", description: "Reject with reason and notify requester.", variant: "modal", confirmLabel: "Reject" },
            { label: "Escalate", title: "Escalate request", description: "Escalate to school leadership when SLA risk is high.", variant: "modal", confirmLabel: "Escalate" }
          ]} /></td></tr>;
        })}
      </tbody></table></div>
    </section>
  </AdminLayout>;
}

import AdminLayout from "../../components/AdminLayout";
import AuditTable from "../../components/tables/AuditTable";
import { onepadApi } from "../../lib/api";

export default async function AuditLogPage() {
  const data = await onepadApi.dataset();
  const synced = await onepadApi.syncedAuditEvents();
  const rows = Array.isArray(synced.data) && synced.source === "live_backend" ? synced.data : data.auditLogs;

  return (
    <AdminLayout
      active="audit-log"
      title="Audit Log"
      subtitle="Track policy decisions, permission updates, blocked access, and governance operations."
    >
      <section className="section card">
        <div className="pill-row">
          <span className="badge">Permission</span>
          <span className="badge">Consent</span>
          <span className="badge">AI access</span>
          <span className="badge">Data export</span>
          <span className="badge red">Blocked access</span>
          <span className="badge">Admin action</span>
          <span className="badge">Teacher action</span>
          <span className="badge teal">Sync source: {synced.source}</span>
        </div>
      </section>
      <section className="section card solid"><AuditTable rows={rows} /></section>
    </AdminLayout>
  );
}

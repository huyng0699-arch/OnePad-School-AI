import AdminLayout from "../../components/AdminLayout";
import ActionLauncher from "../../components/ActionLauncher";

export default function DeveloperToolsPage() {
  const actions = ["Seed demo school", "Simulate class aggregate", "Simulate AI usage", "Simulate privacy block", "Simulate AR assignment", "Reset demo data"];
  return <AdminLayout active="developer-tools" title="Developer Tools" subtitle="Run demo-only simulation actions with confirmation and toast result.">
    <section className="section card solid"><div className="action-row">{actions.map((a) => <ActionLauncher key={a} label={a} title={a} description="This affects demo data only. Confirm to continue." variant="modal" confirmLabel="Confirm" />)}</div></section>
  </AdminLayout>;
}


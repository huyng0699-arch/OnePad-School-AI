import AdminLayout from "../../components/AdminLayout";
import OpsLogViewer from "../../components/ops/OpsLogViewer";
import { onepadApi } from "../../lib/api";

export default async function DeveloperDetailsPage() {
  const data = await onepadApi.dataset();
  return <AdminLayout active="developer-details" title="Developer Details" subtitle="Raw debug payloads are isolated here and hidden from operational dashboards.">
    <section className="section card solid">
      <h3>Debug payloads</h3>
      <p>Use this view only for development and troubleshooting.</p>
      <pre style={{ maxHeight: 520, overflow: "auto", whiteSpace: "pre-wrap" }}>{JSON.stringify(data, null, 2)}</pre>
    </section>
    <OpsLogViewer />
  </AdminLayout>;
}

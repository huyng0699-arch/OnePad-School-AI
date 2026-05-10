import AdminLayout from "../../components/AdminLayout";
import { onepadApi } from "../../lib/api";

export default async function AdminHealthWellbeingPage() {
  const result = await onepadApi.healthWellbeingOverview("school_001");
  const trend = await onepadApi.trendOverview("school_001");
  const data = result.data || {};
  return (
    <AdminLayout
      active="health-wellbeing"
      title="Health & Wellbeing Overview"
      subtitle="Aggregate school-level health and wellbeing indicators only."
      demoFallback={result.source !== "live_backend"}
    >
      <section className="section grid cols-4">
        <div className="card"><div className="metric"><span>Source</span><strong>{result.source}</strong></div></div>
        <div className="card"><div className="metric"><span>Total students</span><strong>{data.totalStudents ?? "-"}</strong></div></div>
        <div className="card"><div className="metric"><span>Medium alerts</span><strong>{data.alertMedium ?? 0}</strong></div></div>
        <div className="card"><div className="metric"><span>High alerts</span><strong>{data.alertHigh ?? 0}</strong></div></div>
      </section>
      <section className="section card solid">
        <p><b>Support requests:</b> {data.supportRequests ?? 0}</p>
        <p><b>Generated at:</b> {data.generatedAt ?? "n/a"}</p>
        <p className="footer-note">No raw private reflection is shown in this admin aggregate view.</p>
      </section>
      <section className="section card solid">
        <h3>Trend Overview</h3>
        <p>Source: {trend.source}</p>
        <p>Normal: {trend.data?.countsByLevel?.normal ?? 0} · Watch: {trend.data?.countsByLevel?.watch ?? 0} · Elevated: {trend.data?.countsByLevel?.elevated ?? 0}</p>
        <p>High: {trend.data?.countsByLevel?.high ?? 0} · Red: {trend.data?.countsByLevel?.red ?? 0}</p>
      </section>
    </AdminLayout>
  );
}


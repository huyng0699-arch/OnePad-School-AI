import AdminLayout from "../components/AdminLayout";
import { onepadApi } from "../lib/api";

export default async function OverviewPage() {
  const [overview, data] = await Promise.all([onepadApi.adminOverview(), onepadApi.dataset()]);
  const fallback = overview.source === "demo";
  return (
    <AdminLayout active="overview" title="School Operations Overview" subtitle="Aggregate-only operations, assignment coverage, AI usage, and privacy readiness." demoFallback={fallback}>
      <section className="section grid cols-4">
        <div className="card"><div className="metric"><span>Total students</span><strong>60</strong></div></div>
        <div className="card"><div className="metric"><span>Active teachers</span><strong>9</strong></div></div>
        <div className="card"><div className="metric"><span>Parent accounts</span><strong>60</strong></div></div>
        <div className="card"><div className="metric"><span>Classes</span><strong>3</strong></div></div>
        <div className="card"><div className="metric"><span>Subjects</span><strong>6</strong></div></div>
        <div className="card"><div className="metric"><span>Teaching assignments</span><strong>{data.assignments.length || data.classes.length * 6}</strong></div></div>
        <div className="card"><div className="metric"><span>Homeroom coverage</span><strong>3/3</strong></div></div>
        <div className="card"><div className="metric"><span>Privacy readiness</span><strong>ON</strong></div></div>
      </section>
    </AdminLayout>
  );
}


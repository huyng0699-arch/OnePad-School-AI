export const dynamic = "force-dynamic";

import ParentShell from "../../components/ParentShell";
import { onepadApi } from "../../lib/api";

export default async function ReportsPage() {
  const response = await onepadApi.reports() as any;
  const reports = Array.isArray(response.reports) ? response.reports : [];

  return (
    <ParentShell>
      <section className="section card solid parent-home-intro"><h2>Reports</h2><p>Daily, weekly, monthly, parent-safe learning, home support, privacy reports, and PDF export status.</p></section>
      <section className="section grid cols-3">{reports.length ? reports.map((report: any) => <div className="card solid" key={report.id || report.title}><h3>{report.title}</h3><p>{report.summary}</p><div className="pill-row section"><span className="badge">{report.action || "View report"}</span></div></div>) : <div className="card solid"><h3>No reports yet</h3><p>Backend should return daily, weekly, monthly, privacy, and exportable reports.</p></div>}</section>
    </ParentShell>
  );
}

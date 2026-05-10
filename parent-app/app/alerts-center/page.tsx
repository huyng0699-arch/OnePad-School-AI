import { onepadApi } from "../../lib/api";

export default async function AlertsCenterPage() {
  const resp = await onepadApi.parentAlerts("stu_003");
  const alerts = Array.isArray(resp?.alerts) ? resp.alerts : [];

  return <div className="shell"><main className="main"><section className="hero"><div className="hero-top"><div><div className="kicker">Alerts Center</div><h2>Parent-safe alerts</h2></div></div></section>
  <section className="section card solid"><div className="table-wrap"><table className="table"><thead><tr><th>Level</th><th>Summary</th><th>Action</th><th>Time</th></tr></thead><tbody>{alerts.length===0 ? <tr><td colSpan={4}>No active alerts.</td></tr> : alerts.map((a:any)=><tr key={a.id}><td>{String(a.level || "info").toUpperCase()}</td><td>{a.safeSummary || a.summary}</td><td>{a.recommendedAction || "Monitor"}</td><td>{a.createdAt || "-"}</td></tr>)}</tbody></table></div></section></main></div>;
}

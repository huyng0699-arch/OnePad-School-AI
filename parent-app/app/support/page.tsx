export const dynamic = "force-dynamic";

import Link from "next/link";
import ParentShell from "../../components/ParentShell";
import { formatDate, levelLabel, onepadApi } from "../../lib/api";

export default async function ParentSupportPage() {
  const [trend, alerts] = await Promise.all([onepadApi.getChildTrendReport(), onepadApi.parentAlerts()]);
  const alertList = Array.isArray(alerts.alerts) ? alerts.alerts : [];
  const supportNeeded = trend.level === "urgent" || trend.level === "attention" || trend.level === "monitor" || alertList.length > 0;

  return (
    <ParentShell>
      <section className="section card solid"><div className="section-title"><div><h2>Parent Support</h2><p>What parents can do at home and when to contact school.</p></div><span className="badge amber">{supportNeeded ? "Review needed" : "Stable"}</span></div></section>
      <section className="section card solid"><h3>{levelLabel(trend.level)}</h3><p>{trend.summary}</p><div className="care-grid section">{trend.suggestedActions.length ? trend.suggestedActions.map((action) => <div key={action}><span className="care-kicker">Action</span><strong>{action}</strong><p>Keep it calm, concrete, and low-pressure.</p></div>) : <div><span className="care-kicker">Backend</span><strong>No parent action returned yet</strong><p>Home support actions will appear here.</p></div>}</div><div className="pill-row section"><Link className="button-link" href="/messages">Message teacher</Link><Link className="button-link" href="/home-support-plan">Home Support Plan</Link></div></section>
      <section className="section card solid"><h3>Signals to monitor</h3>{alertList.length ? alertList.map((alert) => <div className="timeline-item" key={alert.id}><span>{levelLabel(alert.level)} · {formatDate(alert.createdAt)}</span><strong>{alert.title}</strong><p>{alert.summary}</p><small>{alert.recommendedAction}</small></div>) : <p>Backend has not returned monitor signals yet.</p>}</section>
    </ParentShell>
  );
}

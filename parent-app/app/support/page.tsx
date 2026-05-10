import Link from "next/link";
import { onepadApi } from "../../lib/api";

const STUDENT_ID = "stu_003";

function sourceLabel(source: string) {
  if (source === "live_backend") return "LIVE BACKEND";
  if (source === "local_cache") return "LOCAL CACHE";
  if (source === "demo_encrypted") return "DEMO ENCRYPTED DATA";
  return "DEMO DATA";
}

function providerLabel(provider: string) {
  if (provider === "gemma_local_cactus") return "GEMMA LOCAL";
  if (provider === "backend_cloud") return "BACKEND CLOUD";
  return "TEMPLATE FALLBACK";
}

export default async function ParentSupportPage() {
  const [trend, health] = await Promise.all([
    onepadApi.getChildTrendReport(STUDENT_ID),
    onepadApi.parentAlerts(STUDENT_ID),
  ]);

  return (
    <div className="shell"><main className="main">
      <section className="section card solid">
        <h3>Parent Support</h3>
        {(trend.redAlert || trend.level === "high" || trend.level === "red") ? (
          <div className="callout" style={{ border: "1px solid #ef4444" }}>
            <p><b>{trend.redAlert ? "RED ALERT" : "HIGH PRIORITY"}</b> · {trend.title}</p>
            <p>{trend.summary}</p>
            <p>{(trend.keyFactors || []).join(" · ")}</p>
            <ul>{(trend.suggestedActions || []).map((a: string) => <li key={a}>{a}</li>)}</ul>
            <p>{sourceLabel(trend.source)} · {providerLabel(trend.provider)}</p>
            <Link className="button-link" href="/health-wellbeing-vault">Open Vault</Link>
          </div>
        ) : <p>Monitoring mode: no high/red support item.</p>}
      </section>

      <section className="section card solid">
        <h3>Health alerts</h3>
        {(health.alerts || []).slice(0, 5).map((a: any) => (
          <div className="timeline-item" key={a.id}><strong>{String(a.level).toUpperCase()}</strong><p>{a.safeSummary || a.summary}</p></div>
        ))}
      </section>
    </main></div>
  );
}


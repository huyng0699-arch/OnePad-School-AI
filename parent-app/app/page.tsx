import Link from "next/link";
import { onepadApi } from "../lib/api";

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

export default async function ParentPage() {
  const [trend, chart] = await Promise.all([
    onepadApi.getChildTrendReport(STUDENT_ID),
    onepadApi.getChildTrendChart(STUDENT_ID, 7),
  ]);
  const redCard = trend.redAlert || trend.level === "red";

  return (
    <div className="shell"><main className="main">
      <section className="section card solid parent-home-intro">
        <h2>Parent Home</h2>
        <p>Student-focused dashboard for daily wellbeing, learning trend, and support actions.</p>
      </section>

      <section className="section card solid">
        <h3>Wellbeing & Learning Trend</h3>
        <p className="trend-meta"><b>Status:</b> {trend.level} · <b>Direction:</b> {trend.direction || trend.latestSummary?.direction || "stable"}</p>
        <p><b>Generated:</b> {trend.generatedAt}</p>
        <p><b>Source:</b> {sourceLabel(trend.source)} · <b>Provider:</b> {providerLabel(trend.provider)}</p>
        {redCard ? <div className="callout red-outline"><p><b>RED ALERT</b></p><p>{trend.summary}</p></div> : null}
        <p>{trend.summary}</p>
        <p>{(trend.keyFactors || []).slice(0, 3).join(" · ")}</p>
        <div className="pill-row">
          <Link className="button-link" href="/health-wellbeing-vault">View Health & Wellbeing Vault</Link>
          {(trend.level === "high" || trend.level === "red" || trend.redAlert)
            ? <Link className="button-link" href="/support">Open Parent Support</Link>
            : null}
        </div>
      </section>

      <section className="section card solid">
        <h3>7-day trend preview</h3>
        <div className="timeline-grid">
          {(chart.points || []).map((p: any) => (
            <div className="timeline-item" key={p.date}>
              <strong>{p.date}</strong>
              <p>{p.totalDeduction} ({p.level})</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section grid cols-2">
        <div className="card solid">
          <h3>Health & Wellbeing Vault</h3>
          <p>Open detailed trend history, category breakdown, and recommendation context.</p>
          <Link className="button-link" href="/health-wellbeing-vault">Open Vault</Link>
        </div>
        <div className="card solid">
          <h3>Parent Support</h3>
          <p>Check support priority, suggested actions, and safe summaries.</p>
          <Link className="button-link" href="/support">Open Support</Link>
        </div>
      </section>
    </main></div>
  );
}


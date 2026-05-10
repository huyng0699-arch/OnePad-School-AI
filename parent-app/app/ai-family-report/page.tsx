import { onepadApi } from "../../lib/api";

export default async function AiFamilyReportPage() {
  const trend = await onepadApi.getChildTrendReport("stu_003");
  const events = await onepadApi.parentAlerts("stu_003");

  return (
    <div className="shell">
      <main className="main">
        <section className="hero"><div className="hero-top"><div><div className="kicker">AI Family Report</div><h2>Weekly parent-safe trend report</h2></div></div></section>
        <section className="section card solid">
          <p><b>Provider:</b> {trend.provider}</p>
          <p><b>Source:</b> {trend.source}</p>
          <p><b>Title:</b> {trend.title}</p>
          <p><b>Summary:</b> {trend.summary}</p>
          <p><b>Key factors:</b> {(trend.keyFactors || []).join(" · ")}</p>
          <p><b>Suggested actions:</b> {(trend.suggestedActions || []).join(" · ")}</p>
          <p><b>Health alerts:</b> {Array.isArray(events?.alerts) ? events.alerts.length : 0}</p>
          <p><b>Privacy:</b> raw private text/chat is excluded from this report.</p>
        </section>
      </main>
    </div>
  );
}

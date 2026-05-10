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

export default async function HealthWellbeingVaultPage() {
  const [trend, vault, chart] = await Promise.all([
    onepadApi.getChildTrendReport(STUDENT_ID),
    onepadApi.healthVaultSummary(STUDENT_ID),
    onepadApi.getChildTrendChart(STUDENT_ID, 14),
  ]);
  const c = trend.categoryBreakdown || {};

  return (
    <div className="shell"><main className="main">
      <section className="section card solid">
        <h3>Wellbeing & Learning Trend Details</h3>
        <p>Source: {sourceLabel(trend.source)} · Provider: {providerLabel(trend.provider)}</p>
        <p>Packet: {trend.latestPacketId} · Report: {trend.reportId} · Generated: {trend.generatedAt}</p>
      </section>

      <section className="section card solid">
        <h3>14-day trend chart</h3>
        <div className="timeline-grid">
          {(chart.points || []).map((p: any) => <div className="timeline-item" key={p.date}><strong>{p.date}</strong><p>{p.totalDeduction} ({p.level})</p></div>)}
        </div>
      </section>

      <section className="section grid cols-3">
        <div className="card solid"><h3>Physical</h3><p>{JSON.stringify(c.physical?.metrics || {})}</p></div>
        <div className="card solid"><h3>Wellbeing</h3><p>{JSON.stringify(c.wellbeing?.metrics || {})}</p></div>
        <div className="card solid"><h3>Learning</h3><p>{JSON.stringify(c.learning?.metrics || {})}</p></div>
        <div className="card solid"><h3>AI conversation</h3><p>{JSON.stringify(c.conversation?.metrics || {})}</p></div>
        <div className="card solid"><h3>Teacher/Parent</h3><p>{JSON.stringify(c.teacherParent?.metrics || {})}</p></div>
      </section>

      <section className="section card solid">
        <h3>Gemma 4 Recommendation</h3>
        <p><b>{trend.title}</b></p>
        <p>{trend.summary}</p>
        <p>{(trend.keyFactors || []).join(" · ")}</p>
        <ul>{(trend.suggestedActions || []).map((a: string) => <li key={a}>{a}</li>)}</ul>
        <p>{providerLabel(trend.provider)} · {sourceLabel(trend.source)}</p>
      </section>

      <section className="section card solid">
        <h3>Data provenance</h3>
        <p>source: {sourceLabel(trend.source)}</p>
        <p>generatedAt: {trend.generatedAt}</p>
        <p>last nightly run: {trend.generatedAt}</p>
        <p>packetId: {trend.latestPacketId}</p>
        <p>reportId: {trend.reportId}</p>
      </section>

      <section className="section card solid">
        <h3>Health & Wellbeing Vault</h3>
        <p>{vault.vault?.readiness?.safeSummary || vault.vault?.latestSignal || "No summary."}</p>
      </section>
    </main></div>
  );
}


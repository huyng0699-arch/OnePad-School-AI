export const dynamic = "force-dynamic";

import ParentShell from "../../components/ParentShell";
import { levelLabel, onepadApi } from "../../lib/api";

export default async function AiFamilyReportPage() {
  const [trend, family] = await Promise.all([onepadApi.getChildTrendReport(), onepadApi.familyReport()]) as any;
  const report = family.report || {};
  const recommendedHomePlan = Array.isArray(report.recommendedHomePlan) ? report.recommendedHomePlan : [];

  return (
    <ParentShell>
      <section className="section card solid parent-home-intro"><div className="section-title"><div><h2>AI Family Report</h2><p>Parent-safe summary of learning, health routine, confidence, social integration, and home support.</p></div><span className="badge">{levelLabel(trend.level)}</span></div></section>
      <section className="section grid cols-2">
        <div className="card solid"><h3>Overall learning summary</h3><p>{report.overall || "Backend has not returned an overall summary yet."}</p></div>
        <div className="card solid"><h3>Subject-by-subject pattern</h3><p>{report.subjectPattern || "Backend has not returned subject patterns yet."}</p></div>
        <div className="card solid"><h3>Health and routine</h3><p>{report.healthRoutine || "Backend has not returned a routine summary yet."}</p></div>
        <div className="card solid"><h3>Learning confidence</h3><p>{report.wellbeingConfidence || "Backend has not returned confidence signals yet."}</p></div>
        <div className="card solid"><h3>Social integration</h3><p>{report.socialIntegration || "Backend has not returned social integration summary yet."}</p></div>
        <div className="card solid"><h3>Recommended home plan</h3>{recommendedHomePlan.length ? <ul>{recommendedHomePlan.map((item: string) => <li key={item}>{item}</li>)}</ul> : <p>Backend has not returned a home plan yet.</p>}</div>
      </section>
      <section className="section card solid"><h3>Privacy and sharing status</h3><p>{report.privacyStatus || "Backend has not returned privacy status yet."}</p></section>
    </ParentShell>
  );
}

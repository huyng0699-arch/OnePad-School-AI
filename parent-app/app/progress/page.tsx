export const dynamic = "force-dynamic";

import ParentShell from "../../components/ParentShell";
import { formatDate, onepadApi } from "../../lib/api";

export default async function ParentProgressPage() {
  const [reportResponse, timelineResponse] = await Promise.all([onepadApi.parentReport(), onepadApi.progressTimeline()]) as any;
  const report = reportResponse.report || {};
  const events = Array.isArray(timelineResponse.events) ? timelineResponse.events : [];

  return (
    <ParentShell>
      <section className="section card solid parent-home-intro"><h2>Progress Timeline</h2><p>Lessons, quizzes, assignments, AR lessons, AI Tutor summaries, and teacher notes.</p></section>
      <section className="section card solid"><h3>Summary</h3><p>{report.progressSummary || report.overall || "Backend has not returned a progress summary yet."}</p></section>
      <section className="section card solid"><h3>Recent parent-safe history</h3><div className="timeline-grid">{events.length ? events.map((event: any) => <div className="timeline-item" key={event.id || `${event.date}-${event.title}`}><span>{formatDate(event.date)} · {event.type}</span><strong>{event.title}</strong><small>{event.summary}</small></div>) : <div className="timeline-item"><span>Backend</span><strong>No timeline events returned yet</strong></div>}</div></section>
    </ParentShell>
  );
}

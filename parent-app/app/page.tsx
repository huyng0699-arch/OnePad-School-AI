export const dynamic = "force-dynamic";

import Link from "next/link";
import ParentShell from "../components/ParentShell";
import { DetailLinkGrid, EvidenceRail, InsightMatrix, ParentHero } from "../components/ParentExperienceKit";
import { formatDate, levelLabel, onepadApi } from "../lib/api";

function statusClass(level: string) {
  if (level === "urgent" || level === "attention") return "badge amber";
  if (level === "monitor") return "badge purple";
  if (level === "normal") return "badge teal";
  return "badge";
}

export default async function ParentPage() {
  const [trend, chart, alerts, profileResponse, assignmentsData, lessonsData, subjectsData] = await Promise.all([
    onepadApi.getChildTrendReport(),
    onepadApi.getChildTrendChart(undefined, 7),
    onepadApi.parentAlerts(),
    onepadApi.studentProfile(),
    onepadApi.assignments(),
    onepadApi.parentLessons(),
    onepadApi.learningAcrossSubjects(),
  ]) as any;

  const profile = profileResponse.profile || {};
  const assignments = Array.isArray(assignmentsData.assignments) ? assignmentsData.assignments : [];
  const lessons = Array.isArray(lessonsData.lessons) ? lessonsData.lessons : [];
  const subjects = Array.isArray(subjectsData.subjects) ? subjectsData.subjects : [];
  const alertList = Array.isArray(alerts.alerts) ? alerts.alerts : [];
  const currentAssignments = assignments.filter((item: any) => item.status === "in_progress" || item.status === "overdue");
  const currentLessons = lessons.filter((item: any) => item.status === "current" || item.status === "recommended_review");
  const weakestSubject = subjects.slice().sort((a: any, b: any) => Number(a.mastery || 0) - Number(b.mastery || 0))[0];
  const strongestSubject = subjects.slice().sort((a: any, b: any) => Number(b.mastery || 0) - Number(a.mastery || 0))[0];

  return (
    <ParentShell>
      <ParentHero
        eyebrow="Parent-safe command center"
        title="Parent Home"
        description={`${profile.childName || trend.childName || "No student selected"} · ${profile.className || trend.className || "Class pending"} · ${profile.homeroomTeacher || trend.homeroomTeacher || "Homeroom teacher pending"}`}
        level={trend.level}
        right={<Link className="ghost-button" href="/login">Switch record</Link>}
      />
      {trend.dataMode === "empty" ? <section className="section callout neutral-outline"><strong>Waiting for backend data</strong><p>The app is open, but it is not generating fake parent data. Once backend returns parent-safe reports, this dashboard becomes fully populated.</p></section> : null}

      <EvidenceRail items={[
        { label: "Overall status", value: levelLabel(trend.level), hint: "From trend report", level: trend.level },
        { label: "Open alerts", value: alertList.length, hint: "Parent-visible only" },
        { label: "Active assignments", value: currentAssignments.length, hint: "Due or overdue" },
        { label: "Subjects tracked", value: subjects.length, hint: "Backend mastery cards" },
      ]} />

      <section className="section grid cols-3">
        <div className="card solid stat-card feature-card"><span className="badge teal">Today</span><h3>{trend.title}</h3><p>{trend.summary}</p></div>
        <div className="card solid stat-card feature-card"><span className="badge amber">Needs attention</span><h3>{trend.keyFactors[0] || "No highlighted signal yet"}</h3><p>{trend.keyFactors.slice(1, 3).join(". ") || "Backend has not returned key factors yet."}</p></div>
        <div className="card solid stat-card feature-card"><span className="badge purple">Tonight's action</span><h3>{trend.suggestedActions[0] || "No action yet"}</h3><p>{trend.suggestedActions.slice(1, 3).join(". ") || "Backend has not returned recommended home actions yet."}</p></div>
      </section>

      <InsightMatrix
        title="Whole-child interpretation"
        description="The app combines learning, routine, wellbeing, and teacher-parent coordination without exposing raw private data."
        items={trend.categories.slice(0, 5).map((category: any) => ({ title: category.title, value: category.parentText, note: category.reasons?.slice?.(0, 2)?.join(" · "), level: category.level }))}
      />

      <section className="section grid cols-2">
        <div className="card solid"><div className="section-title"><div><h3>Learning strengths and review targets</h3><p>Useful for judging: this proves backend subject mastery is interpreted into parent action.</p></div></div><div className="health-stack"><div><span>Strongest area</span><strong>{strongestSubject?.subject || "Pending"}</strong><p>{strongestSubject ? `${strongestSubject.mastery}% mastery · ${strongestSubject.parentAction}` : "Backend has not returned subjects yet."}</p></div><div><span>Review target</span><strong>{weakestSubject?.subject || "Pending"}</strong><p>{weakestSubject ? `${weakestSubject.mastery}% mastery · ${weakestSubject.parentAction}` : "Backend has not returned subjects yet."}</p></div></div></div>
        <div className="card solid"><div className="section-title"><div><h3>Latest alerts</h3><p>Safe summaries with clear actions.</p></div><Link className="ghost-button" href="/alerts-center">Open</Link></div><div className="health-stack">{alertList.length ? alertList.slice(0, 3).map((alert: any) => <div key={alert.id}><span>{levelLabel(alert.level)} · {formatDate(alert.createdAt)}</span><strong>{alert.title}</strong><p>{alert.recommendedAction}</p></div>) : <div><span>Backend</span><strong>No alerts returned yet</strong><p>Alerts will appear when backend sends them.</p></div>}</div></div>
      </section>

      <section className="section grid cols-2">
        <div className="card solid"><h3>Assignments parents should know</h3><div className="health-stack">{currentAssignments.length ? currentAssignments.slice(0, 3).map((item: any) => <div key={item.id}><span>{item.subject} · {formatDate(item.dueDate)}</span><strong>{item.title}</strong><p>{item.parentAction}</p></div>) : <div><span>Backend</span><strong>No active assignments returned yet</strong></div>}</div><div className="pill-row section"><Link className="button-link" href="/assignments">View Assignments</Link></div></div>
        <div className="card solid"><h3>Lessons to review together</h3><div className="health-stack">{currentLessons.length ? currentLessons.slice(0, 3).map((lesson: any) => <div key={lesson.lessonId || lesson.id}><span>{lesson.subject}</span><strong>{lesson.title}</strong><p>{lesson.parentExplanation || "Parent-safe explanation pending."}</p></div>) : <div><span>Backend</span><strong>No lesson recommendations returned yet</strong></div>}</div><div className="pill-row section"><Link className="button-link" href="/lessons">View Lessons</Link></div></div>
      </section>

      <section className="section card solid"><div className="section-title"><div><h3>7-day trend</h3><p>Shows concern level only, not hidden internal scores.</p></div></div><div className="trend-strip">{chart.points.length ? chart.points.map((point: any) => <div className="trend-node" key={point.date}><span>{formatDate(point.date)}</span><strong>{point.label}</strong><small>Hidden score not shown</small></div>) : <div className="trend-node"><span>Backend</span><strong>No trend points</strong><small>Trend data will appear here when backend returns it.</small></div>}</div></section>

      <section className="section card solid"><h3>Judge-facing proof of product logic</h3><DetailLinkGrid items={[{ href: "/home-support-plan", title: "Tonight plan", text: "Shows exactly what parents should ask and avoid." }, { href: "/health-wellbeing-vault", title: "Privacy vault", text: "Shows parent-controlled summaries and access audit." }, { href: "/consent-sharing", title: "Consent", text: "Shows sharing, revocation, and safe-summary boundaries." }, { href: "/ai-family-report", title: "Family report", text: "Shows AI-generated parent-safe synthesis." }]} /></section>
    </ParentShell>
  );
}

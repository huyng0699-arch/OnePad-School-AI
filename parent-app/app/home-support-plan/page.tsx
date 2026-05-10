export const dynamic = "force-dynamic";

import ParentShell from "../../components/ParentShell";
import { DetailLinkGrid, EvidenceRail, ParentHero, SupportPlanBoard } from "../../components/ParentExperienceKit";
import { onepadApi } from "../../lib/api";

export default async function HomeSupportPlanPage(){
  const [planResponse, alertsResponse, subjectResponse] = await Promise.all([
    onepadApi.homeSupportPlan(),
    onepadApi.parentAlerts(),
    onepadApi.learningAcrossSubjects(),
  ]) as any;
  const plan = planResponse.plan || {};
  const alerts = Array.isArray(alertsResponse.alerts) ? alertsResponse.alerts : [];
  const subjects = Array.isArray(subjectResponse.subjects) ? subjectResponse.subjects : [];
  const reviewItems = Array.isArray(plan.reviewItems) ? plan.reviewItems : [];

  return (
    <ParentShell>
      <ParentHero
        eyebrow="Parent action system"
        title="Home Support Plan"
        description="A calm, structured plan that tells parents exactly what to ask, what to review, what to avoid, and when to contact school."
      />
      <EvidenceRail items={[
        { label: "Open alerts", value: alerts.length, hint: "Parent-visible signals" },
        { label: "Review targets", value: reviewItems.length, hint: "From backend plan" },
        { label: "Subjects tracked", value: subjects.length, hint: "Mastery cards from backend" },
        { label: "Support window", value: plan.supportTime || "Pending", hint: "Short session only" },
      ]} />
      <SupportPlanBoard plan={plan} />
      <section className="section card solid">
        <h3>Connected parent workflows</h3>
        <DetailLinkGrid items={[
          { href: "/alerts-center", title: "Open Alerts Center", text: "See evidence count, confidence, and safe summary." },
          { href: "/learning-across-subjects", title: "Review subject mastery", text: "Check weak skills by subject before talking to the child." },
          { href: "/messages", title: "Message the teacher", text: "Use the plan only if the same signal repeats." },
          { href: "/privacy", title: "Check privacy rules", text: "Confirm that no raw private data is shown." },
        ]} />
      </section>
    </ParentShell>
  );
}

export const dynamic = "force-dynamic";

import ParentShell from "../../components/ParentShell";
import { EvidenceRail, LoginAccountGrid, ParentHero } from "../../components/ParentExperienceKit";
import { getParentSession, onepadApi } from "../../lib/api";
import { selectParentLogin, signOutParent } from "./actions";

export default async function LoginPage() {
  const session = getParentSession();
  const response = await onepadApi.loginOptions() as any;
  const accounts = Array.isArray(response.accounts) ? response.accounts : [];

  return (
    <ParentShell>
      <ParentHero
        eyebrow="Backend login selector"
        title="Select a parent-student record"
        description="No password is required in the demo yet. The Parent App must choose a backend record before rendering a real parent view."
        right={<form action={signOutParent}><button className="ghost-button" type="submit">Clear session</button></form>}
      />

      <EvidenceRail items={[
        { label: "Backend records", value: accounts.length, hint: "Loaded from /v1/parent/login-options" },
        { label: "Current parent", value: session.parentId || "None", hint: "Cookie or environment" },
        { label: "Current student", value: session.studentName || session.studentId || "None", hint: session.studentName ? "Selected from backend" : "Not selected yet" },
        { label: "Mode", value: response.backendConnected ? "Backend" : "Waiting", hint: response.backendError || "Backend-driven selector" },
      ]} />

      <section className="section card solid">
        <div className="section-title"><div><h3>Available backend parent-student records</h3><p>Select one record. The app will store parentId, studentId, student name, class, and school in cookies for the current session.</p></div></div>
        <LoginAccountGrid accounts={accounts} action={selectParentLogin} />
      </section>
    </ParentShell>
  );
}

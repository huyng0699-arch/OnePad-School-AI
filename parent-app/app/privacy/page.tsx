export const dynamic = "force-dynamic";

import ParentShell from "../../components/ParentShell";
import { onepadApi } from "../../lib/api";

export default async function ParentPrivacyPage() {
  const response = await onepadApi.privacyCenter() as any;
  const privacy = Array.isArray(response.privacy) ? response.privacy : [];

  return (
    <ParentShell>
      <section className="section card solid parent-home-intro"><h2>Privacy Center</h2><p>What parents, teachers, and school admins can see. Raw chat, hidden internal scores, and raw health data remain protected by default.</p></section>
      <section className="section grid cols-2">{privacy.length ? privacy.map((row: any) => <div className="card solid" key={row.role}><h3>{row.role}</h3><p>{row.canSee}</p></div>) : <div className="card solid"><h3>No privacy policy returned yet</h3><p>Backend should return parent, teacher, school-admin, and never-shared views.</p></div>}</section>
    </ParentShell>
  );
}

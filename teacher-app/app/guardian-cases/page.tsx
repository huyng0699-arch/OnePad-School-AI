import GuardianConsole from "../../components/guardian/GuardianConsole";
import { onepadApi } from "../../lib/api";

export default async function GuardianCasesPage(){
  const { protectedStudentProfiles } = await onepadApi.dataset();
  return <>
    <section className="hero"><div className="hero-top"><div><div className="kicker">Teacher Guardian Console</div><h2>Homeroom guardian mode connected to parent consent and student mobile logs.</h2><p>Advanced sharing unlocks parent-approved health, wellbeing, social integration, and daily AI reports for protected students only.</p></div><div className="status-pill"><span className="dot" /> Consent gated</div></div></section>
    <section className="section grid cols-3"><div className="card"><div className="metric"><span>Protected students</span><strong>{protectedStudentProfiles.length}</strong></div></div><div className="card"><div className="metric"><span>Parent app linked</span><strong>2/2</strong></div></div><div className="card"><div className="metric"><span>Mobile log sync</span><strong>Live</strong></div></div></section>
    <GuardianConsole profiles={protectedStudentProfiles} />
  </>;
}

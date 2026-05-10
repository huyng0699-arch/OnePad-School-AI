export const dynamic = "force-dynamic";

import ParentShell from "../../components/ParentShell";
import { onepadApi } from "../../lib/api";

export default async function GroupWorkPage() {
  const response = await onepadApi.groupWork() as any;
  const groups = Array.isArray(response.groups) ? response.groups : [];

  return (
    <ParentShell>
      <section className="section card solid parent-home-intro"><h2>Group Work</h2><p>Group task summary, child contribution, participation trend, and parent-safe social support.</p></section>
      <section className="section grid cols-2">{groups.length ? groups.map((item: any) => <div className="card solid" key={item.id || item.title}><h3>{item.title}</h3><p>{item.contribution}</p><div className="health-stack section"><div><span>Participation trend</span><strong>{item.trend}</strong></div><div><span>Parent support</span><strong>{item.support}</strong></div></div></div>) : <div className="card solid"><h3>No group-work data yet</h3><p>Backend should return group task and social integration summaries.</p></div>}</section>
    </ParentShell>
  );
}

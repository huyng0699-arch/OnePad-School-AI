export const dynamic = "force-dynamic";

import ParentShell from "../../components/ParentShell";
import { onepadApi } from "../../lib/api";

export default async function ArLearningPage() {
  const response = await onepadApi.arLessons() as any;
  const arLessons = Array.isArray(response.arLessons) ? response.arLessons : [];

  return (
    <ParentShell>
      <section className="section card solid parent-home-intro"><h2>AR Learning</h2><p>AR tasks sent by teachers, learning goal, status, quiz result, and parent questions.</p></section>
      <section className="section grid cols-2">{arLessons.length ? arLessons.map((item: any) => <div className="card solid" key={item.id || item.title}><span className="badge">{item.status}</span><h3>{item.title}</h3><p>{item.subject} · {item.goal}</p><div className="health-stack section"><div><span>AR quiz result</span><strong>{item.quizResult || "Pending"}</strong></div><div><span>Parent question</span><strong>{item.parentQuestion || "Pending"}</strong></div></div></div>) : <div className="card solid"><h3>No AR lessons yet</h3><p>Backend should return AR assignments and parent-safe questions.</p></div>}</section>
    </ParentShell>
  );
}

import { onepadApi } from "../../lib/api";

export default async function TeacherSupportPage(){
  const queueResp = await onepadApi.supportQueue();
  const queue = Array.isArray(queueResp.data) ? queueResp.data : [];

  return <div className="shell"><main className="main"><section className="hero"><div className="hero-top"><div><div className="kicker">Support Queue</div><h2>Safe support-only queue</h2><p className="footer-note">Data source: {queueResp.source}</p></div></div></section><section className="section card solid"><ul>{queue.length === 0 ? <li>No active support queue.</li> : queue.slice(0,20).map((s:any)=><li key={`${s.studentId}-${s.generatedAt}`}>{s.studentName} ({s.studentId}) · {s.level} · {s.summary}</li>)}</ul></section></main></div>;
}

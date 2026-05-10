import { onepadApi } from "../../lib/api";

export default async function HomeroomClassPage(){
  const { class8AStudents, guardianCases } = await onepadApi.dataset();
  return <div className="shell"><main className="main"><section className="hero"><div className="hero-top"><div><div className="kicker">Homeroom Class</div><h2>Class 8A - Homeroom Dashboard</h2></div></div></section>
  <section className="section grid cols-4"><div className="card"><div className="metric"><span>Students</span><strong>20</strong></div></div><div className="card"><div className="metric"><span>Need learning review</span><strong>4</strong></div></div><div className="card"><div className="metric"><span>Pending support requests</span><strong>3</strong></div></div><div className="card"><div className="metric"><span>Assignment completion</span><strong>82%</strong></div></div></section>
  <section className="section card solid"><div className="table-wrap"><table className="table"><thead><tr><th>Student</th><th>Overall learning trend</th><th>Missing assignments</th><th>Support status</th><th>Parent contact status</th><th>Last sync</th><th>Actions</th></tr></thead><tbody>{class8AStudents.map((s:any)=><tr key={s.id}><td>{s.fullName}</td><td>{s.trend}</td><td>{s.missingAssignments}</td><td>{s.supportSignals>0?"Needs follow-up":"Normal"}</td><td>{s.supportSignals>0?"Pending":"Healthy"}</td><td>{s.lastSync}</td><td>Open student profile · Add homeroom note · Message parent · Assign review task · Mark follow-up</td></tr>)}</tbody></table></div><p className="footer-note">Guardian cases in class: {guardianCases.length}. No raw private text.</p></section></main></div>;
}


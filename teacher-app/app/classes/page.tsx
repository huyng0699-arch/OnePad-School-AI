import { onepadApi } from "../../lib/api";

export default async function SubjectTeacherPage(){
  const { class8AStudents } = await onepadApi.dataset();
  const avg = Math.round(class8AStudents.reduce((a:number,s:any)=>a+s.biologyMastery,0)/class8AStudents.length);
  return <div className="shell"><main className="main"><section className="hero"><div className="hero-top"><div><div className="kicker">Subject Teacher</div><h2>Biology Class 8A Dashboard</h2></div></div></section>
  <section className="section grid cols-4"><div className="card"><div className="metric"><span>Biology mastery average</span><strong>{avg}%</strong></div></div><div className="card"><div className="metric"><span>Weakest concept</span><strong>Cell membrane transport</strong></div></div><div className="card"><div className="metric"><span>Students needing review</span><strong>{class8AStudents.filter((s:any)=>s.biologyMastery<65).length}</strong></div></div><div className="card"><div className="metric"><span>AR completion</span><strong>68%</strong></div></div></section>
  <section className="section card solid"><h3>Actions</h3><p>Assign Biology review · Create quiz · Assign AR cell model · Message homeroom teacher</p></section></main></div>;
}


import { onepadApi } from "../../lib/api";

export default async function TeacherStudentsPage(){
  const { class8AStudents } = await onepadApi.dataset();
  return <div className="shell"><main className="main"><section className="hero"><div className="hero-top"><div><div className="kicker">Students</div><h2>Scope-aware student profiles</h2><p>Open student from Subject Teacher, Homeroom, or Guardian Cases to get scope-specific safe data.</p></div></div></section>
  <section className="section card solid"><div className="table-wrap"><table className="table"><thead><tr><th>Student</th><th>Biology mastery</th><th>Math</th><th>Literature</th><th>English</th><th>AR progress</th><th>Actions</th></tr></thead><tbody>{class8AStudents.map((s:any)=><tr key={s.id}><td>{s.fullName}</td><td>{s.biologyMastery}</td><td>{s.mathMastery}</td><td>{s.literatureMastery}</td><td>{s.englishMastery}</td><td>{s.arProgress}</td><td>Assign review · Create quiz · Add teacher note · Message parent · Request parent consent · Open AR progress</td></tr>)}</tbody></table></div></section></main></div>;
}


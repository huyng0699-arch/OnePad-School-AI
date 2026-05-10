import { onepadApi } from "../../lib/api";

export default async function ParentAssignmentsPage() {
  const data = await onepadApi.parentLessons();
  const lessons = Array.isArray(data?.lessons) ? data.lessons : [];
  return <div className="shell"><main className="main"><section className="hero"><div className="hero-top"><div><div className="kicker">Assignments</div><h2>Home assignment visibility</h2></div></div></section><section className="section card solid"><div className="table-wrap"><table className="table"><thead><tr><th>Lesson</th><th>Subject</th><th>Grade</th><th>Published</th></tr></thead><tbody>{lessons.length===0 ? <tr><td colSpan={4}>No active lesson assignments.</td></tr> : lessons.map((s:any)=><tr key={s.lessonId}><td>{s.lessonId}</td><td>{s.subject}</td><td>{s.grade}</td><td>{s.publishedAt}</td></tr>)}</tbody></table></div></section></main></div>;
}

import { onepadApi } from "../../lib/api";

export default async function LearningAcrossSubjectsPage() {
  const trend = await onepadApi.getChildTrendReport("stu_003");
  const c = trend?.categoryBreakdown || {};
  const rows = [
    ["Physical", c?.physical?.score, (c?.physical?.reasons || []).join(", ")],
    ["Wellbeing", c?.wellbeing?.score, (c?.wellbeing?.reasons || []).join(", ")],
    ["Learning", c?.learning?.score, (c?.learning?.reasons || []).join(", ")],
    ["Conversation", c?.conversation?.score, (c?.conversation?.reasons || []).join(", ")],
    ["Teacher/Parent", c?.teacherParent?.score, (c?.teacherParent?.reasons || []).join(", ")],
  ];

  return <div className="shell"><main className="main"><section className="hero"><div className="hero-top"><div><div className="kicker">Learning Across Subjects</div><h2>Cross-domain learning and wellbeing view</h2></div></div></section>
  <section className="section card solid"><div className="table-wrap"><table className="table"><thead><tr><th>Category</th><th>Score</th><th>Reasons</th></tr></thead><tbody>{rows.map((s:any)=><tr key={s[0]}><td>{s[0]}</td><td>{s[1] ?? 0}</td><td>{s[2] || "-"}</td></tr>)}</tbody></table></div></section></main></div>;
}

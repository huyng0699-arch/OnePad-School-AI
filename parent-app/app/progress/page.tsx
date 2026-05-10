import { onepadApi } from "../../lib/api";

export default async function ParentProgressPage() {
  const report = await onepadApi.parentReport("stu_003");
  const payload = report?.report || report;
  return <div className="shell"><main className="main"><section className="hero"><div className="hero-top"><div><div className="kicker">Progress</div><h2>Parent-friendly progress timeline</h2></div></div></section><section className="section card solid"><p>{payload?.progressSummary || "No progress summary available."}</p></section></main></div>;
}

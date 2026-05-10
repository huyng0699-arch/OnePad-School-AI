import { onepadApi } from "../../lib/api";

export default async function TeacherAiUsagePage(){
  const usage = await onepadApi.adminAiUsage();
  return <div className="shell"><main className="main"><section className="hero"><div className="hero-top"><div><div className="kicker">AI Usage</div><h2>Local and cloud usage snapshot</h2></div></div></section><section className="section card solid"><p>Local AI events: {usage.localAiEvents} · Cloud fallback events: {usage.cloudAiEvents}</p><div className="table-wrap"><table className="table"><thead><tr><th>Model</th><th>Quantization</th><th>Count</th><th>Success</th><th>Error</th></tr></thead><tbody>{(usage.models||[]).map((m:any)=><tr key={m.modelId+m.quantization}><td>{m.modelId}</td><td>{m.quantization}</td><td>{m.count}</td><td>{m.success}</td><td>{m.error}</td></tr>)}</tbody></table></div></section></main></div>;
}

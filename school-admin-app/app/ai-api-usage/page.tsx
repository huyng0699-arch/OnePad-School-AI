import AdminLayout from "../../components/AdminLayout";
import { DemoFallbackPill } from "../../components/PageBits";
import AiUsageTable from "../../components/tables/AiUsageTable";
import { onepadApi } from "../../lib/api";

export default async function AiApiUsagePage() {
  const usage = await onepadApi.aiUsage();
  const data = usage.data as any;
  const rows = [
    { time: "Today, 09:00", class: "8A", provider: "Local", model: "gemma-4-e2b-it", keyId: "key_demo_01", requests: 580, tokens: 21000, cost: "$0.00", status: "Healthy" },
    { time: "Today, 09:00", class: "8B", provider: "Cloud", model: "gemini-2.5-flash", keyId: "key_demo_02", requests: 97, tokens: 8900, cost: "$0.01", status: "Fallback" },
    { time: "Today, 09:00", class: "8C", provider: "Local", model: "gemma-4-e2b-it", keyId: "key_demo_03", requests: 673, tokens: 24400, cost: "$0.00", status: "Healthy" },
  ];
  return <AdminLayout active="ai-api-usage" title="AI / API Usage" subtitle="Monitor local-first AI operations, cloud fallback posture, model policy, and cost governance." demoFallback={usage.source==="demo"}>
    <section className="section grid cols-4">
      <div className="card"><div className="metric"><span>Local AI events</span><strong>{data.localAiEvents}</strong></div></div>
      <div className="card"><div className="metric"><span>Cloud fallback events</span><strong>{data.cloudFallbackEvents ?? data.cloudAiEvents ?? 226}</strong></div></div>
      <div className="card"><div className="metric"><span>Estimated cloud cost</span><strong>${data.estimatedCloudCost ?? "0.01"}</strong></div></div>
      <div className="card"><div className="metric"><span>Token estimate</span><strong>{data.tokenEstimate ?? 120430}</strong></div></div>
      <div className="card"><div className="metric"><span>Average latency</span><strong>{data.averageLatencyMs ?? 128}ms</strong></div></div>
      <div className="card"><div className="metric"><span>Failed requests</span><strong>{data.failedRequests ?? 18}</strong></div></div>
      <div className="card"><div className="metric"><span>Model coverage</span><strong>{(data.models||[]).length}</strong></div></div>
      <div className="card"><div className="metric"><span>Device count</span><strong>{data.deviceCount ?? 60}</strong></div></div>
    </section>
    <section className="section card solid"><h3>Usage analytics</h3>{usage.source==="demo"?<DemoFallbackPill/>:null}<AiUsageTable rows={rows} /></section>
  </AdminLayout>;
}

import AdminLayout from "../../components/AdminLayout";
import { ActionGroup } from "../../components/PageBits";

const items = [
  { item: "Core plan", usage: "School Ops Pro", limit: "1 tenant", cost: "$299", status: "Active" },
  { item: "AI usage", usage: "39,100 requests", limit: "120,000 requests", cost: "$0.01", status: "Within limit" },
  { item: "Storage", usage: "28 GB", limit: "100 GB", cost: "$12", status: "Healthy" },
];

export default function BillingPage() {
  return <AdminLayout active="billing" title="Billing" subtitle="Track plan, usage, and cost posture. Billing workflow is demo-ready for future production integration.">
    <section className="section grid cols-4">
      <div className="card"><div className="metric"><span>Plan</span><strong>Ops Pro</strong></div></div>
      <div className="card"><div className="metric"><span>Active users</span><strong>129</strong></div></div>
      <div className="card"><div className="metric"><span>AI usage</span><strong>39,100</strong></div></div>
      <div className="card"><div className="metric"><span>Estimated monthly cost</span><strong>$311</strong></div></div>
    </section>
    <section className="section card solid"><div className="table-wrap"><table className="table"><thead><tr><th>Item</th><th>Usage</th><th>Limit</th><th>Cost</th><th>Status</th><th>Actions</th></tr></thead><tbody>
      {items.map((r)=> <tr key={r.item}><td>{r.item}</td><td>{r.usage}</td><td>{r.limit}</td><td>{r.cost}</td><td>{r.status}</td><td><ActionGroup items={[
        {label:"View invoice",title:"Invoice Detail",description:"Open invoice detail panel.",variant:"drawer"},
        {label:"Download receipt",title:"Download Receipt",description:"Prepare billing receipt file.",variant:"modal",confirmLabel:"Download"},
        {label:"Contact sales",title:"Contact Sales",description:"Send plan upgrade request to OnePad sales.",variant:"modal",confirmLabel:"Send"},
        {label:"Upgrade plan",title:"Upgrade Plan",description:"Preview upgrade plan options and add-ons.",variant:"drawer"}
      ]}/></td></tr>)}
    </tbody></table></div></section>
  </AdminLayout>;
}

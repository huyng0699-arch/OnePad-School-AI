"use client";
import { ActionGroup } from "../PageBits";
import TableFrame from "./TableFrame";

export default function AiUsageTable({ rows }: { rows: any[] }) {
  return <TableFrame rows={rows} pageSize={10} columns={[
    { key: "time", label: "Time", sortable: true },
    { key: "class", label: "Class", sortable: true },
    { key: "provider", label: "Provider", sortable: true },
    { key: "model", label: "Model", sortable: true },
    { key: "keyId", label: "Key ID", sortable: true },
    { key: "requests", label: "Requests", sortable: true },
    { key: "tokens", label: "Tokens estimated", sortable: true },
    { key: "cost", label: "Cost estimated", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { key: "time", label: "Actions" },
  ]} renderRow={(r)=><tr key={`${r.time}-${r.class}-${r.model}`}><td>{r.time}</td><td>{r.class}</td><td>{r.provider}</td><td>{r.model}</td><td>{r.keyId}</td><td>{r.requests}</td><td>{r.tokens}</td><td>{r.cost}</td><td>{r.status}</td><td><ActionGroup items={[{label:"View details",title:"Usage Details",description:"Usage by class, provider, model, device, keyId/user, fallback rate, cost trend.",variant:"drawer"},{label:"Export usage",title:"Export Usage",description:"Export AI/API usage report.",variant:"modal",confirmLabel:"Export"},{label:"Open cost settings",title:"Cost Settings",description:"Set estimated cloud cost guardrails.",variant:"drawer"},{label:"Open model policy",title:"Model Policy",description:"Local-first toggle, allowed cloud model, fallback policy, per-class limit.",variant:"drawer"}]}/></td></tr>}/>
}

"use client";
import { ActionGroup } from "../PageBits";
import TableFrame from "./TableFrame";

export default function AuditTable({ rows }: { rows: any[] }) {
  return <TableFrame rows={rows} pageSize={10} columns={[
    { key: "time", label: "Time", sortable: true },
    { key: "actor", label: "Actor", sortable: true },
    { key: "role", label: "Role", sortable: true },
    { key: "action", label: "Action", sortable: true },
    { key: "targetType", label: "Target type", sortable: true },
    { key: "target", label: "Target", sortable: true },
    { key: "result", label: "Result", sortable: true },
    { key: "reason", label: "Reason", sortable: true },
    { key: "details", label: "Details" },
    { key: "actor", label: "Actions" },
  ]} renderRow={(a)=><tr key={`${a.time}-${a.actor}-${a.action}`}><td>{a.time}</td><td>{a.actor}</td><td>{a.role}</td><td>{a.action}</td><td>{a.targetType}</td><td>{a.target}</td><td>{a.result}</td><td>{a.reason}</td><td>{a.details}</td><td><ActionGroup items={[{label:"View details",title:"Audit Detail",description:"Actor, action, target, policy decision, metadata, result.",variant:"drawer"},{label:"Export audit",title:"Export Audit",description:"Export filtered audit logs.",variant:"modal",confirmLabel:"Export"},{label:"Open related permission",title:"Related Permission",description:"Jump to associated permission policy.",variant:"panel"}]}/></td></tr>}/>
}

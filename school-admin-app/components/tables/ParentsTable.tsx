"use client";
import { ActionGroup } from "../PageBits";
import TableFrame from "./TableFrame";

export default function ParentsTable({ rows }: { rows: any[] }) {
  return <TableFrame rows={rows} pageSize={12} columns={[
    { key: "name", label: "Parent", sortable: true },
    { key: "linkedStudent", label: "Linked student", sortable: true },
    { key: "relationship", label: "Relationship", sortable: true },
    { key: "consentStatus", label: "Consent status", sortable: true },
    { key: "lastActive", label: "Last active", sortable: true },
    { key: "communicationStatus", label: "Messages", sortable: true },
    { key: "id", label: "Actions" },
  ]} renderRow={(p)=><tr key={p.id}><td>{p.name}</td><td>{p.linkedStudent}</td><td>{p.relationship}</td><td>{p.consentStatus}</td><td>{p.lastActive}</td><td>{p.communicationStatus}</td><td><ActionGroup items={[{label:"View parent profile",title:`Parent Profile: ${p.name}`,description:"Linked student only, relationship, consent status, communication history, privacy settings summary.",variant:"drawer"},{label:"View linked student",title:"Linked Student",description:"Open school-safe student relation panel.",variant:"panel"},{label:"View consent records",title:"Consent Records",description:"Consent history and policy visibility.",variant:"drawer"},{label:"Send school notice",title:"Send School Notice",description:"Compose school broadcast to this parent account.",variant:"modal",confirmLabel:"Send"}]}/></td></tr>}/>
}

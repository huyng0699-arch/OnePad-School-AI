"use client";
import Link from "next/link";
import { ActionGroup } from "../PageBits";
import TableFrame from "./TableFrame";

export default function StudentsTable({ rows }: { rows: any[] }) {
  return <TableFrame
    rows={rows}
    pageSize={12}
    columns={[
      { key: "fullName", label: "Student", sortable: true },
      { key: "className", label: "Class", sortable: true },
      { key: "parentLinked", label: "Parent linked" },
      { key: "deviceStatus", label: "Device status", sortable: true },
      { key: "assignmentCompletionRate", label: "Assignment completion", sortable: true },
      { key: "aggregateLearningStatus", label: "Aggregate learning status", sortable: true },
      { key: "localAiEvents", label: "Local AI events", sortable: true },
      { key: "lastSyncAt", label: "Last sync", sortable: true },
      { key: "id", label: "Actions" },
    ]}
    renderRow={(s) => <tr key={s.id}><td>{s.fullName}<div className="footer-note"><Link href={`/students/${s.id}`}>Open workspace</Link></div></td><td>{s.className}</td><td>{s.parentLinked?"Yes":"No"}</td><td>{s.deviceStatus}</td><td>{Math.round(s.assignmentCompletionRate*100)}%</td><td>{s.aggregateLearningStatus}</td><td>{s.localAiEvents}</td><td>{new Date(s.lastSyncAt).toLocaleString("en-US")}</td><td><ActionGroup items={[{label:"View School-Safe Profile",title:`School-safe profile: ${s.fullName}`,description:"No raw private text. No health raw data. No hidden score.",variant:"drawer"},{label:"View Device Status",title:"Device Status",description:"Device readiness and sync posture.",variant:"drawer"},{label:"View Parent Link",title:"Parent Link",description:"Linked parent account and consent status.",variant:"panel"},{label:"View Aggregate Timeline",title:"Aggregate Timeline",description:"Learning progress timeline (aggregate only).",variant:"panel"}]}/></td></tr>}
  />;
}

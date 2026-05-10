"use client";
import Link from "next/link";
import { ActionGroup } from "../PageBits";
import TableFrame from "./TableFrame";

export default function TeachersTable({ rows }: { rows: any[] }) {
  return <TableFrame rows={rows} pageSize={10} columns={[
    { key: "name", label: "Teacher", sortable: true },
    { key: "role", label: "Role", sortable: true },
    { key: "classes", label: "Classes" },
    { key: "subjects", label: "Subjects" },
    { key: "sensitiveAccess", label: "Sensitive access" },
    { key: "parentConsentRequired", label: "Parent consent required", sortable: true },
    { key: "lastActive", label: "Last active", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { key: "id", label: "Actions" },
  ]} renderRow={(t)=><tr key={t.id}><td>{t.name}<div className="footer-note"><Link href={`/teachers/${t.id}`}>Open workspace</Link></div></td><td>{t.role}</td><td>{t.classes.join(", ")}</td><td>{t.subjects.join(", ")||"-"}</td><td>{t.sensitiveAccess}</td><td>{t.parentConsentRequired?"Yes":"No"}</td><td>{t.lastActive}</td><td>{t.status}</td><td><ActionGroup items={[{label:"Open teacher profile",title:`Teacher Profile: ${t.name}`,description:"Classes, subjects, permissions, access scope, recent activity, and audit trail.",variant:"drawer"},{label:"Assign role",title:"Assign Role",description:"Role, class, subject, access level, expiry, parent consent required.",variant:"modal",confirmLabel:"Save role"},{label:"Revoke role",title:"Confirm Revoke Role",description:"Show affected classes and students before revoke.",variant:"modal",confirmLabel:"Revoke role"},{label:"View audit",title:"Teacher Audit",description:"Recent permission and access events.",variant:"panel"},{label:"View assigned students",title:"Assigned Students",description:"School-safe student scope list.",variant:"panel"}]}/></td></tr>}/>
}

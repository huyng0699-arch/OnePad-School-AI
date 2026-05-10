"use client";
import { ActionGroup } from "../PageBits";
import TableFrame from "./TableFrame";

export default function ClassesTable({ rows }: { rows: any[] }) {
  return <TableFrame rows={rows} pageSize={8} columns={[
    { key: "name", label: "Class", sortable: true },
    { key: "grade", label: "Grade", sortable: true },
    { key: "homeroomTeacher", label: "Homeroom teacher", sortable: true },
    { key: "students", label: "Students", sortable: true },
    { key: "completionRate", label: "Completion rate", sortable: true },
    { key: "supportSignals", label: "Learning support count", sortable: true },
    { key: "arAssignments", label: "AR assignments", sortable: true },
    { key: "localAiEvents", label: "Local AI readiness", sortable: true },
    { key: "id", label: "Actions" },
  ]} renderRow={(c)=><tr key={c.id}><td>{c.name}</td><td>{c.grade}</td><td>{c.homeroomTeacher}</td><td>{c.students}</td><td>{Math.round(c.completionRate*100)}%</td><td>{c.supportSignals}</td><td>{c.arAssignments}</td><td>{Math.round((c.localAiEvents/520)*100)}%</td><td><ActionGroup items={[{label:"Open Class Aggregate",title:`${c.name} Aggregate`,description:"No raw private student data shown.",variant:"drawer"},{label:"Assign Teacher",title:"Assign Teacher",description:"Teacher, role, subject, class, permission set, expiry, consent toggle.",variant:"modal",confirmLabel:"Assign teacher"},{label:"View Curriculum",title:"Class Curriculum Panel",description:"Curriculum assigned to this class.",variant:"panel"},{label:"View AR Progress",title:"AR Progress",description:"Class AR completion analytics.",variant:"drawer"},{label:"Export Class Report",title:"Export Class Aggregate",description:"Class aggregate report prepared.",variant:"modal",confirmLabel:"Prepare"}]}/></td></tr>}/>
}

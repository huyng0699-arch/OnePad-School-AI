"use client";

import { useMemo, useState } from "react";
import { useToast } from "../ui/ToastProvider";

type Student = {
  id: string;
  fullName: string;
  classId: string;
  className: string;
  deviceStatus: string;
  aggregateLearningStatus: string;
  assignmentCompletionRate: number;
  localAiEvents: number;
};

function logOps(action: string, payload: Record<string, unknown>) {
  const key = "onepad_school_ops_log";
  const prev = JSON.parse(localStorage.getItem(key) || "[]");
  prev.unshift({ time: new Date().toISOString(), action, payload });
  localStorage.setItem(key, JSON.stringify(prev.slice(0, 500)));
}

export default function StudentOperationsPanel({ students }: { students: Student[] }) {
  const { push } = useToast();
  const [classFilter, setClassFilter] = useState("all");

  const filtered = useMemo(() => {
    if (classFilter === "all") return students;
    return students.filter((s) => s.classId === classFilter);
  }, [students, classFilter]);

  const atRisk = filtered.filter((s) => s.aggregateLearningStatus === "At risk");
  const offline = filtered.filter((s) => s.deviceStatus === "Offline");

  function runBulk(action: string) {
    logOps(action, { classFilter, affectedStudents: filtered.map((s) => s.id) });
    push("success", `${action} executed for ${filtered.length} students.`);
  }

  return (
    <section className="section card solid">
      <h3>Student Operations Console</h3>
      <div className="table-controls">
        <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} aria-label="Class filter">
          <option value="all">All classes</option>
          <option value="class_8a">Class 8A</option>
          <option value="class_8b">Class 8B</option>
          <option value="class_8c">Class 8C</option>
        </select>
        <div className="action-row">
          <button type="button" onClick={() => runBulk("Schedule device recheck")}>Schedule device recheck</button>
          <button type="button" onClick={() => runBulk("Send parent progress notice")}>Send parent progress notice</button>
          <button type="button" onClick={() => runBulk("Queue support coordinator review")}>Queue support coordinator review</button>
        </div>
      </div>
      <div className="grid cols-4">
        <div className="card"><div className="metric"><span>In scope</span><strong>{filtered.length}</strong></div></div>
        <div className="card"><div className="metric"><span>At risk</span><strong>{atRisk.length}</strong></div></div>
        <div className="card"><div className="metric"><span>Offline devices</span><strong>{offline.length}</strong></div></div>
        <div className="card"><div className="metric"><span>Avg completion</span><strong>{Math.round((filtered.reduce((s, x) => s + x.assignmentCompletionRate, 0) / Math.max(filtered.length,1)) * 100)}%</strong></div></div>
      </div>
      <div className="table-wrap" style={{ marginTop: 10 }}>
        <table className="table">
          <thead><tr><th>Priority queue</th><th>Class</th><th>Learning status</th><th>Device</th><th>Action</th></tr></thead>
          <tbody>
            {atRisk.slice(0, 8).map((s) => (
              <tr key={s.id}>
                <td>{s.fullName}</td>
                <td>{s.className}</td>
                <td>{s.aggregateLearningStatus}</td>
                <td>{s.deviceStatus}</td>
                <td><button type="button" onClick={() => { logOps("Open student intervention plan", { studentId: s.id }); push("info", `Intervention plan opened for ${s.fullName}.`); }}>Open intervention plan</button></td>
              </tr>
            ))}
            {atRisk.length === 0 ? <tr><td colSpan={5}>No at-risk students in current filter.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

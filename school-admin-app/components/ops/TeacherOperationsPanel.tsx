"use client";

import { useMemo, useState } from "react";
import { useToast } from "../ui/ToastProvider";

type Teacher = {
  id: string;
  name: string;
  role: string;
  classes: string[];
  subjects: string[];
  status: string;
  parentConsentRequired: boolean;
};

function logOps(action: string, payload: Record<string, unknown>) {
  const key = "onepad_school_ops_log";
  const prev = JSON.parse(localStorage.getItem(key) || "[]");
  prev.unshift({ time: new Date().toISOString(), action, payload });
  localStorage.setItem(key, JSON.stringify(prev.slice(0, 500)));
}

export default function TeacherOperationsPanel({ teachers }: { teachers: Teacher[] }) {
  const { push } = useToast();
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = useMemo(() => {
    if (roleFilter === "all") return teachers;
    return teachers.filter((t) => t.role === roleFilter);
  }, [teachers, roleFilter]);

  const consentBased = filtered.filter((t) => t.parentConsentRequired);

  function bulk(action: string) {
    logOps(action, { roleFilter, affectedTeachers: filtered.map((t) => t.id) });
    push("success", `${action} completed for ${filtered.length} teachers.`);
  }

  return (
    <section className="section card solid">
      <h3>Teacher Access Command Center</h3>
      <div className="table-controls">
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} aria-label="Role filter">
          <option value="all">All roles</option>
          <option value="Homeroom Teacher">Homeroom Teacher</option>
          <option value="Subject Teacher">Subject Teacher</option>
          <option value="Education Guardian">Education Guardian</option>
        </select>
        <div className="action-row">
          <button type="button" onClick={() => bulk("Run permission recertification")}>Run permission recertification</button>
          <button type="button" onClick={() => bulk("Push role expiry reminders")}>Push role expiry reminders</button>
          <button type="button" onClick={() => bulk("Export teacher access sheet")}>Export teacher access sheet</button>
        </div>
      </div>
      <div className="grid cols-4">
        <div className="card"><div className="metric"><span>In scope</span><strong>{filtered.length}</strong></div></div>
        <div className="card"><div className="metric"><span>Consent-required</span><strong>{consentBased.length}</strong></div></div>
        <div className="card"><div className="metric"><span>Active</span><strong>{filtered.filter((t) => t.status === "Active").length}</strong></div></div>
        <div className="card"><div className="metric"><span>Class coverage</span><strong>{new Set(filtered.flatMap((t) => t.classes)).size}</strong></div></div>
      </div>
      <div className="table-wrap" style={{ marginTop: 10 }}>
        <table className="table">
          <thead><tr><th>Teacher</th><th>Role</th><th>Classes</th><th>Subjects</th><th>Consent mode</th><th>Quick action</th></tr></thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>{t.role}</td>
                <td>{t.classes.join(", ")}</td>
                <td>{t.subjects.join(", ") || "-"}</td>
                <td>{t.parentConsentRequired ? "Required" : "Not required"}</td>
                <td><button type="button" onClick={() => { logOps("Open teacher governance workspace", { teacherId: t.id }); push("info", `Governance workspace opened for ${t.name}.`); }}>Open governance workspace</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

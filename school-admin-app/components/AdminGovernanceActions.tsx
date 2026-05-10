"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_ONEPAD_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000";

export default function AdminGovernanceActions() {
  const [status, setStatus] = useState("Ready");

  async function assignTeacherRole() {
    setStatus("Assigning role...");
    try {
      const res = await fetch(`${API_BASE}/v1/admin/permissions/assign-teacher-role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-demo-user-id": "admin_001",
          "x-demo-role": "school_admin",
        },
        body: JSON.stringify({
          teacherId: "teacher_001",
          classId: "class_8a",
          subjectId: "biology",
          roleType: "subject_teacher",
        }),
      });
      const data = await res.json();
      setStatus(data?.ok ? "Teacher role assigned successfully." : data?.error || "Assign failed");
    } catch {
      setStatus("Backend offline");
    }
  }

  return (
    <div className="card solid">
      <h3>Governance Actions</h3>
      <div className="pill-row">
        <button className="badge" onClick={() => void assignTeacherRole()}>Grant Teacher Access</button>
        <button className="badge red" onClick={() => setStatus("Access revoke flow opened.")}>Revoke Access</button>
        <button className="badge teal" onClick={() => setStatus("Permission matrix opened.")}>Open Permission Matrix</button>
        <button className="badge amber" onClick={() => setStatus("Privacy readiness panel opened.")}>View Privacy Readiness</button>
        <button className="badge purple" onClick={() => setStatus("Audit log panel opened.")}>Open Audit Log</button>
      </div>
      <p className="footer-note">{status}</p>
    </div>
  );
}


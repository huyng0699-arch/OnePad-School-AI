"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_ONEPAD_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000";

export default function TeacherAccessControls() {
  const [status, setStatus] = useState("No action yet");

  const callApi = async (remove: boolean) => {
    setStatus("Updating...");
    try {
      const res = await fetch(`${API_BASE}/v1/admin/teachers/teacher_001/class-access${remove ? "/remove" : ""}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-demo-user-id": "admin_001",
          "x-demo-role": "school_admin",
        },
        body: JSON.stringify({ classId: "class_8a", subjectId: "biology", roleType: "subject_teacher" }),
      });
      const data = await res.json();
      setStatus(data?.ok ? (remove ? "Biology 8A access revoked" : "Biology 8A access granted") : data?.error || "Update failed");
    } catch {
      setStatus("Backend offline");
    }
  };

  return (
    <div className="pill-row">
      <button className="badge teal" onClick={() => void callApi(false)}>Grant Biology 8A access</button>
      <button className="badge red" onClick={() => void callApi(true)}>Revoke access</button>
      <span className="footer-note">{status}</span>
    </div>
  );
}

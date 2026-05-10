"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_ONEPAD_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000";

export default function ConsentControls() {
  const [status, setStatus] = useState("No action yet");

  const submit = async (active: boolean) => {
    setStatus("Saving...");
    try {
      const res = await fetch(`${API_BASE}/v1/parent/children/stu_001/guardian-consent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-demo-user-id": "parent_001",
          "x-demo-role": "parent",
        },
        body: JSON.stringify({ teacherId: "teacher_001", active }),
      });
      const data = await res.json();
      setStatus(data?.ok ? (active ? "Guardian consent enabled" : "Guardian consent revoked") : data?.error || "Save failed");
    } catch {
      setStatus("Backend offline");
    }
  };

  return (
    <div className="pill-row">
      <button className="badge teal" onClick={() => void submit(true)}>Enable guardian consent</button>
      <button className="badge red" onClick={() => void submit(false)}>Revoke guardian consent</button>
      <span className="footer-note">{status}</span>
    </div>
  );
}

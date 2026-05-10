"use client";

import { useState } from "react";

export default function ParentActionCenter() {
  const [status, setStatus] = useState("No action triggered");

  return (
    <div className="card solid">
      <h3>Home Support Action Center</h3>
      <div className="pill-row">
        <button className="badge" onClick={() => setStatus("Home plan generated for tonight's support.")}>Generate Home Plan</button>
        <button className="badge teal" onClick={() => setStatus("Teacher message composer opened.")}>Ask Teacher</button>
        <button className="badge amber" onClick={() => setStatus("Plan marked as done.")}>Mark as Done</button>
        <button className="badge purple" onClick={() => setStatus("Privacy access log opened.")}>View Access Log</button>
      </div>
      <p className="footer-note">{status}</p>
    </div>
  );
}


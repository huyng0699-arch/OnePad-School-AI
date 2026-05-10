"use client";

import { useEffect, useState } from "react";

export default function OpsLogViewer() {
  const [rows, setRows] = useState<Array<{ time: string; action: string; payload: Record<string, unknown> }>>([]);

  useEffect(() => {
    const key = "onepad_school_ops_log";
    const val = JSON.parse(localStorage.getItem(key) || "[]");
    setRows(val);
  }, []);

  return (
    <div className="card" style={{ marginTop: 12 }}>
      <h3>Operations execution log (local)</h3>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Time</th><th>Action</th><th>Payload</th></tr></thead>
          <tbody>
            {rows.slice(0, 30).map((r, idx) => (
              <tr key={`${r.time}-${idx}`}>
                <td>{new Date(r.time).toLocaleString("en-US")}</td>
                <td>{r.action}</td>
                <td><code>{JSON.stringify(r.payload)}</code></td>
              </tr>
            ))}
            {rows.length === 0 ? <tr><td colSpan={3}>No operations have been executed yet.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

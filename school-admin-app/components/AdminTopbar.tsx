"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type SearchItem = { type: string; label: string; detail: string };

const searchData: SearchItem[] = [
  { type: "Students", label: "STU-8A-001 - Nguyen Minh", detail: "Class 8A" },
  { type: "Teachers", label: "Tran Thi Linh", detail: "8A Homeroom, Biology" },
  { type: "Classes", label: "Class 8B", detail: "Grade 8" },
  { type: "Accounts", label: "linh.tran@nguyentrai.edu.vn", detail: "Teacher account" },
  { type: "Lessons", label: "Cell Structure Lab", detail: "Biology" },
  { type: "Permissions", label: "Biology 8A Access", detail: "Consent-based" },
];

export default function AdminTopbar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!query.trim()) return searchData;
    const q = query.toLowerCase();
    return searchData.filter((item) => `${item.type} ${item.label} ${item.detail}`.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="topbar">
      <div className="search-wrap">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          placeholder="Search student ID, teacher, parent, class, policy, account..."
        />
        {open && (
          <div className="search-results">
            {filtered.length === 0 ? (
              <div className="search-item muted">No results</div>
            ) : (
              filtered.map((item) => (
                <button key={`${item.type}-${item.label}`} className="search-item" type="button">
                  <span className="search-type">{item.type}</span>
                  <span>{item.label}</span>
                  <span className="search-detail">{item.detail}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
      <div className="top-actions">
        <button type="button" className="ghost-btn">Alerts</button>
        <select defaultValue="2026 Academic Year">
          <option>2026 Academic Year</option>
          <option>2025 Academic Year</option>
        </select>
        <span className="badge teal">Privacy-ready</span>
        <span className="badge">Principal Office</span>
        <details className="menu-wrap">
          <summary className="ghost-btn">Admin</summary>
          <div className="menu-list">
            <Link href="/accounts">Accounts & passwords</Link>
            <Link href="/tenant-settings">School settings</Link>
            <Link href="/audit-log">Audit log</Link>
            <button type="button">Sign out</button>
          </div>
        </details>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navGroups = [
  {
    title: "Today",
    items: [
      { href: "/", label: "Today", icon: "TD", hint: "Live dashboard" },
      { href: "/my-teaching-scope", label: "My Teaching Scope", icon: "SC", hint: "Access boundaries" },
      { href: "/homeroom-class", label: "Homeroom Class", icon: "HR", hint: "Class 8A pulse" },
      { href: "/students", label: "Students", icon: "ST", hint: "Profiles and actions" },
    ],
  },
  {
    title: "Teaching",
    items: [
      { href: "/classes", label: "Class Dashboard", icon: "CL", hint: "Biology 8A" },
      { href: "/assignments", label: "Assignments", icon: "AS", hint: "Create and track" },
      { href: "/authoring", label: "Lesson Authoring", icon: "LA", hint: "Studio" },
      { href: "/ar-assignments", label: "AR Assignments", icon: "AR", hint: "3D labs" },
      { href: "/quiz-builder", label: "Quiz Builder", icon: "QB", hint: "Question bank" },
      { href: "/group-work", label: "Group Work", icon: "GW", hint: "Teams" },
    ],
  },
  {
    title: "Care",
    items: [
      { href: "/support", label: "Support Queue", icon: "SQ", hint: "Safe signals" },
      { href: "/guardian-cases", label: "Guardian Cases", icon: "GC", hint: "Consent only" },
      { href: "/messages", label: "Messages", icon: "MS", hint: "Parent comms" },
      { href: "/attendance", label: "Attendance", icon: "AT", hint: "Daily register" },
    ],
  },
  {
    title: "Operations",
    items: [
      { href: "/timetable", label: "Timetable", icon: "TT", hint: "Week view" },
      { href: "/ai-usage", label: "AI Usage", icon: "AI", hint: "Local/cloud" },
      { href: "/reports", label: "Reports", icon: "RP", hint: "Export summaries" },
      { href: "/student-logs", label: "Student Logs", icon: "LG", hint: "Manual + auto sync" },
      { href: "/settings", label: "Settings", icon: "SE", hint: "Profile and privacy" },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar() {
  const pathname = usePathname();
  const teacherName = "Ms. Linh";

  return (
    <aside className="sidebar">
      <Link href="/" className="brand" aria-label="OnePad Teacher home">
        <div className="logo">T</div>
        <div>
          <h1>OnePad Teacher</h1>
          <p>{teacherName} · Biology 8A</p>
        </div>
      </Link>

      <div className="teacher-chip">
        <span className="dot" />
        <div>
          <strong>Teaching live</strong>
          <small>3 urgent signals · 6 tasks due</small>
        </div>
      </div>

      <nav className="nav" aria-label="Teacher navigation">
        {navGroups.map((group) => (
          <div key={group.title} className="nav-group">
            <div className="group">{group.title}</div>
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link key={item.href} href={item.href} className={`nav-link ${active ? "active" : ""}`}>
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text">
                    <strong>{item.label}</strong>
                    <small>{item.hint}</small>
                  </span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}



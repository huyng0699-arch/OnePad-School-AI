import type { ReactNode } from "react";
import Link from "next/link";
import { getParentSession } from "../lib/api";

const navGroups = [
  {
    title: "Overview",
    items: [
      ["/", "Home", "Today and next actions"],
      ["/student-profile", "Student Profile", "Linked student and teachers"],
      ["/alerts-center", "Alerts", "Signals and recommended action"],
      ["/home-support-plan", "Home Support", "What to do tonight"],
    ],
  },
  {
    title: "Learning",
    items: [
      ["/learning-across-subjects", "Subjects", "Mastery and weak skills"],
      ["/progress", "Progress", "Parent-safe timeline"],
      ["/assignments", "Assignments", "Due work and status"],
      ["/lessons", "Lessons", "Current and review lessons"],
      ["/quiz-mastery", "Quiz & Mastery", "Repeated mistakes"],
      ["/ar-learning", "AR Learning", "3D/AR learning tasks"],
      ["/group-work", "Group Work", "Participation summary"],
    ],
  },
  {
    title: "School",
    items: [
      ["/messages", "Messages", "Teachers and school"],
      ["/notices", "Notices", "Meetings and events"],
      ["/timetable", "Timetable", "Weekly schedule"],
      ["/attendance", "Attendance", "Present, late, absent"],
    ],
  },
  {
    title: "Privacy",
    items: [
      ["/health-wellbeing-vault", "Health Vault", "Parent-controlled summaries"],
      ["/ai-family-report", "Family Report", "AI-generated safe report"],
      ["/privacy", "Privacy Center", "Who can see what"],
      ["/consent-sharing", "Consent Sharing", "Share, extend, revoke"],
      ["/parent-notes", "Parent Notes", "Private or shareable notes"],
      ["/reports", "Reports", "Daily, weekly, privacy"],
      ["/device-sync", "Device & Sync", "Student device status"],
      ["/settings", "Settings", "Profile and security"],
    ],
  },
] as const;

export default function ParentShell({ children }: { children: ReactNode }) {
  const session = getParentSession();

  return (
    <div className="shell parent-shell">
      <aside className="sidebar parent-sidebar">
        <div className="brand parent-brand">
          <div className="logo">OP</div>
          <div>
            <h1>OnePad Parent</h1>
            <p>Parent App</p>
            <small>{session.schoolName || "Backend-powered parent view"}</small>
          </div>
        </div>

        <div className="child-chip">
          <strong>{session.studentName || "No student selected"}</strong>
          <span>{session.className || "Choose a backend login"}</span>
          <span>Parent ID: {session.parentId}</span>
        </div>

        <div className="pill-row login-row">
          <Link className="button-link" href="/login">Login / Switch student</Link>
        </div>

        <nav className="nav parent-nav">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.title}>
              <div className="group">{group.title}</div>
              {group.items.map(([href, label, hint]) => (
                <Link className="nav-link" href={href} key={href}>
                  <span className="nav-icon">•</span>
                  <span className="nav-text"><strong>{label}</strong><small>{hint}</small></span>
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}

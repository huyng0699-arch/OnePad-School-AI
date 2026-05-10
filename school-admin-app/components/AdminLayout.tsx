import Link from "next/link";
import React from "react";
import AdminTopbar from "./AdminTopbar";

type AdminLayoutProps = {
  active: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  demoFallback?: boolean;
};

const groups = [
  {
    label: "School Registry",
    links: [
      { href: "/", key: "overview", label: "Operations Dashboard", icon: "OD" },
      { href: "/classes", key: "classes", label: "Classes & Cohorts", icon: "CL" },
      { href: "/students", key: "students", label: "Student Records", icon: "ST" },
      { href: "/teachers", key: "teachers", label: "Teacher Directory", icon: "TC" },
      { href: "/parents", key: "parents", label: "Parent Accounts", icon: "PA" },
    ],
  },
  {
    label: "Academic Operations",
    links: [
      { href: "/role-permission-matrix", key: "role-permission-matrix", label: "Teaching Assignments", icon: "TA" },
      { href: "/homeroom-assignment", key: "homeroom-assignment", label: "Homeroom Coverage", icon: "HR" },
      { href: "/curriculum-library", key: "curriculum-library", label: "Curriculum Library", icon: "CU" },
      { href: "/lesson-publishing", key: "lesson-publishing", label: "Lesson Publishing", icon: "LP" },
      { href: "/assignments", key: "assignments", label: "Assignments", icon: "AS" },
      { href: "/ar-content", key: "ar-content", label: "AR Learning Content", icon: "AR" },
    ],
  },
  {
    label: "Platform Control",
    links: [
      { href: "/accounts", key: "accounts", label: "Accounts & Passwords", icon: "AC" },
      { href: "/ai-api-usage", key: "ai-api-usage", label: "AI / API Usage", icon: "AI" },
      { href: "/local-ai-readiness", key: "local-ai-readiness", label: "Device AI Readiness", icon: "DV" },
      { href: "/privacy-consent", key: "privacy-consent", label: "Privacy & Consent", icon: "PR" },
      { href: "/health-wellbeing", key: "health-wellbeing", label: "Health & Wellbeing", icon: "HW" },
      { href: "/reports", key: "reports", label: "Reports", icon: "RP" },
      { href: "/audit-log", key: "audit-log", label: "Audit Log", icon: "AU" },
      { href: "/tenant-settings", key: "tenant-settings", label: "School Settings", icon: "SS" },
    ],
  },
];

export default function AdminLayout({ active, title, subtitle, children, demoFallback }: AdminLayoutProps) {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand"><div className="logo">OP</div><div><h1>OnePad School OS</h1><p>Truong THCS Nguyen Trai</p><p className="brand-sub">Closed school management console</p></div></div>
        <nav className="nav">
          {groups.map((group) => (
            <div className="nav-group" key={group.label}>
              <div className="nav-heading">{group.label}</div>
              {group.links.map((item) => (
                <Link key={item.key} href={item.href} className={`nav-link ${active === item.key ? "active" : ""}`}>
                  <span className="nav-icon">{item.icon}</span><span>{item.label}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      <main className="main">
        <AdminTopbar />
        <section className="section card solid compact-hero">
          <div className="kicker">OnePad Admin</div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
          {demoFallback ? <div className="demo-fallback">Demo fallback</div> : null}
        </section>
        {children}
      </main>
    </div>
  );
}


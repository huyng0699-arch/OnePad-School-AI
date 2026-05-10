import React from "react";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children?: React.ReactNode }) {
  return (
    <div className="shell app-shell">
      <Sidebar />
      <main className="main">{children}</main>
    </div>
  );
}


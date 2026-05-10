"use client";

import { useState } from "react";

export default function Page() {
  const [enabled, setEnabled] = useState(true);
  const [supportScope, setSupportScope] = useState(true);
  const [healthScope, setHealthScope] = useState(true);

  return <div className="shell"><main className="main"><section className="hero"><div className="hero-top"><div><div className="kicker">Consent Sharing</div><h2>Advanced guardian sharing for homeroom teacher</h2><p>Parent-controlled switch for safe summaries only.</p></div><div className="status-pill"><span className="dot" /> {enabled ? "Sharing on" : "Sharing off"}</div></div></section>
  <section className="section split"><div className="card solid"><h3>Master Control</h3><label className="inline-check"><input type="checkbox" checked={enabled} onChange={(e)=>setEnabled(e.target.checked)} /> Allow teacher access to safe support summaries</label><label className="setting-row"><span><strong>Support summary</strong><small>Wellbeing and learning-safe summary</small></span><input type="checkbox" checked={supportScope} onChange={(e)=>setSupportScope(e.target.checked)} /></label><label className="setting-row"><span><strong>Health summary</strong><small>High-level vault summary only</small></span><input type="checkbox" checked={healthScope} onChange={(e)=>setHealthScope(e.target.checked)} /></label><p className="footer-note">This page controls consent settings only. Raw private text remains locked.</p></div><div className="card solid"><h3>Audit & Privacy</h3><p>Consent changes are expected to be audited in backend governance logs.</p></div></section></main></div>;
}

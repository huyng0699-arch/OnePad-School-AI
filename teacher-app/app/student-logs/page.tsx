"use client";

import { useMemo, useState } from "react";
import { class8AStudents } from "../../lib/demoData";
import { onepadApi } from "../../lib/api";

const sample = JSON.stringify([
  { studentId: "stu_001", type: "wellbeing_signal_received", privacyLevel: "parent_controlled", createdAt: "2026-05-07T10:15:00+07:00", metadataJson: { stress: "medium", context: "biology_review", note: "quiet check-in helped" } },
  { studentId: "stu_014", type: "health_signal_received", privacyLevel: "parent_controlled", createdAt: "2026-05-07T10:20:00+07:00", metadataJson: { headacheRisk: "monitor", screenFatigue: true } }
], null, 2);

function normalizeEvent(event: any, index: number, autoSync: boolean) {
  const privacyLevel = event.privacyLevel || "sensitive";
  return {
    id: event.id || `teacher_import_${Date.now()}_${index}`,
    deviceId: event.deviceId || "teacher_manual_import",
    sessionId: event.sessionId || "teacher_import_session",
    lessonId: event.lessonId || "manual_teacher_import",
    studentId: event.studentId,
    type: event.type || "teacher_help_requested",
    source: event.source || "teacher_app",
    severity: event.severity || "medium",
    safeSummary: event.safeSummary || `Teacher imported ${event.type || "manual observation"}`,
    createdAt: event.createdAt || new Date().toISOString(),
    privacyLevel,
    visibleToTeacher: event.visibleToTeacher ?? true,
    visibleToParent: event.visibleToParent ?? true,
    visibleToSchoolAggregate: event.visibleToSchoolAggregate ?? false,
    requiresParentConsent: event.requiresParentConsent ?? privacyLevel === "parent_controlled",
    requiresTeacherGuardianReview: event.requiresTeacherGuardianReview ?? privacyLevel === "parent_controlled",
    metadataJson: { ...(event.metadataJson || {}), importMode: autoSync ? "auto_sync_enabled" : "manual_only", importedBy: "teacher_001" },
  };
}

export default function Page(){
  const [raw, setRaw] = useState(sample);
  const [result, setResult] = useState("Ready to import JSON logs from a device, CSV conversion, or school SIS export.");
  const [autoSync, setAutoSync] = useState(true);
  const events = useMemo(() => {
    try { return JSON.parse(raw); } catch { return []; }
  }, [raw]);

  async function ingest() {
    if (!Array.isArray(events)) { setResult("Input must be a JSON array."); return; }
    const normalized = events.map((event: any, index: number) => normalizeEvent(event, index, autoSync));
    const res = await onepadApi.ingestStudentLogBatch(normalized);
    setResult(JSON.stringify(res, null, 2));
  }

  return <>
    <section className="hero"><div className="hero-top"><div><div className="kicker">Student Log Ingestion</div><h2>Load student logs manually or sync them into the school pipeline.</h2><p>Teachers can import mobile/device logs, parent-approved health signals, and learning events. Privacy level travels with every event.</p></div><div className="status-pill"><span className="dot" /> {autoSync ? "Auto sync on" : "Manual only"}</div></div></section>
    <section className="section grid cols-3"><div className="card"><div className="metric"><span>Students mapped</span><strong>{class8AStudents.length}</strong></div></div><div className="card"><div className="metric"><span>Parsed events</span><strong>{Array.isArray(events) ? events.length : 0}</strong></div></div><div className="card"><div className="metric"><span>Target school</span><strong>OnePad</strong></div></div></section>
    <section className="section split"><div className="card solid"><h3>Import Logs</h3><label>Paste JSON event array<textarea rows={18} value={raw} onChange={(e)=>setRaw(e.target.value)} /></label><div className="toolbar"><label className="inline-check"><input type="checkbox" checked={autoSync} onChange={(e)=>setAutoSync(e.target.checked)} /> Auto-sync to school backend</label><button onClick={() => void ingest()}>Validate and sync</button><button onClick={()=>setRaw(sample)}>Load sample</button></div></div><div className="card solid"><h3>Sync Result</h3><pre className="ai-output">{result}</pre><div className="callout section"><strong>Supported event types</strong><p>quiz_completed, local_ai_used, cloud_ai_used, health_signal_received, wellbeing_signal_received, social_integration_signal, teacher_help_requested.</p></div><div className="callout section"><strong>Privacy routing</strong><p>parent_controlled logs require guardian consent before teacher guardian mode can display them.</p></div></div></section>
  </>;
}

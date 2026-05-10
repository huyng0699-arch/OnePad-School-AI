"use client";

import { useMemo, useState } from "react";
import { onepadApi } from "../../lib/api";

export default function GuardianConsole({ profiles }: { profiles: any[] }) {
  const [selectedId, setSelectedId] = useState(profiles[0]?.studentId || "");
  const [aiOutput, setAiOutput] = useState("AI analysis will appear here after you run the report.");
  const [loading, setLoading] = useState(false);
  const selected = profiles.find((profile) => profile.studentId === selectedId) || profiles[0];
  const defaultPrompt = useMemo(() => {
    if (!selected) return "";
    return [
      `Student: ${selected.studentName} (${selected.className})`,
      `Consent: advancedGuardianShare=${selected.advancedGuardianShare}; scope=${selected.shareScope.join(", ")}`,
      `Physical health context: ${JSON.stringify(selected.physicalHealth)}`,
      `Mental wellbeing context: ${JSON.stringify(selected.mentalWellbeing)}`,
      `AI daily reports: ${JSON.stringify(selected.aiDailyReports)}`,
      "Task: Produce a teacher guardian briefing with evidence, risk interpretation, classroom accommodations, parent follow-up, and log-sync next steps. Do not diagnose.",
    ].join("\n");
  }, [selected]);
  const [prompt, setPrompt] = useState(defaultPrompt);

  function choose(studentId: string) {
    setSelectedId(studentId);
    const next = profiles.find((profile) => profile.studentId === studentId);
    if (next) {
      setPrompt([
        `Student: ${next.studentName} (${next.className})`,
        `Consent: advancedGuardianShare=${next.advancedGuardianShare}; scope=${next.shareScope.join(", ")}`,
        `Physical health context: ${JSON.stringify(next.physicalHealth)}`,
        `Mental wellbeing context: ${JSON.stringify(next.mentalWellbeing)}`,
        `AI daily reports: ${JSON.stringify(next.aiDailyReports)}`,
        "Task: Produce a teacher guardian briefing with evidence, risk interpretation, classroom accommodations, parent follow-up, and log-sync next steps. Do not diagnose.",
      ].join("\n"));
    }
  }

  async function runAi() {
    setLoading(true);
    const res = await onepadApi.teacherAiAssist({ action: "guardian_case_analysis", modelId: "gemini-2.5-flash", prompt });
    setLoading(false);
    setAiOutput(res?.ok ? res.text : `AI error: ${res?.error || "unknown error"}`);
  }

  async function syncSamples() {
    const events = selected.rawLogSamples.map((sample: any, index: number) => ({
      id: `teacher_manual_${selected.studentId}_${Date.now()}_${index}`,
      studentId: selected.studentId,
      deviceId: "teacher_guardian_console",
      sessionId: "guardian_review_session",
      lessonId: "teacher_guardian_console",
      type: sample.type,
      source: "teacher_app",
      severity: sample.metadataJson?.stress === "elevated" ? "high" : "medium",
      safeSummary: `Guardian console imported ${sample.type} for ${selected.studentName}`,
      createdAt: sample.createdAt,
      privacyLevel: sample.privacyLevel,
      visibleToTeacher: true,
      visibleToParent: true,
      visibleToSchoolAggregate: false,
      requiresParentConsent: sample.privacyLevel === "parent_controlled",
      requiresTeacherGuardianReview: true,
      metadataJson: { ...sample.metadataJson, importedBy: "teacher_001", importSource: "teacher_guardian_console" },
    }));
    const res = await onepadApi.ingestStudentLogBatch(events);
    setAiOutput(`Sync result:\n${JSON.stringify(res, null, 2)}`);
  }

  if (!selected) return null;

  return (
    <section className="section split guardian-console">
      <div className="card solid">
        <h3>Protected Students</h3>
        {profiles.map((profile) => (
          <button key={profile.studentId} className={`student-protect-card ${profile.studentId === selected.studentId ? "selected" : ""}`} onClick={() => choose(profile.studentId)}>
            <strong>{profile.studentName}</strong>
            <span>{profile.physicalHealth.status} · {profile.mentalWellbeing.status}</span>
            <small>Parent connected: {profile.parentAppConnected ? "yes" : "no"} · Mobile sync: {profile.studentMobileConnected ? "yes" : "no"}</small>
          </button>
        ))}
        <div className="consent-box">
          <strong>Advanced guardian sharing</strong>
          <p>{selected.parent} enabled full guardian sharing for homeroom teacher until {selected.consentExpiresAt}.</p>
          <div className="pill-row">{selected.shareScope.map((scope: string) => <span className="badge teal" key={scope}>{scope}</span>)}</div>
        </div>
      </div>

      <div className="card solid">
        <h3>{selected.studentName} Guardian View</h3>
        <p className="footer-note">{selected.caution}</p>
        <div className="guardian-grid">
          <div className="callout"><strong>Physical</strong><p>{selected.physicalHealth.conditions.join("; ")}</p><p>Sleep: {selected.physicalHealth.sleepHours}h · Activity: {selected.physicalHealth.activityMinutes}m</p></div>
          <div className="callout"><strong>Mental wellbeing</strong><p>{selected.mentalWellbeing.parentSharedContext.join("; ")}</p><p>{selected.mentalWellbeing.socialSignal}</p></div>
        </div>
        <h3>AI Daily Reports</h3>
        {selected.aiDailyReports.map((report: any) => <div className="report-strip" key={report.at}><strong>{report.at} · {report.severity}</strong><p>{report.summary}</p><small>{report.analysis}</small></div>)}
        <label>Editable AI prompt<textarea rows={10} value={prompt} onChange={(event) => setPrompt(event.target.value)} /></label>
        <div className="pill-row"><button onClick={() => void runAi()} disabled={loading}>{loading ? "Running AI..." : "Run real AI analysis"}</button><button onClick={() => void syncSamples()}>Sync sample logs to school</button><button>Message parent</button><button>Create counselor handoff</button></div>
        <pre className="ai-output">{aiOutput}</pre>
      </div>
    </section>
  );
}


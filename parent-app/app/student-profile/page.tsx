export const dynamic = "force-dynamic";

import ParentShell from "../../components/ParentShell";
import { formatDate, onepadApi } from "../../lib/api";

export default async function StudentProfilePage() {
  const response = await onepadApi.studentProfile() as any;
  const profile = response.profile || {};
  const teachers = Array.isArray(profile.subjectTeachers) ? profile.subjectTeachers : [];
  const focus = Array.isArray(profile.learningFocus) ? profile.learningFocus : [];
  const sync = profile.deviceSync || {};

  return (
    <ParentShell>
      <section className="section card solid parent-home-intro"><h2>Student Profile</h2><p>One parent account is linked to exactly one student.</p></section>
      <section className="section grid cols-2">
        <div className="card solid">
          <h3>{profile.childName || "No student selected"}</h3>
          <p>{profile.className || "Class pending"} · {profile.schoolName || "School pending"}</p>
          <div className="health-stack section">
            <div><span>Homeroom teacher</span><strong>{profile.homeroomTeacher || "Not provided"}</strong></div>
            <div><span>Learning focus</span><strong>{focus.length ? focus.join(" · ") : "Not provided by backend"}</strong></div>
            <div><span>Device sync</span><strong>{sync.status || "No data"}</strong><p>Last synced: {formatDate(sync.lastSyncedAt)}</p></div>
          </div>
        </div>
        <div className="card solid">
          <h3>Subject teachers</h3>
          <div className="health-stack">
            {teachers.length ? teachers.map((item: any) => <div key={item.subject || item.teacher}><span>{item.subject || "Subject"}</span><strong>{item.teacher || item.name || "Teacher pending"}</strong><p>{item.contactHint || "Contact hint pending."}</p></div>) : <div><span>Backend</span><strong>No subject teachers returned yet</strong></div>}
          </div>
        </div>
      </section>
    </ParentShell>
  );
}

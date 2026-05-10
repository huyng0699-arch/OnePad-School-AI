export const dynamic = "force-dynamic";

import ParentShell from "../../components/ParentShell";
import { formatDate, onepadApi } from "../../lib/api";

export default async function SettingsPage() {
  const response = await onepadApi.studentProfile() as any;
  const profile = response.profile || {};
  const device = profile.deviceSync || {};

  return (
    <ParentShell>
      <section className="section card solid parent-home-intro"><h2>Settings</h2><p>Parent profile, linked student, notifications, privacy defaults, language, security, and sign out.</p></section>
      <section className="section split"><div className="card solid"><h3>Linked student</h3><p>{profile.childName || "No student selected"} · {profile.className || "Class pending"}</p><p className="footer-note">One parent account is linked to one student. Switch account from Login.</p></div><div className="card solid"><h3>Sync and security</h3><div className="health-stack"><div><span>Status</span><strong>{device.status || "No data"}</strong></div><div><span>Last synced</span><strong>{formatDate(device.lastSyncedAt)}</strong></div><div><span>Backend</span><strong>{device.backendStatus || "No data"}</strong></div></div></div></section>
    </ParentShell>
  );
}

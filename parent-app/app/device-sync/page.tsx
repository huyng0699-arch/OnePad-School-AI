export const dynamic = "force-dynamic";

import ParentShell from "../../components/ParentShell";
import { formatDate, onepadApi } from "../../lib/api";

export default async function DeviceSyncPage() {
  const response = await onepadApi.deviceSync() as any;
  const device = response.device || {};

  return (
    <ParentShell>
      <section className="section card solid parent-home-intro"><h2>Device & Sync</h2><p>Student device status, last synced time, pending events, local AI status, and backend status.</p></section>
      <section className="section grid cols-2"><div className="card solid"><h3>Sync</h3><p>{device.status || "No data"}</p><div className="health-stack section"><div><span>Last synced</span><strong>{formatDate(device.lastSyncedAt)}</strong></div><div><span>Pending events</span><strong>{device.pendingEvents ?? "-"}</strong></div></div></div><div className="card solid"><h3>AI and backend</h3><div className="health-stack"><div><span>Local AI</span><strong>{device.localAiStatus || "No data"}</strong></div><div><span>Backend</span><strong>{device.backendStatus || "No data"}</strong></div></div></div></section>
    </ParentShell>
  );
}

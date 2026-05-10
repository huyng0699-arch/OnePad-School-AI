import AdminLayout from "../../components/AdminLayout";
import { onepadApi } from "../../lib/api";

export default async function PrivacyConsentPage() {
  const privacy = await onepadApi.privacyReadiness();
  return <AdminLayout active="privacy-consent" title="Privacy & Consent Overview" subtitle="Aggregate consent posture and protected access overview only." demoFallback={privacy.source==="demo"}>
    <section className="section grid cols-4">
      <div className="card"><div className="metric"><span>Active parent consents</span><strong>{privacy.data.activeParentConsents ?? 58}</strong></div></div>
      <div className="card"><div className="metric"><span>Revoked consents</span><strong>{privacy.data.revokedConsents ?? 2}</strong></div></div>
      <div className="card"><div className="metric"><span>Guardian cases</span><strong>{privacy.data.guardianCases ?? 2}</strong></div></div>
      <div className="card"><div className="metric"><span>Blocked access attempts</span><strong>{privacy.data.blockedAccessAttempts ?? 12}</strong></div></div>
    </section>
    <section className="section card"><span className="badge teal">Raw data protection status: {privacy.data.rawDataProtectionStatus ?? "Protected"}</span></section>
  </AdminLayout>;
}


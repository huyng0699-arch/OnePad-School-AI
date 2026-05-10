export const dynamic = "force-dynamic";

import ParentShell from "../../components/ParentShell";
import { formatDate, onepadApi } from "../../lib/api";

export default async function ConsentSharingPage() {
  const response = await onepadApi.consentLog() as any;
  const consent = Array.isArray(response.consent) ? response.consent : [];

  return (
    <ParentShell>
      <section className="section card solid parent-home-intro"><h2>Consent Sharing</h2><p>Share, extend, or revoke safe summaries. Raw private data is never shared by default.</p></section>
      <section className="section grid cols-3"><div className="card solid"><span className="badge teal">Learning</span><h3>Safe learning summary</h3><p>Share with homeroom teacher only when parent consents.</p></div><div className="card solid"><span className="badge amber">Health</span><h3>High-level health summary</h3><p>No raw metrics or private notes.</p></div><div className="card solid"><span className="badge purple">Guardian</span><h3>Education guardian</h3><p>Extended access only when family and school approve.</p></div></section>
      <section className="section card solid"><h3>Access log</h3><div className="table-wrap"><table className="table"><thead><tr><th>Date</th><th>Recipient</th><th>Scope</th><th>Status</th></tr></thead><tbody>{consent.length ? consent.map((item: any) => <tr key={item.id || `${item.updatedAt}-${item.target}`}><td>{formatDate(item.updatedAt)}</td><td>{item.target}</td><td>{item.scope}</td><td>{item.status}</td></tr>) : <tr><td colSpan={4}>Backend has not returned consent history yet.</td></tr>}</tbody></table></div></section>
    </ParentShell>
  );
}

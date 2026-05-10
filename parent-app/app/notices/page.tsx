export const dynamic = "force-dynamic";

import ParentShell from "../../components/ParentShell";
import { formatDate, onepadApi } from "../../lib/api";

export default async function NoticesPage() {
  const response = await onepadApi.notices() as any;
  const notices = Array.isArray(response.notices) ? response.notices : [];

  return (
    <ParentShell>
      <section className="section card solid parent-home-intro"><h2>Notices</h2><p>School announcements, parent meetings, exam schedule, events, holidays, and activities.</p></section>
      <section className="section grid cols-3">{notices.length ? notices.map((notice: any) => <div className="card solid" key={notice.id || notice.title}><span className="badge">{notice.type}</span><h3>{notice.title}</h3><p>{formatDate(notice.date)}</p><p>{notice.summary}</p></div>) : <div className="card solid"><h3>No notices yet</h3><p>Backend should return school notices and events.</p></div>}</section>
    </ParentShell>
  );
}

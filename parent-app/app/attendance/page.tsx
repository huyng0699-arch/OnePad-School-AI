export const dynamic = "force-dynamic";

import ParentShell from "../../components/ParentShell";
import { formatDate, onepadApi, statusText } from "../../lib/api";

export default async function AttendancePage() {
  const response = await onepadApi.attendance() as any;
  const attendance = Array.isArray(response.attendance) ? response.attendance : [];

  return (
    <ParentShell>
      <section className="section card solid parent-home-intro"><h2>Attendance</h2><p>Present, absent, late, leave requests, and school confirmation.</p></section>
      <section className="section card solid"><div className="table-wrap"><table className="table"><thead><tr><th>Date</th><th>Status</th><th>Note</th></tr></thead><tbody>{attendance.length ? attendance.map((row: any) => <tr key={row.date}><td>{formatDate(row.date)}</td><td>{statusText(row.status)}</td><td>{row.note}</td></tr>) : <tr><td colSpan={3}>Backend has not returned attendance history yet.</td></tr>}</tbody></table></div></section>
    </ParentShell>
  );
}

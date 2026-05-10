import Link from "next/link";
import { onepadApi } from "../../../lib/api";

export default async function Page() {
  const data = await onepadApi.listAuthoringProjects("teacher_001");
  return (
    <div className="shell">
      <main className="main">
        <h2>Authoring Projects</h2>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Title</th><th>Status</th><th>Scope</th><th>Open</th></tr></thead>
            <tbody>
              {(data.projects || []).map((p: any) => (
                <tr key={p.id}>
                  <td>{p.title}</td>
                  <td>{p.status}</td>
                  <td>{p.aiKeyScope}</td>
                  <td><Link href={`/authoring/projects/${p.id}`}>Open</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

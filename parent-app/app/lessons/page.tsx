import { onepadApi } from "../../lib/api";

export default async function Page() {
  const data = await onepadApi.parentLessons();
  return (
    <div className="shell">
      <main className="main">
        <h2>Assigned Lessons</h2>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Lesson ID</th><th>Class</th><th>Subject</th><th>Published</th><th>Export</th></tr></thead>
            <tbody>
              {(data.lessons || []).map((row: any) => (
                <tr key={row.lessonId}>
                  <td>{row.lessonId}</td>
                  <td>{row.classId}</td>
                  <td>{row.subject}</td>
                  <td>{new Date(row.publishedAt).toLocaleDateString()}</td>
                  <td>{row.exportUrl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

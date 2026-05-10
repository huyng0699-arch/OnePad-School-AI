import { onepadApi } from "../../../lib/api";

export default async function Page() {
  const data = await onepadApi.teacherPublishedLessons("teacher_001");
  return (
    <div className="shell">
      <main className="main">
        <h2>Published Lessons</h2>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Lesson</th><th>Class</th><th>Subject</th><th>Published</th></tr></thead>
            <tbody>
              {(data.lessons || []).map((row: any) => (
                <tr key={row.id}>
                  <td>{row.lessonId}</td>
                  <td>{row.classId}</td>
                  <td>{row.subject}</td>
                  <td>{new Date(row.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

import { onepadApi } from "../../../../lib/api";

export default async function Page({ params }: { params: { projectId: string } }) {
  const data = await onepadApi.getAuthoringProject(params.projectId);
  const project = data?.project;
  const lesson = data?.lesson?.structuredJson;
  return (
    <div className="shell">
      <main className="main">
        <h2>Project {params.projectId}</h2>
        <p>{project ? `${project.title} · ${project.subject} · grade ${project.grade}` : "Project not found."}</p>
        {lesson ? (
          <div className="card solid">
            <h3>Structured Preview</h3>
            <p>Title: {lesson.title}</p>
            <p>Pages: {lesson.pages?.length || 0}</p>
            <p>Quiz seeds: {lesson.quizSeeds?.length || 0}</p>
          </div>
        ) : null}
      </main>
    </div>
  );
}

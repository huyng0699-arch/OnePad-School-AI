"use client";

import { useState } from "react";
import RealArModelViewer from "../../components/RealArModelViewer";
import { arAssignments, class8AStudents } from "../../lib/demoData";

export default function Page() {
  const [selected, setSelected] = useState(arAssignments[0]);

  return (
    <>
      <section className="hero">
        <div className="hero-top">
          <div>
            <div className="kicker">AR Assignments</div>
            <h2>Send real WebAR 3D lab tasks students can open on device.</h2>
            <p>Powered by Google model-viewer with WebXR, Android Scene Viewer, and iOS Quick Look fallback.</p>
          </div>
        </div>
      </section>

      <section className="section split">
        <div className="card solid">
          <h3>AR Lab Library</h3>
          {arAssignments.map((item) => (
            <button className={`lab-card ${selected.id === item.id ? "selected" : ""}`} key={item.id} onClick={() => setSelected(item)}>
              <strong>{item.title}</strong>
              <small>{item.model} · {item.status} · {item.completion}% complete</small>
            </button>
          ))}
        </div>

        <div className="card dark">
          <h3>{selected.title}</h3>
          <p>{selected.prompt}</p>
          <RealArModelViewer src={selected.modelUrl} title={selected.title} prompt={selected.model} />
          <div className="pill-row">
            <button>Assign to review group</button>
            <button>Preview student view</button>
          </div>
        </div>
      </section>

      <section className="section card solid">
        <h3>Student AR Progress</h3>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Student</th><th>Group</th><th>AR status</th><th>Action</th></tr></thead>
            <tbody>
              {class8AStudents.slice(0, 10).map((student) => (
                <tr key={student.id}><td>{student.fullName}</td><td>{student.group}</td><td>{student.arProgress}</td><td><button>Send nudge</button></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

"use client";

import { useMemo, useState } from "react";
import { assignments } from "../../lib/demoData";

export default function TeacherAssignmentsPage(){
  const [status, setStatus] = useState("All");
  const [title, setTitle] = useState("Membrane Transport Exit Ticket");
  const filtered = useMemo(() => assignments.filter((a) => status === "All" || a.status === status), [status]);
  return <>
    <section className="hero"><div className="hero-top"><div><div className="kicker">Assignments</div><h2>Build, schedule, and monitor class work.</h2><p>Create assignments with local AI rules, due dates, difficulty, and group-work mode.</p></div><div className="status-pill"><span className="dot" /> {filtered.length} visible</div></div></section>
    <section className="section grid cols-3"><div className="card solid"><h3>Quick Create</h3><label>Title<input value={title} onChange={(e)=>setTitle(e.target.value)} /></label><label>Type<select><option>Quiz</option><option>Practice</option><option>AR Lab</option><option>Review</option></select></label><label>Due date<input type="datetime-local" /></label><div className="pill-row"><button>Save draft</button><button>Publish to 8A</button></div><p className="footer-note">Demo action: updates stay client-side for now.</p></div><div className="card"><div className="metric"><span>Open completion</span><strong>65%</strong></div></div><div className="card"><div className="metric"><span>Need grading</span><strong>11</strong></div></div></section>
    <section className="section card solid"><div className="toolbar"><select value={status} onChange={(e)=>setStatus(e.target.value)}><option>All</option><option>Open</option><option>Draft</option><option>Scheduled</option></select><button>Bulk remind missing students</button><button>Export CSV</button></div><div className="table-wrap"><table className="table"><thead><tr><th>Assignment</th><th>Type</th><th>Due</th><th>Status</th><th>Completion</th><th>AI</th><th>Actions</th></tr></thead><tbody>{filtered.map((a)=><tr key={a.id}><td><strong>{a.title}</strong><br /><span className="muted">{a.difficulty}</span></td><td>{a.type}</td><td>{a.due}</td><td><span className="badge">{a.status}</span></td><td><div className="progress"><span style={{width:`${a.completion}%`}} /></div></td><td>{a.aiAllowed}</td><td><button>Duplicate</button> <button>Review</button></td></tr>)}</tbody></table></div></section>
  </>;
}


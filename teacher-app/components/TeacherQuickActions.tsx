"use client";

import { useState } from "react";

type ModalType = "lesson" | "quiz" | "ar" | "group" | "note" | "parent" | null;

export default function TeacherQuickActions() {
  const [open, setOpen] = useState<ModalType>(null);
  const [status, setStatus] = useState("Ready");

  const title: Record<string, string> = {
    lesson: "Create Lesson",
    quiz: "Assign Quiz",
    ar: "Assign AR",
    group: "Create Review Group",
    note: "Add Note",
    parent: "Message Parent",
  };

  return <section className="section card solid"><h3>Teacher Quick Actions</h3><div className="pill-row">
    <button className="badge" onClick={()=>setOpen("lesson")}>Create Lesson</button>
    <button className="badge teal" onClick={()=>setOpen("quiz")}>Assign Quiz</button>
    <button className="badge amber" onClick={()=>setOpen("ar")}>Assign AR</button>
    <button className="badge purple" onClick={()=>setOpen("group")}>Create Review Group</button>
    <button className="badge" onClick={()=>setOpen("note")}>Add Note</button>
    <button className="badge teal" onClick={()=>setOpen("parent")}>Message Parent</button>
  </div><p className="footer-note">{status}</p>
  {open ? <div style={{ position: "fixed", inset: 0, background: "rgba(2,6,23,.45)", display: "grid", placeItems: "center", zIndex: 50 }}><div className="card solid" style={{ width: "min(760px,92vw)" }}><h3>{title[open]}</h3>
    <div className="grid cols-2">
      {open==="lesson" && <><label>Title<input defaultValue="Cell Structure Review" /></label><label>Subject<input defaultValue="Biology" /></label><label>Class<input defaultValue="Class 8A" /></label><label>Objectives<input defaultValue="Identify organelles and functions" /></label><label>Content blocks<input defaultValue="Diagram + explanation + quiz" /></label><label>Action<select><option>Save</option><option>Publish</option></select></label></>}
      {open==="quiz" && <><label>Class / student<input defaultValue="Class 8A" /></label><label>Lesson<input defaultValue="Cell Structure Review" /></label><label>Difficulty<select><option>Medium</option><option>Easy</option><option>Hard</option></select></label><label>Due date<input type="date" /></label></>}
      {open==="ar" && <><label>Class / student<input defaultValue="Class 8A" /></label><label>AR model URL<input defaultValue="https://example.com/cell-model" /></label><label>Instructions<input defaultValue="Open model and label organelles" /></label><label>Due date<input type="date" /></label></>}
      {open==="group" && <><label>Concept<input defaultValue="Cell membrane transport" /></label><label>Auto-select students<select><option>Yes</option><option>No</option></select></label><label>Assign review<input defaultValue="Targeted review worksheet" /></label></>}
      {open==="note" && <><label>Note type<select><option>Private teacher note</option><option>Parent-safe note</option></select></label><label>Follow-up date<input type="date" /></label></>}
      {open==="parent" && <><label>Template<input defaultValue="Weekly update" /></label><label>Message<input defaultValue="Minh needs short Biology review blocks this week." /></label><label>Attach parent-safe report<select><option>Yes</option><option>No</option></select></label></>}
    </div>
    <div className="pill-row section"><button className="badge" onClick={()=>{setStatus(`${title[open]} saved`);setOpen(null);}}>Confirm</button><button className="badge red" onClick={()=>setOpen(null)}>Cancel</button></div>
  </div></div> : null}
  </section>;
}


export const dynamic = "force-dynamic";

import ParentShell from "../../components/ParentShell";
import { onepadApi } from "../../lib/api";

export default async function ParentNotesPage() {
  const response = await onepadApi.parentNotes() as any;
  const notes = Array.isArray(response.notes) ? response.notes : [];

  return (
    <ParentShell>
      <section className="section card solid parent-home-intro"><h2>Parent Notes</h2><p>Private parent notes with optional sharing to teachers when parent consents.</p></section>
      <section className="section grid cols-2">{notes.length ? notes.map((note: any) => <div className="card solid" key={note.id || note.title}><span className="badge">{note.sharing}</span><h3>{note.title}</h3><p>{note.body}</p><p className="footer-note">Linked to: {note.linkedTo}</p></div>) : <div className="card solid"><h3>No parent notes yet</h3><p>Backend should return private or shareable parent notes.</p></div>}</section>
    </ParentShell>
  );
}

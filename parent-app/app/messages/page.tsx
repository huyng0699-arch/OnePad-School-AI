export const dynamic = "force-dynamic";

import ParentShell from "../../components/ParentShell";
import { formatDate, onepadApi } from "../../lib/api";

export default async function ParentMessagesPage(){
  const response = await onepadApi.messages() as any;
  const messages = Array.isArray(response.messages) ? response.messages : [];

  return (
    <ParentShell>
      <section className="section card solid parent-home-intro"><h2>Messages</h2><p>Homeroom teacher messages, subject teacher messages, school notices, parent replies, and report attachments.</p></section>
      <section className="section card solid"><div className="health-stack">{messages.length ? messages.map((msg: any) => <div key={msg.id || msg.subject}><span>{formatDate(msg.date || msg.createdAt)} · {msg.role}</span><strong>{msg.from}: {msg.subject}</strong><p>{msg.body}</p></div>) : <div><span>Backend</span><strong>No messages returned yet</strong></div>}</div></section>
    </ParentShell>
  );
}

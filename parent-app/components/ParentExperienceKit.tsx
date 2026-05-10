import Link from "next/link";
import { formatDate, levelLabel } from "../lib/api";

type Level = "normal" | "monitor" | "attention" | "urgent" | "unknown" | string | undefined;


function uiText(value: any, fallback = "Pending") {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return fallback;
  const rules: Array<[RegExp, string]> = [
    [/Vận động gần nhất khoảng ([0-9.]+) phút\.?/i, "Latest movement estimate: about $1 active minutes."],
    [/Giấc ngủ gần nhất khoảng ([0-9.]+) giờ\.?/i, "Latest sleep estimate: about $1 hours."],
    [/Phụ huynh kiểm soát chia sẻ; giáo viên chỉ xem tóm tắt khi được cho phép\.?/i, "Parent-controlled sharing; teachers can view only approved safe summaries."],
    [/Nên liên hệ giáo viên chủ nhiệm nếu tín hiệu hỗ trợ tiếp diễn thêm 2-3 ngày\.?/i, "Contact the homeroom teacher if the support signal continues for another 2-3 days."],
    [/Hôm nay con hiểu phần nào nhất\??/i, "Which part felt clearest today?"],
    [/Có phần nào con muốn ôn lại cùng bố\/mẹ không\??/i, "Is there one part you want to review together?"],
    [/Con muốn hỏi giáo viên điều gì\??/i, "What would you like to ask the teacher?"],
    [/ôn khái niệm chính/i, "review the core concept"],
    [/Không so sánh với bạn khác/i, "Do not compare with classmates."],
    [/Không hỏi dồn khi con mệt/i, "Do not ask repeated questions when the child is tired."],
    [/Không yêu cầu học thêm nếu đã quá tải/i, "Do not add extra practice if the child is overloaded."],
  ];
  let out = text;
  for (const [rule, replacement] of rules) out = out.replace(rule, replacement);
  if (/[ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯăẮẰẲẴẶắằẳẵặÂẦẤẨẪẬầấẩẫậÊỀẾỂỄỆềếểễệÔỒỐỔỖỘồốổỗộƠỜỚỞỠỢờớởỡợƯỪỨỬỮỰừứửữựỲÝỶỸỴỳýỷỹỵ]/.test(out)) return "Backend returned non-English content; reseed backend with the English parent demo dataset.";
  return out;
}

function badgeClass(level?: Level) {
  if (level === "urgent" || level === "attention") return "badge amber";
  if (level === "monitor") return "badge purple";
  if (level === "normal") return "badge teal";
  return "badge";
}

export function ParentHero({ title, eyebrow, description, level, right }: { title: string; eyebrow?: string; description: string; level?: Level; right?: React.ReactNode }) {
  return (
    <section className="section card solid parent-hero-compact">
      <div className="section-title align-start">
        <div>
          {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <div className="hero-actions">{level ? <span className={badgeClass(level)}>{levelLabel(level)}</span> : null}{right}</div>
      </div>
    </section>
  );
}

export function EvidenceRail({ items }: { items: Array<{ label: string; value: string | number; hint?: string; level?: Level }> }) {
  return (
    <div className="evidence-rail">
      {items.map((item) => (
        <div className="evidence-tile" key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          {item.hint ? <small>{item.hint}</small> : null}
          {item.level ? <em className={badgeClass(item.level)}>{levelLabel(item.level)}</em> : null}
        </div>
      ))}
    </div>
  );
}

export function ActionProtocol({ title, steps, footer }: { title: string; steps: string[]; footer?: string }) {
  return (
    <div className="action-protocol card solid">
      <div className="protocol-header"><span className="badge purple">Guided action</span><h3>{title}</h3></div>
      <ol>
        {steps.map((step, index) => <li key={`${index}-${uiText(step)}`}><span>{index + 1}</span><p>{uiText(step)}</p></li>)}
      </ol>
      {footer ? <p className="footer-note">{footer}</p> : null}
    </div>
  );
}

export function InsightMatrix({ title, description, items }: { title: string; description?: string; items: Array<{ title: string; value: string; note?: string; level?: Level }> }) {
  return (
    <section className="section card solid">
      <div className="section-title"><div><h3>{title}</h3>{description ? <p>{description}</p> : null}</div></div>
      <div className="insight-matrix">
        {items.map((item) => (
          <div className="insight-cell" key={item.title}>
            <span className={badgeClass(item.level)}>{item.level ? levelLabel(item.level) : "Parent-safe"}</span>
            <strong>{item.title}</strong>
            <p>{item.value}</p>
            {item.note ? <small>{item.note}</small> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export function EmptyBackendState({ title = "Waiting for backend data", message = "This screen is rendered, but it does not invent parent data. It will populate when the backend returns parent-safe records." }: { title?: string; message?: string }) {
  return <div className="empty-backend"><strong>{title}</strong><p>{message}</p></div>;
}

export function AlertSeverityPanel({ alerts }: { alerts: any[] }) {
  const urgent = alerts.filter((a) => a.level === "urgent").length;
  const attention = alerts.filter((a) => a.level === "attention").length;
  const monitor = alerts.filter((a) => a.level === "monitor").length;
  const avgConfidence = alerts.length ? Math.round(alerts.reduce((s, a) => s + Number(a.confidence || 0), 0) / alerts.length * 100) : 0;
  return <EvidenceRail items={[
    { label: "Urgent", value: urgent, hint: "School-level support" },
    { label: "Attention", value: attention, hint: "Parent action needed" },
    { label: "Monitor", value: monitor, hint: "Watch at home" },
    { label: "Avg. confidence", value: `${avgConfidence}%`, hint: "Backend evidence score" },
  ]} />;
}

export function AlertCards({ alerts }: { alerts: any[] }) {
  if (!alerts.length) return <EmptyBackendState title="No active alerts" message="Backend has not returned parent-visible alerts for this student." />;
  return (
    <div className="alert-card-grid">
      {alerts.slice(0, 6).map((alert) => (
        <article className="alert-card" key={alert.id}>
          <div className="section-title compact"><div><span className={badgeClass(alert.level)}>{levelLabel(alert.level)}</span><h4>{alert.title}</h4></div><small>{formatDate(alert.createdAt)}</small></div>
          <p>{alert.summary}</p>
          <div className="alert-metrics"><span>Evidence: {alert.evidenceCount ?? "-"}</span><span>Confidence: {alert.confidence ? `${Math.round(alert.confidence * 100)}%` : "-"}</span></div>
          <strong className="recommended-action">{alert.recommendedAction}</strong>
        </article>
      ))}
    </div>
  );
}

export function SupportPlanBoard({ plan }: { plan: any }) {
  const questions = Array.isArray(plan.tonightQuestions) ? plan.tonightQuestions : [];
  const reviewItems = Array.isArray(plan.reviewItems) ? plan.reviewItems : [];
  const doNotPressure = Array.isArray(plan.doNotPressure) ? plan.doNotPressure : [];
  const microPlan = Array.isArray(plan.microPlan) ? plan.microPlan : [];
  const scripts = Array.isArray(plan.parentScripts) ? plan.parentScripts : [];
  const evidence = Array.isArray(plan.evidenceMap) ? plan.evidenceMap : [];
  return (
    <>
      <section className="section grid cols-3">
        <div className="card solid feature-card"><span className="badge teal">Tonight</span><h3>Ask with low pressure</h3>{questions.length ? questions.map((q: string) => <p className="question-line" key={uiText(q)}>{uiText(q)}</p>) : <EmptyBackendState title="No questions" message="Backend has not returned home questions." />}</div>
        <div className="card solid feature-card"><span className="badge purple">Review target</span><h3>One short focus block</h3><div className="trait-list">{reviewItems.length ? reviewItems.map((item: string) => <span key={item}>{uiText(item)}</span>) : <span>No review items yet</span>}</div><p>Support time: {uiText(plan.supportTime, "Pending")}</p></div>
        <div className="card solid feature-card"><span className="badge amber">Escalation rule</span><h3>When to contact school</h3><p>{uiText(plan.contactTeacherWhen, "Backend has not returned escalation criteria.")}</p></div>
      </section>
      <section className="section split wide-left">
        <ActionProtocol title="20-minute parent protocol" steps={microPlan.length ? microPlan : ["Open with one calm question.", "Review one concept only.", "Stop before fatigue increases."]} footer="The goal is not more homework; the goal is safer home support." />
        <div className="card solid"><h3>Do not pressure</h3>{doNotPressure.length ? <ul className="check-list danger">{doNotPressure.map((item: string) => <li key={item}>{uiText(item)}</li>)}</ul> : <p>Backend has not returned pressure-avoidance rules.</p>}</div>
      </section>
      <section className="section grid cols-2">
        <div className="card solid"><h3>Parent conversation scripts</h3><div className="health-stack">{scripts.length ? scripts.map((s: any) => <div key={s.label || s.text}><span>{s.label || "Script"}</span><strong>{uiText(s.text || s)}</strong><p>{uiText(s.why, "Keeps the conversation supportive and specific.")}</p></div>) : <div><span>Backend</span><strong>No scripts returned yet.</strong></div>}</div></div>
        <div className="card solid"><h3>Evidence behind the plan</h3><div className="health-stack">{evidence.length ? evidence.map((e: any) => <div key={e.source || e.signal}><span>{e.source || "Signal"}</span><strong>{uiText(e.signal || e.title)}</strong><p>{uiText(e.parentMeaning || e.meaning, "Parent-safe interpretation.")}</p></div>) : <div><span>Backend</span><strong>No evidence map returned yet.</strong></div>}</div></div>
      </section>
    </>
  );
}

export function VaultBoard({ vault, chart }: { vault: any; chart: any[] }) {
  const accessHistory = Array.isArray(vault.accessHistory) ? vault.accessHistory : [];
  const guardrails = Array.isArray(vault.guardrails) ? vault.guardrails : ["No raw private chat is shown.", "Health details are parent-controlled.", "Teachers see only approved safe summaries."];
  const routine = Array.isArray(vault.routineSignals) ? vault.routineSignals : [];
  return (
    <>
      <section className="section grid cols-4">
        <div className="card solid vault-stat"><span>Activity</span><strong>{uiText(vault.activitySummary, "Pending")}</strong></div>
        <div className="card solid vault-stat"><span>Sleep & routine</span><strong>{uiText(vault.sleepRoutine, "Pending")}</strong></div>
        <div className="card solid vault-stat"><span>Learning stress</span><strong>{uiText(vault.learningStress, "Pending")}</strong></div>
        <div className="card solid vault-stat"><span>Sharing</span><strong>{uiText(vault.sharingStatus, "Parent controlled")}</strong></div>
      </section>
      <section className="section grid cols-2">
        <div className="card solid"><h3>Routine signals</h3><div className="health-stack">{routine.length ? routine.map((r: any) => <div key={r.label}><span>{r.label}</span><strong>{uiText(r.value)}</strong><p>{uiText(r.parentMeaning)}</p></div>) : <div><span>Backend</span><strong>No routine signal list returned.</strong></div>}</div></div>
        <div className="card solid"><h3>Privacy guardrails</h3><ul className="check-list">{guardrails.map((g: string) => <li key={uiText(g)}>{uiText(g)}</li>)}</ul></div>
      </section>
      <section className="section card solid"><h3>Access history</h3><div className="table-wrap"><table className="table"><thead><tr><th>Date</th><th>Actor</th><th>Action</th><th>Reason</th></tr></thead><tbody>{accessHistory.length ? accessHistory.map((row: any) => <tr key={`${row.date}-${row.actor}-${row.action}`}><td>{formatDate(row.date)}</td><td>{row.actor}</td><td>{uiText(row.action)}</td><td>{uiText(row.reason, "Parent-safe access")}</td></tr>) : <tr><td colSpan={4}>Backend has not returned access history yet.</td></tr>}</tbody></table></div></section>
      <section className="section card solid"><h3>14-day parent-safe trend</h3><div className="trend-strip">{chart.length ? chart.map((point: any) => <div className="trend-node" key={point.date}><span>{formatDate(point.date)}</span><strong>{point.label}</strong><small>Hidden score not shown</small></div>) : <EmptyBackendState title="No trend points" />}</div></section>
    </>
  );
}

export function LoginAccountGrid({ accounts, action }: { accounts: any[]; action: any }) {
  if (!accounts.length) return <EmptyBackendState title="No backend login records" message="Backend should return /v1/parent/login-options with accounts or options." />;
  return (
    <div className="login-grid enhanced-login-grid">
      {accounts.map((account) => (
        <form className="login-card enhanced-login-card" action={action} key={`${account.parentId}-${account.studentId}`}>
          <input type="hidden" name="parentId" value={account.parentId || ""} />
          <input type="hidden" name="parentName" value={account.parentName || ""} />
          <input type="hidden" name="studentId" value={account.studentId || ""} />
          <input type="hidden" name="studentName" value={account.studentName || ""} />
          <input type="hidden" name="className" value={account.className || ""} />
          <input type="hidden" name="schoolName" value={account.schoolName || ""} />
          <div className="section-title compact"><div><span className="badge teal">{account.relationship || "Parent"}</span><h4>{account.studentName || account.studentId}</h4></div><small>{account.className || "Class pending"}</small></div>
          <p>{account.schoolName || "School pending"}</p>
          <div className="health-stack compact-stack"><div><span>Parent</span><strong>{account.parentName || account.parentId}</strong></div><div><span>Student ID</span><strong>{account.studentId}</strong></div><div><span>Homeroom</span><strong>{account.homeroomTeacher || "Pending"}</strong></div></div>
          <button className="button-link wide-button" type="submit">Select this parent-student record</button>
        </form>
      ))}
    </div>
  );
}

export function DetailLinkGrid({ items }: { items: Array<{ href: string; title: string; text: string }> }) {
  return <div className="detail-link-grid">{items.map((item) => <Link href={item.href} key={item.href} className="detail-link-card"><strong>{item.title}</strong><span>{item.text}</span></Link>)}</div>;
}

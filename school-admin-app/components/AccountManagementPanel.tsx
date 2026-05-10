"use client";

import { useEffect, useMemo, useState } from "react";
import type { SchoolAccount } from "../lib/adminData";

type AccountStatus = SchoolAccount["status"];
type AccountRole = SchoolAccount["role"];
type Account = SchoolAccount;

const storageKey = "onepad-admin-accounts";

function makePassword() {
  const part = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `OP-${part}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export default function AccountManagementPanel({ initialAccounts }: { initialAccounts: Account[] }) {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [form, setForm] = useState({ displayName: "", username: "", role: "Teacher", scope: "Class 8A" });
  const [issuedPassword, setIssuedPassword] = useState("");
  const [audit, setAudit] = useState<string[]>([]);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) setAccounts(JSON.parse(saved));
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(accounts));
  }, [accounts]);

  const metrics = useMemo(() => ({
    active: accounts.filter((a) => a.status === "Active").length,
    pending: accounts.filter((a) => a.status === "Pending setup").length,
    locked: accounts.filter((a) => a.status === "Locked").length,
    admins: accounts.filter((a) => a.role === "School Admin").length,
  }), [accounts]);

  function addAudit(line: string) {
    setAudit((items) => [`${new Date().toLocaleString("en-US")} - ${line}`, ...items].slice(0, 8));
  }

  function createAccount() {
    if (!form.displayName.trim() || !form.username.trim()) return;
    const password = makePassword();
    const account: Account = {
      id: `acc_${Date.now()}`,
      displayName: form.displayName.trim(),
      username: form.username.trim().toLowerCase(),
      role: form.role as AccountRole,
      scope: form.scope.trim() || "Whole school",
      status: "Pending setup",
      lastLogin: "Never",
      passwordPolicy: "Temporary password, force change on first login",
    };
    setAccounts((items) => [account, ...items]);
    setIssuedPassword(password);
    addAudit(`Created ${account.role} account ${account.username} and issued temporary password`);
    setForm({ displayName: "", username: "", role: "Teacher", scope: "Class 8A" });
  }

  function resetPassword(account: Account) {
    const password = makePassword();
    setIssuedPassword(password);
    setAccounts((items) => items.map((item) => item.id === account.id ? { ...item, status: "Pending setup", passwordPolicy: "Password reset, force change on next login" } : item));
    addAudit(`Reset password for ${account.username}`);
  }

  function toggleLock(account: Account) {
    const nextStatus: AccountStatus = account.status === "Locked" ? "Active" : "Locked";
    setAccounts((items) => items.map((item) => item.id === account.id ? { ...item, status: nextStatus } : item));
    addAudit(`${nextStatus === "Locked" ? "Locked" : "Unlocked"} account ${account.username}`);
  }

  return (
    <>
      <section className="section grid cols-4">
        <div className="card"><div className="metric"><span>Active accounts</span><strong>{metrics.active}</strong></div></div>
        <div className="card"><div className="metric"><span>Pending setup</span><strong>{metrics.pending}</strong></div></div>
        <div className="card"><div className="metric"><span>Locked</span><strong>{metrics.locked}</strong></div></div>
        <div className="card"><div className="metric"><span>School admins</span><strong>{metrics.admins}</strong></div></div>
      </section>

      <section className="section grid cols-2">
        <div className="card solid">
          <h3>Create a real school account</h3>
          <div className="form-grid">
            <label>Full name<input value={form.displayName} onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))} placeholder="Nguyen Van An" /></label>
            <label>Login username<input value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} placeholder="an.nguyen@nguyentrai.edu.vn" /></label>
            <label>Role<select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}><option>Teacher</option><option>Parent</option><option>Student</option><option>School Admin</option></select></label>
            <label>Access scope<input value={form.scope} onChange={(e) => setForm((f) => ({ ...f, scope: e.target.value }))} placeholder="Class 8A, Biology, or Whole school" /></label>
          </div>
          <div className="dialog-actions"><button type="button" className="primary-btn" onClick={createAccount}>Create account</button></div>
          {issuedPassword ? <div className="password-box"><span>Temporary password</span><strong>{issuedPassword}</strong><p>Give this once to the user. The account is marked to change password at first login.</p></div> : null}
        </div>

        <div className="card solid">
          <h3>Security policy</h3>
          <div className="policy-list">
            <div><strong>Teacher accounts</strong><span>Scoped by class, subject, homeroom, and consent rules.</span></div>
            <div><strong>Parent accounts</strong><span>Linked to one verified student profile, no raw internal notes.</span></div>
            <div><strong>Student accounts</strong><span>Device-bound login, class enrollment, local AI sync identity.</span></div>
            <div><strong>Admin accounts</strong><span>Full audit trail for account creation, reset, lock, and export.</span></div>
          </div>
        </div>
      </section>

      <section className="section card solid">
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Scope</th><th>Status</th><th>Last login</th><th>Password policy</th><th>Actions</th></tr></thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id}>
                  <td>{account.displayName}</td><td>{account.username}</td><td>{account.role}</td><td>{account.scope}</td><td>{account.status}</td><td>{account.lastLogin}</td><td>{account.passwordPolicy}</td>
                  <td><div className="action-row"><button type="button" onClick={() => resetPassword(account)}>Reset password</button><button type="button" onClick={() => toggleLock(account)}>{account.status === "Locked" ? "Unlock" : "Lock"}</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section card solid">
        <h3>Account audit trail</h3>
        {audit.length ? audit.map((item) => <p key={item} className="audit-line">{item}</p>) : <p>No account changes in this browser session.</p>}
      </section>
    </>
  );
}

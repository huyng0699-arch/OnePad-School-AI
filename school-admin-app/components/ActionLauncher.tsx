"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { submitAction, type ActionPayload } from "../lib/clientActionService";
import { useToast } from "./ui/ToastProvider";

type Variant = "modal" | "drawer" | "panel";
type Field = { name: string; label: string; type: "text" | "date" | "select" | "checkbox" | "datetime-local"; options?: string[]; required?: boolean; defaultValue?: string | boolean };

type ActionLauncherProps = {
  label: string;
  title: string;
  description: string;
  variant?: Variant;
  confirmLabel?: string;
  fields?: Field[];
};

function inferFields(label: string): Field[] {
  if (/Assign Teacher|Assign role/.test(label)) {
    return [
      { name: "teacher", label: "Teacher", type: "text", required: true, defaultValue: "teacher_001" },
      { name: "roleType", label: "Role", type: "select", options: ["Subject Teacher", "Homeroom Teacher", "Education Guardian"], defaultValue: "Subject Teacher" },
      { name: "subject", label: "Subject", type: "text", defaultValue: "Biology" },
      { name: "classId", label: "Class", type: "select", options: ["class_8a", "class_8b", "class_8c"], defaultValue: "class_8a" },
      { name: "permissionSet", label: "Permission set", type: "text", defaultValue: "Standard classroom access" },
      { name: "expiry", label: "Expiry", type: "date" },
      { name: "requiresConsent", label: "Requires parent consent", type: "checkbox", defaultValue: true },
    ];
  }
  if (/Grant access/.test(label)) {
    return [
      { name: "teacher", label: "User / Teacher", type: "text", required: true },
      { name: "roleType", label: "Role", type: "select", options: ["Subject Teacher", "Homeroom Teacher", "Education Guardian"] },
      { name: "classId", label: "Class", type: "select", options: ["class_8a", "class_8b", "class_8c"] },
      { name: "subject", label: "Subject", type: "text", defaultValue: "Biology" },
      { name: "permissionSet", label: "Permission set", type: "text" },
      { name: "expiry", label: "Access expiry", type: "date" },
      { name: "requiresConsent", label: "Requires parent consent", type: "checkbox", defaultValue: true },
      { name: "reason", label: "Reason", type: "text", required: true },
    ];
  }
  if (/Test access/.test(label)) {
    return [
      { name: "actor", label: "Actor", type: "text", required: true },
      { name: "target", label: "Target student/class", type: "text", required: true },
      { name: "dataType", label: "Data type", type: "select", options: ["Learning aggregate", "Support summary", "Guardian shared summary", "Private wellbeing detail"] },
    ];
  }
  if (/Publish|Schedule publish/.test(label)) {
    return [
      { name: "lesson", label: "Lesson", type: "text", required: true },
      { name: "classId", label: "Target class", type: "select", options: ["class_8a", "class_8b", "class_8c"] },
      { name: "targetStudents", label: "Target students (optional)", type: "text" },
      { name: "publishTime", label: "Publish time", type: "datetime-local" },
      { name: "requireQuiz", label: "Require quiz", type: "checkbox", defaultValue: false },
      { name: "includeAr", label: "Include AR", type: "checkbox", defaultValue: true },
    ];
  }
  if (/Add AR content/.test(label)) {
    return [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "subject", label: "Subject", type: "text", required: true },
      { name: "modelUrl", label: "AR model URL", type: "text", required: true },
      { name: "viewerUrl", label: "AR viewer URL", type: "text", required: true },
      { name: "thumbnailUrl", label: "Thumbnail URL", type: "text" },
      { name: "instructions", label: "Instructions", type: "text" },
      { name: "grade", label: "Grade", type: "text", defaultValue: "Grade 8" },
    ];
  }
  if (/Add lesson/.test(label)) {
    return [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "subject", label: "Subject", type: "text", required: true },
      { name: "grade", label: "Grade", type: "text", defaultValue: "Grade 8" },
      { name: "objectives", label: "Objectives", type: "text", required: true },
      { name: "contentSource", label: "Content source", type: "text", required: true },
      { name: "arLink", label: "Attach AR link (optional)", type: "text" },
    ];
  }
  return [{ name: "note", label: "Action note", type: "text", required: true }];
}

function defaultPayload(fields: Field[]): ActionPayload {
  const out: ActionPayload = {};
  fields.forEach((f) => {
    if (typeof f.defaultValue !== "undefined") out[f.name] = f.defaultValue;
    else out[f.name] = f.type === "checkbox" ? false : "";
  });
  return out;
}

export default function ActionLauncher({ label, title, description, variant = "modal", confirmLabel = "Save", fields }: ActionLauncherProps) {
  const inferred = useMemo(() => fields ?? inferFields(label), [fields, label]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [payload, setPayload] = useState<ActionPayload>(() => defaultPayload(inferred));
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { push } = useToast();

  useEffect(() => setPayload(defaultPayload(inferred)), [inferred, open]);

  useEffect(() => {
    if (!open || !containerRef.current) return;
    const focusables = containerRef.current.querySelectorAll<HTMLElement>("button, input, select, textarea");
    focusables[0]?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab" && focusables.length > 1) {
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  async function onSubmit() {
    const missing = inferred.find((f) => f.required && !String(payload[f.name] ?? "").trim());
    if (missing) {
      push("error", `Please fill required field: ${missing.label}`);
      return;
    }
    setSaving(true);
    push("info", "Submitting action...");
    const res = await submitAction(label, payload);
    setSaving(false);
    push("success", res.usedDemoFallback ? `${res.message} (Demo fallback)` : res.message);
    setOpen(false);
  }

  if (variant === "panel") {
    return (
      <details className="inline-details">
        <summary aria-label={label}>{label}</summary>
        <div className="inline-panel">
          <h4>{title}</h4>
          <p>{description}</p>
          <button type="button">Close panel</button>
        </div>
      </details>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={label}>{label}</button>
      {open ? (
        <div className="overlay" role="presentation" onClick={() => setOpen(false)}>
          <div className={variant === "drawer" ? "dialog drawer" : "dialog floating"} role="dialog" aria-modal="true" aria-label={title} ref={containerRef} onClick={(e) => e.stopPropagation()}>
            <h4>{title}</h4>
            <p>{description}</p>
            <div className="form-grid">
              {inferred.map((field) => (
                <label key={field.name}>
                  {field.label}
                  {field.type === "select" ? (
                    <select value={String(payload[field.name] ?? "")} onChange={(e) => setPayload((p) => ({ ...p, [field.name]: e.target.value }))}>
                      {(field.options ?? []).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : field.type === "checkbox" ? (
                    <input type="checkbox" checked={Boolean(payload[field.name])} onChange={(e) => setPayload((p) => ({ ...p, [field.name]: e.target.checked }))} />
                  ) : (
                    <input type={field.type} value={String(payload[field.name] ?? "")} onChange={(e) => setPayload((p) => ({ ...p, [field.name]: e.target.value }))} />
                  )}
                </label>
              ))}
            </div>
            <div className="dialog-actions">
              <button type="button" className="primary-btn" onClick={onSubmit} disabled={saving}>{saving ? "Saving..." : confirmLabel}</button>
              <button type="button" onClick={() => setOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

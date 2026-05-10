export type ActionPayload = Record<string, string | boolean>;

const API_BASE = process.env.NEXT_PUBLIC_ONEPAD_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000";

function saveLocal(action: string, payload: ActionPayload) {
  if (typeof window === "undefined") return;
  const key = "onepad_admin_action_log";
  const prev = JSON.parse(window.localStorage.getItem(key) || "[]") as Array<{ time: string; action: string; payload: ActionPayload }>;
  prev.unshift({ time: new Date().toISOString(), action, payload });
  window.localStorage.setItem(key, JSON.stringify(prev.slice(0, 300)));
}

export async function submitAction(action: string, payload: ActionPayload): Promise<{ ok: boolean; usedDemoFallback: boolean; message: string }> {
  saveLocal(action, payload);

  try {
    if (/Assign Teacher|Assign role|Grant access/.test(action)) {
      const r = await fetch(`${API_BASE}/v1/admin/permissions/assign-teacher-role`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-demo-user-id": "admin_001", "x-demo-role": "school_admin" },
        body: JSON.stringify({
          teacherId: String(payload.teacher || "teacher_001"),
          classId: String(payload.classId || "class_8a"),
          subjectId: String(payload.subject || "biology").toLowerCase(),
          roleType: String(payload.roleType || "subject_teacher").toLowerCase().replace(/\s+/g, "_"),
        }),
      });
      if (r.ok) return { ok: true, usedDemoFallback: false, message: "Saved to backend." };
    }
    return { ok: true, usedDemoFallback: true, message: "Saved in Demo fallback store." };
  } catch {
    return { ok: true, usedDemoFallback: true, message: "Saved in Demo fallback store." };
  }
}

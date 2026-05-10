import { NextResponse } from "next/server";

const DEFAULT_MODEL = process.env.TEACHER_AI_DEFAULT_MODEL || "gemini-2.5-flash";

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "GEMINI_API_KEY is not configured on the teacher app server." }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const prompt = String(body.prompt || "").trim();
  const modelId = String(body.modelId || DEFAULT_MODEL).trim();

  if (!prompt) {
    return NextResponse.json({ ok: false, error: "Prompt is required." }, { status: 400 });
  }

  const system = [
    "You are OnePad Teacher Guardian AI.",
    "Work only from the provided school, parent-consent, and student-log context.",
    "Never diagnose medical or mental-health conditions. Use cautious support language.",
    "Separate evidence, interpretation, and recommended next teacher action.",
    "If risk is urgent, recommend escalation to parent/school counselor using school policy.",
  ].join("\n");

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: `${system}\n\n${prompt}` }] }],
      generationConfig: { temperature: 0.35, maxOutputTokens: 1600 },
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return NextResponse.json({ ok: false, error: data?.error?.message || "Gemini request failed.", raw: data }, { status: response.status });
  }

  const text = data?.candidates?.[0]?.content?.parts?.map((part: any) => part.text || "").join("\n").trim() || "";
  return NextResponse.json({ ok: true, text, modelId, raw: data });
}

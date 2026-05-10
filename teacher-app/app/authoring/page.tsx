"use client";

import { useMemo, useState } from "react";
import { onepadApi } from "../../lib/api";
import {
  buildPageAiText,
  buildStructuredLessonFromTeacherInput,
  createEmptyDraft,
  generateLessonId,
  normalizeLessonForPublish,
  validateLessonDraft,
} from "../../src/services/lesson/lessonJsonBuilder";
import { runTeacherAiAction } from "../../src/services/teacherAi/teacherAiClient";
import { teacherAiSettingsService, type TeacherAiProvider } from "../../src/services/teacherAi/teacherAiSettingsService";
import type { LessonStudioBlockType, LessonStudioDraft } from "../../src/types/lessonStudio";

const tabs = [
  "Lesson Info",
  "Page Builder",
  "AI Teaching Assistant",
  "Quiz & Practice",
  "AR Lab Builder",
  "Preview as Student",
  "Publish",
] as const;

type TabName = (typeof tabs)[number];

function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export default function TeacherLessonStudioPage() {
  const [tab, setTab] = useState<TabName>("Lesson Info");
  const [draft, setDraft] = useState<LessonStudioDraft>({
    ...createEmptyDraft(),
    title: "Cell Structure",
    subject: "Biology",
    grade: "Grade 8",
    objectives: ["Identify core parts of a cell", "Explain each part function in simple words"],
  });
  const [selectedPageId, setSelectedPageId] = useState(draft.pages[0].id);
  const [selectedBlockType, setSelectedBlockType] = useState<LessonStudioBlockType>("paragraph");
  const [aiAction, setAiAction] = useState("create_examples");
  const [aiInstruction, setAiInstruction] = useState("");
  const [aiOutput, setAiOutput] = useState("");
  const [showJson, setShowJson] = useState(false);
  const [publishMessage, setPublishMessage] = useState("Ready");
  const [loading, setLoading] = useState(false);

  const [provider, setProvider] = useState<TeacherAiProvider>(teacherAiSettingsService.load().provider);
  const [modelId, setModelId] = useState(teacherAiSettingsService.load().modelId);
  const [personalKeyInput, setPersonalKeyInput] = useState("");
  const [aiSettingsStatus, setAiSettingsStatus] = useState(teacherAiSettingsService.load());

  const selectedPage = draft.pages.find((p) => p.id === selectedPageId) || draft.pages[0];

  const structuredLesson = useMemo(() => {
    const built = buildStructuredLessonFromTeacherInput({ ...draft, lessonId: draft.lessonId || generateLessonId(draft.title) });
    return normalizeLessonForPublish(built);
  }, [draft]);

  function updatePage(pageId: string, updater: (page: LessonStudioDraft["pages"][number]) => LessonStudioDraft["pages"][number]) {
    setDraft((prev) => ({
      ...prev,
      pages: prev.pages.map((p) => (p.id === pageId ? updater(p) : p)).map((p, idx) => ({ ...p, pageNumber: idx + 1 })),
    }));
  }

  function addBlock(type: LessonStudioBlockType) {
    updatePage(selectedPage.id, (p) => ({
      ...p,
      blocks: [...p.blocks, { id: newId("block"), type, text: "" }],
    }));
  }

  async function runAi() {
    setLoading(true);
    const pageIndex = draft.pages.findIndex((p) => p.id === selectedPage.id);
    const result = await runTeacherAiAction({
      action: aiAction as any,
      draft,
      pageIndex: pageIndex >= 0 ? pageIndex : undefined,
      customInstruction: aiInstruction,
    });
    setLoading(false);
    if (!result.ok) {
      setAiOutput(`Error: ${result.error}`);
      return;
    }
    setAiOutput(result.text);
  }

  function applyAiOutputToPage() {
    if (!aiOutput.trim()) return;
    updatePage(selectedPage.id, (p) => ({
      ...p,
      blocks: [...p.blocks, { id: newId("block"), type: "paragraph", text: aiOutput.trim() }],
    }));
    setAiOutput("Applied to page as new paragraph block.");
  }

  async function testAiConnection() {
    setLoading(true);
    const res = await onepadApi.teacherAiAssist({
      teacherId: "teacher_001",
      schoolId: "school_001",
      action: "check_lesson_clarity",
      modelId,
      aiProvider: provider,
      prompt: "Connection test for Teacher Lesson Studio. Reply with one short sentence.",
    });
    setLoading(false);
    if (!res?.ok) {
      setPublishMessage(res?.error || "AI API key is not configured.");
      return;
    }
    setPublishMessage("AI connection is healthy.");
  }

  async function publishLesson() {
    const errors = validateLessonDraft({ ...draft, lessonId: structuredLesson.id });
    if (errors.length > 0) {
      setPublishMessage(errors.join(" | "));
      return;
    }

    setLoading(true);
    const project = await onepadApi.createAuthoringProject({
      teacherId: "teacher_001",
      schoolId: "school_001",
      title: structuredLesson.title,
      subject: structuredLesson.subject,
      grade: structuredLesson.grade,
      language: structuredLesson.language,
      rawInput: JSON.stringify(structuredLesson),
      aiKeyScope: provider === "personal_gemini" ? "personal_key" : provider === "school_default" ? "school_key" : "disabled",
    });

    if (!project?.ok) {
      setLoading(false);
      setPublishMessage(project?.error || "Failed to create publish project.");
      return;
    }

    const standardize = await onepadApi.standardizeAuthoringProject(project.project.id, {
      teacherInstructions: "Use teacher-provided structured lesson exactly.",
      modelId,
      structuredLessonOverride: structuredLesson,
    });

    if (!standardize?.ok) {
      setLoading(false);
      setPublishMessage(standardize?.error || "Validation failed before publish.");
      return;
    }

    const published = await onepadApi.publishAuthoringProject(project.project.id, {
      classId: draft.classIds[0],
      requireQuiz: true,
      allowLocalAiHelp: true,
      groupWorkEnabled: false,
    });

    setLoading(false);
    if (!published?.ok) {
      setPublishMessage(published?.error || "Publish failed.");
      return;
    }

    setPublishMessage(`Published successfully. LessonId: ${published.lessonId}. File: ${published.fileUrl}`);
  }

  return (
    <div className="shell">
      <main className="main" style={{ maxWidth: 1280, margin: "0 auto" }}>
        <section className="hero" style={{ padding: 22 }}>
          <div className="hero-top">
            <div>
              <div className="kicker">Teacher Lesson Studio</div>
              <h2 style={{ fontSize: 38 }}>Create full lessons without writing code</h2>
              <p>Draft pages, ask AI for support, add AR blocks, preview as student, then publish real Structured Lesson JSON for Student App.</p>
            </div>
          </div>
        </section>

        <section className="section card solid">
          <div className="pill-row">
            {tabs.map((name) => (
              <button key={name} className={tab === name ? "badge" : "badge teal"} onClick={() => setTab(name)}>
                {name}
              </button>
            ))}
          </div>
        </section>

        {tab === "Lesson Info" && (
          <section className="section card solid">
            <h3>Lesson Info</h3>
            <div className="grid cols-2">
              <label>Lesson title<input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></label>
              <label>Subject<input value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} /></label>
              <label>Grade<input value={draft.grade} onChange={(e) => setDraft({ ...draft, grade: e.target.value })} /></label>
              <label>Estimated duration (minutes)<input type="number" value={draft.estimatedMinutes} onChange={(e) => setDraft({ ...draft, estimatedMinutes: Number(e.target.value) || 0 })} /></label>
              <label>Language
                <select value={draft.language} onChange={(e) => setDraft({ ...draft, language: e.target.value as any })}>
                  <option value="en">English</option><option value="vi">Vietnamese</option><option value="bilingual">Bilingual</option>
                </select>
              </label>
              <label>Target class
                <select value={draft.classIds[0]} onChange={(e) => setDraft({ ...draft, classIds: [e.target.value] })}>
                  <option value="class_8a">class_8a</option><option value="class_8b">class_8b</option><option value="class_8c">class_8c</option>
                </select>
              </label>
            </div>
            <label>Learning objectives (one per line)
              <textarea rows={4} value={draft.objectives.join("\n")} onChange={(e) => setDraft({ ...draft, objectives: e.target.value.split("\n") })} />
            </label>
            <label>Teacher notes<textarea rows={3} value={draft.teacherNotes} onChange={(e) => setDraft({ ...draft, teacherNotes: e.target.value })} /></label>
          </section>
        )}

        {tab === "Page Builder" && (
          <section className="section card solid">
            <h3>Page Builder</h3>
            <div className="pill-row" style={{ marginBottom: 12 }}>
              {draft.pages.map((p) => (
                <button key={p.id} className={selectedPageId === p.id ? "badge" : "badge teal"} onClick={() => setSelectedPageId(p.id)}>
                  Page {p.pageNumber}
                </button>
              ))}
              <button
                onClick={() => {
                  const id = newId("page");
                  setDraft((prev) => ({ ...prev, pages: [...prev.pages, { id, pageNumber: prev.pages.length + 1, title: "", blocks: [] }] }));
                  setSelectedPageId(id);
                }}
              >
                Add page
              </button>
            </div>

            <label>Page title
              <input value={selectedPage.title} onChange={(e) => updatePage(selectedPage.id, (p) => ({ ...p, title: e.target.value }))} />
            </label>
            <label>Page learning objective
              <input value={selectedPage.learningObjective || ""} onChange={(e) => updatePage(selectedPage.id, (p) => ({ ...p, learningObjective: e.target.value }))} />
            </label>

            <div className="pill-row section">
              <select value={selectedBlockType} onChange={(e) => setSelectedBlockType(e.target.value as LessonStudioBlockType)}>
                <option value="heading">Heading</option><option value="paragraph">Paragraph</option><option value="bullet_list">Bullet list</option>
                <option value="example">Example</option><option value="callout">Callout</option><option value="key_concept">Key concept</option>
                <option value="question">Question</option><option value="image">Image</option><option value="ar_model">AR object link</option><option value="teacher_note">Teacher note</option>
              </select>
              <button onClick={() => addBlock(selectedBlockType)}>Add content block</button>
              <button onClick={() => updatePage(selectedPage.id, (p) => ({ ...p, aiText: buildPageAiText(p) }))}>Generate page aiText</button>
            </div>

            {(selectedPage.blocks || []).map((block, index) => (
              <div key={block.id} className="callout section">
                <div className="pill-row" style={{ justifyContent: "space-between" }}>
                  <strong>{block.type}</strong>
                  <button onClick={() => updatePage(selectedPage.id, (p) => ({ ...p, blocks: p.blocks.filter((b) => b.id !== block.id) }))}>Delete block</button>
                </div>
                <textarea
                  rows={block.type === "bullet_list" ? 4 : 2}
                  placeholder={block.type === "bullet_list" ? "One bullet per line" : "Block content"}
                  value={block.type === "bullet_list" ? (block.items || []).join("\n") : block.text || ""}
                  onChange={(e) =>
                    updatePage(selectedPage.id, (p) => ({
                      ...p,
                      blocks: p.blocks.map((b) =>
                        b.id === block.id
                          ? block.type === "bullet_list"
                            ? { ...b, items: e.target.value.split("\n") }
                            : { ...b, text: e.target.value }
                          : b,
                      ),
                    }))
                  }
                />
                {block.type === "image" && (
                  <div className="grid cols-2">
                    <input placeholder="Image URL" value={block.imageUrl || ""} onChange={(e) => updatePage(selectedPage.id, (p) => ({ ...p, blocks: p.blocks.map((b) => (b.id === block.id ? { ...b, imageUrl: e.target.value } : b)) }))} />
                    <input placeholder="Alt text" value={block.imageAlt || ""} onChange={(e) => updatePage(selectedPage.id, (p) => ({ ...p, blocks: p.blocks.map((b) => (b.id === block.id ? { ...b, imageAlt: e.target.value } : b)) }))} />
                  </div>
                )}
                {block.type === "ar_model" && (
                  <div className="grid cols-2">
                    <input placeholder="Model URL (.glb/.gltf)" value={block.modelUrl || ""} onChange={(e) => updatePage(selectedPage.id, (p) => ({ ...p, blocks: p.blocks.map((b) => (b.id === block.id ? { ...b, modelUrl: e.target.value } : b)) }))} />
                    <input placeholder="Thumbnail URL" value={block.thumbnailUrl || ""} onChange={(e) => updatePage(selectedPage.id, (p) => ({ ...p, blocks: p.blocks.map((b) => (b.id === block.id ? { ...b, thumbnailUrl: e.target.value } : b)) }))} />
                    <input placeholder="AR title" value={block.title || ""} onChange={(e) => updatePage(selectedPage.id, (p) => ({ ...p, blocks: p.blocks.map((b) => (b.id === block.id ? { ...b, title: e.target.value } : b)) }))} />
                    <input placeholder="Interaction prompt" value={block.interactionPrompt || ""} onChange={(e) => updatePage(selectedPage.id, (p) => ({ ...p, blocks: p.blocks.map((b) => (b.id === block.id ? { ...b, interactionPrompt: e.target.value } : b)) }))} />
                  </div>
                )}
                <div className="pill-row">
                  <button disabled={index === 0} onClick={() => updatePage(selectedPage.id, (p) => {
                    const arr = [...p.blocks];
                    [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
                    return { ...p, blocks: arr };
                  })}>Move up</button>
                  <button disabled={index === selectedPage.blocks.length - 1} onClick={() => updatePage(selectedPage.id, (p) => {
                    const arr = [...p.blocks];
                    [arr[index + 1], arr[index]] = [arr[index], arr[index + 1]];
                    return { ...p, blocks: arr };
                  })}>Move down</button>
                </div>
              </div>
            ))}
          </section>
        )}

        {tab === "AI Teaching Assistant" && (
          <section className="section card solid">
            <h3>AI Teaching Assistant</h3>
            <div className="grid cols-2">
              <label>Action
                <select value={aiAction} onChange={(e) => setAiAction(e.target.value)}>
                  <option value="lesson_outline">Generate lesson outline</option>
                  <option value="improve_explanation">Improve explanation</option>
                  <option value="simplify_content">Simplify content</option>
                  <option value="create_examples">Create examples</option>
                  <option value="create_practice_questions">Create practice questions</option>
                  <option value="create_quiz">Create quiz</option>
                  <option value="teaching_script">Create teaching script</option>
                  <option value="ar_lab_idea">Create AR lab idea</option>
                  <option value="generate_page_ai_text">Generate page aiText</option>
                  <option value="check_lesson_clarity">Check lesson clarity</option>
                </select>
              </label>
              <label>Target page
                <select value={selectedPageId} onChange={(e) => setSelectedPageId(e.target.value)}>
                  {draft.pages.map((p) => <option key={p.id} value={p.id}>Page {p.pageNumber}: {p.title || "Untitled"}</option>)}
                </select>
              </label>
            </div>
            <label>Instruction (optional)<textarea rows={3} value={aiInstruction} onChange={(e) => setAiInstruction(e.target.value)} /></label>
            <div className="pill-row section">
              <button onClick={() => void runAi()} disabled={loading}>Run AI assistant</button>
              <button onClick={applyAiOutputToPage}>Apply result to page</button>
            </div>
            <textarea rows={12} value={aiOutput} onChange={(e) => setAiOutput(e.target.value)} placeholder="AI output appears here..." />

            <h3 style={{ marginTop: 20 }}>Teacher AI Settings</h3>
            <div className="grid cols-3">
              <label>AI provider
                <select value={provider} onChange={(e) => setProvider(e.target.value as TeacherAiProvider)}>
                  <option value="school_default">Default school AI</option>
                  <option value="personal_gemini">Personal Gemini API key</option>
                  <option value="local_cactus">Local / Cactus mode</option>
                </select>
              </label>
              <label>Model
                <select value={modelId} onChange={(e) => setModelId(e.target.value)}>
                  <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                  <option value="gemini-2.5-flash-lite">gemini-2.5-flash-lite</option>
                </select>
              </label>
              <label>Custom model value<input placeholder="Optional custom model" onBlur={(e) => e.target.value.trim() && setModelId(e.target.value.trim())} /></label>
            </div>
            <label>Personal API key<input type="password" value={personalKeyInput} onChange={(e) => setPersonalKeyInput(e.target.value)} placeholder="Enter only if using personal provider" /></label>
            <div className="pill-row section">
              <button onClick={() => {
                const next = teacherAiSettingsService.save({ provider, modelId }, personalKeyInput);
                setAiSettingsStatus(next);
                setPersonalKeyInput("");
                setPublishMessage(next.hasPersonalApiKey ? `Saved. Masked key: ${next.personalApiKeyMasked}` : "Using default school AI configuration.");
              }}>Save AI Settings</button>
              <button onClick={() => void testAiConnection()} disabled={loading}>Test AI Connection</button>
              <button onClick={() => {
                const next = teacherAiSettingsService.reset();
                setProvider(next.provider);
                setModelId(next.modelId);
                setAiSettingsStatus(next);
              }}>Reset to Default School AI</button>
            </div>
            <p className="footer-note">
              {aiSettingsStatus.hasPersonalApiKey ? `Personal key saved as ${aiSettingsStatus.personalApiKeyMasked}` : "No personal API key saved. Using default school AI configuration."}
            </p>
          </section>
        )}

        {tab === "Quiz & Practice" && (
          <section className="section card solid">
            <h3>Quiz & Practice</h3>
            <p className="footer-note">AI can generate quiz JSON in the assistant tab. You can also add questions manually here.</p>
            <button onClick={() => setDraft((prev) => ({
              ...prev,
              quizSeeds: [...prev.quizSeeds, { id: newId("quiz"), type: "short_answer", question: "", explanation: "", difficulty: "standard", skillTag: "concept" }],
            }))}>Add quiz item</button>
            {draft.quizSeeds.map((q, idx) => (
              <div key={q.id} className="callout section">
                <strong>Question {idx + 1}</strong>
                <input value={q.question} placeholder="Question" onChange={(e) => setDraft((prev) => ({ ...prev, quizSeeds: prev.quizSeeds.map((x) => x.id === q.id ? { ...x, question: e.target.value } : x) }))} />
                <input value={q.explanation} placeholder="Explanation" onChange={(e) => setDraft((prev) => ({ ...prev, quizSeeds: prev.quizSeeds.map((x) => x.id === q.id ? { ...x, explanation: e.target.value } : x) }))} />
              </div>
            ))}
          </section>
        )}

        {tab === "AR Lab Builder" && (
          <section className="section card solid">
            <h3>AR Lab Builder</h3>
            <p>Insert AR model blocks without coding. Supported input: model URL (.glb/.gltf), thumbnail, interaction prompt, fallback description.</p>
            <div className="pill-row">
              <button onClick={() => addBlock("ar_model")}>Insert AR block into selected page</button>
              <button onClick={() => setAiAction("ar_lab_idea")}>Ask AI for AR lab idea</button>
            </div>
            <div className="callout section">
              <strong>Sample AR asset</strong>
              <p className="footer-note">Animal cell demo URL: /models/animal-cell-grade8.glb (served from teacher-app/public/models)</p>
            </div>
          </section>
        )}

        {tab === "Preview as Student" && (
          <section className="section card solid">
            <h3>Preview as Student</h3>
            <p><b>{structuredLesson.title}</b> · {structuredLesson.subject} · {structuredLesson.grade}</p>
            {structuredLesson.pages.map((page) => (
              <div key={page.pageNumber} className="callout section">
                <h4>Page {page.pageNumber}: {page.title}</h4>
                <p>{page.aiText}</p>
                <ul>
                  {page.blocks.map((b) => (
                    <li key={b.id}>{b.type === "ar_model" ? `AR: ${b.title} (${b.modelUrl || "no model url"})` : `${b.type}: ${b.text}`}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}

        {tab === "Publish" && (
          <section className="section card solid">
            <h3>Publish</h3>
            <p>Publishing writes a real JSON file to backend storage and updates lesson index for Student App delivery.</p>
            <div className="pill-row">
              <button onClick={() => void publishLesson()} disabled={loading}>Publish to Student App</button>
              <button onClick={() => setShowJson((v) => !v)}>{showJson ? "Hide" : "Open"} Advanced JSON Preview</button>
            </div>
            <p className="footer-note">{publishMessage}</p>
            {showJson ? <textarea readOnly rows={20} value={JSON.stringify(structuredLesson, null, 2)} /> : null}
          </section>
        )}
      </main>
    </div>
  );
}

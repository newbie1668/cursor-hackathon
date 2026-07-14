import { useEffect, useMemo, useState } from "react";
import { AppShell } from "./components/AppShell";
import { CaptureInbox } from "./components/CaptureInbox";
import { ChatPanel } from "./components/ChatPanel";
import {
  CreateTaskSheet,
  type NewTaskInput,
} from "./components/CreateTaskSheet";
import { DetailSheet } from "./components/DetailSheet";
import { TodoList } from "./components/TodoList";
import {
  analyzeScreenshot,
} from "./lib/analyzeScreenshot";
import { assistantWelcome, categorizeFromTalk } from "./lib/categorize";
import { uid } from "./lib/id";
import { detectSourceFromFilename } from "./lib/source";
import { defaultState, loadState, saveState } from "./lib/storage";
import type { Capture, ChatMessage, TabId, Task } from "./types";

type DetailState =
  | { kind: "task"; id: string }
  | { kind: "capture"; id: string }
  | null;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () =>
      reject(reader.error ?? new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

function noteFromFilename(name: string): string {
  const base = name.replace(/\.[^.]+$/, "").trim();
  if (!base || /^(img_\d+|image|photo|screenshot)$/i.test(base)) {
    return "Screenshot from Photos";
  }
  if (/^screenshot /i.test(base)) return base;
  return base;
}

function normalizeCapture(raw: Capture): Capture {
  return {
    ...raw,
    labels: raw.labels ?? [],
    analyzeStatus: raw.analyzeStatus ?? "ready",
  };
}

function normalizeTask(raw: Task): Task {
  return {
    ...raw,
    labels: raw.labels ?? [],
  };
}

export default function App() {
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [tab, setTab] = useState<TabId>("captures");
  const [detail, setDetail] = useState<DetailState>(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    const state = loadState();
    setCaptures(state.captures.map(normalizeCapture));
    setTasks(state.tasks.map(normalizeTask));
    setMessages(state.messages.length ? state.messages : [assistantWelcome()]);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveState({ captures, tasks, messages });
  }, [captures, tasks, messages, hydrated]);

  const openCaptures = useMemo(
    () => captures.filter((c) => !c.categorized).length,
    [captures],
  );
  const openTasks = useMemo(() => tasks.filter((t) => !t.done).length, [tasks]);

  const detailTask =
    detail?.kind === "task"
      ? (tasks.find((t) => t.id === detail.id) ?? null)
      : null;
  const detailCapture = (() => {
    if (detail?.kind === "capture") {
      return captures.find((c) => c.id === detail.id) ?? null;
    }
    if (detailTask?.captureId) {
      return captures.find((c) => c.id === detailTask.captureId) ?? null;
    }
    return null;
  })();

  async function analyzeCapture(capture: Capture) {
    setCaptures((prev) =>
      prev.map((c) =>
        c.id === capture.id ? { ...c, analyzeStatus: "reading" } : c,
      ),
    );

    const analysis = await analyzeScreenshot(
      capture.imageDataUrl,
      capture.note ?? "Screenshot",
    );

    setCaptures((prev) =>
      prev.map((c) =>
        c.id === capture.id
          ? {
              ...c,
              sourceKind:
                c.sourceKind === "other" ? analysis.sourceKind : c.sourceKind,
              note: analysis.title,
              suggestedTitle: analysis.title,
              suggestedCategory: analysis.category,
              labels: analysis.labels,
              ocrText: analysis.ocrText,
              analyzeStatus: "ready",
            }
          : c,
      ),
    );

    setMessages((prev) => [
      ...prev,
      {
        id: uid("msg"),
        role: "assistant",
        text: `${analysis.summary} Say “file it” to add this to your to-do list, or tell me how to categorize it.`,
        at: Date.now(),
        previewUrl: capture.imageDataUrl,
        labels: analysis.labels,
        captureId: capture.id,
      },
    ]);
  }

  async function handleUpload(files: File[]) {
    const created: Capture[] = [];
    const failures: string[] = [];

    for (const file of files) {
      try {
        const imageDataUrl = await readFileAsDataUrl(file);
        created.push({
          id: uid("cap"),
          imageDataUrl,
          sourceKind: detectSourceFromFilename(file.name),
          createdAt: Date.now(),
          note: noteFromFilename(file.name),
          categorized: false,
          labels: [],
          analyzeStatus: "pending",
        });
      } catch {
        failures.push(file.name || "image");
      }
    }

    if (created.length === 0) {
      setMessages((prev) => [
        ...prev,
        {
          id: uid("msg"),
          role: "assistant",
          text: "Couldn’t read that image. Try a PNG or JPEG screenshot from Photos.",
          at: Date.now(),
        },
      ]);
      setTab("talk");
      return;
    }

    setCaptures((prev) => [...created, ...prev]);
    setMessages((prev) => [
      ...prev,
      {
        id: uid("msg"),
        role: "assistant",
        text:
          (created.length === 1
            ? "Got your screenshot — reading it now…"
            : `Got ${created.length} screenshots — reading them now…`) +
          (failures.length
            ? ` (Skipped ${failures.length} that couldn’t be opened.)`
            : ""),
        at: Date.now(),
        previewUrl: created[0]?.imageDataUrl,
        captureId: created[0]?.id,
      },
    ]);
    setTab("talk");

    for (const capture of created) {
      await analyzeCapture(capture);
    }
  }

  function handleTalk(text: string) {
    const userMsg: ChatMessage = {
      id: uid("msg"),
      role: "user",
      text,
      at: Date.now(),
    };
    const result = categorizeFromTalk(text, captures, tasks);

    if (result.tasks.length > 0) {
      setTasks((prev) => [...result.tasks, ...prev]);
      setCaptures((prev) =>
        prev.map((c) =>
          result.captureIds.includes(c.id) ? { ...c, categorized: true } : c,
        ),
      );
    }

    const firstTask = result.tasks[0];
    const firstCapture = firstTask?.captureId
      ? captures.find((c) => c.id === firstTask.captureId)
      : undefined;

    const assistantMsg: ChatMessage = {
      id: uid("msg"),
      role: "assistant",
      text: result.reply,
      at: Date.now(),
      taskIds: result.tasks.map((t) => t.id),
      previewUrl: firstCapture?.imageDataUrl,
      labels: firstTask?.labels,
      captureId: firstCapture?.id,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);

    if (result.tasks.length > 0) {
      window.setTimeout(() => setTab("tasks"), 450);
    }
  }

  function handleCreateTask(input: NewTaskInput) {
    const task: Task = {
      id: uid("task"),
      title: input.title,
      intro: input.intro,
      category: input.category,
      sourceKind: input.sourceKind,
      labels: input.labels,
      createdAt: Date.now(),
      done: false,
    };
    setTasks((prev) => [task, ...prev]);
    setCreateOpen(false);
  }

  function toggleDone(id: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  }

  function resetDemo() {
    const state = defaultState();
    setCaptures(state.captures);
    setTasks(state.tasks);
    setMessages(state.messages);
    setDetail(null);
    setCreateOpen(false);
    setTab("captures");
  }

  if (!hydrated) {
    return <div className="boot" />;
  }

  return (
    <AppShell
      tab={tab}
      onTabChange={setTab}
      openCount={openCaptures}
      taskCount={openTasks}
      overlays={
        <>
          <DetailSheet
            open={detail != null}
            task={detailTask}
            capture={detailCapture}
            onClose={() => setDetail(null)}
            onToggleDone={
              detailTask
                ? (id) => {
                    toggleDone(id);
                  }
                : undefined
            }
          />
          <CreateTaskSheet
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            onCreate={handleCreateTask}
          />
        </>
      }
    >
      {tab === "captures" && (
        <>
          <CaptureInbox
            captures={captures}
            onUpload={handleUpload}
            onOpenCapture={(id) => setDetail({ kind: "capture", id })}
            onPickSource={(id, kind) =>
              setCaptures((prev) =>
                prev.map((c) =>
                  c.id === id ? { ...c, sourceKind: kind } : c,
                ),
              )
            }
          />
          <button type="button" className="reset-demo" onClick={resetDemo}>
            Reset demo data
          </button>
        </>
      )}

      {tab === "talk" && (
        <ChatPanel
          messages={messages}
          openCaptures={openCaptures}
          onSend={handleTalk}
          onOpenCapture={(id) => setDetail({ kind: "capture", id })}
        />
      )}

      {tab === "tasks" && (
        <TodoList
          tasks={tasks}
          captures={captures}
          onOpen={(id) => setDetail({ kind: "task", id })}
          onToggleDone={toggleDone}
          onCreate={() => setCreateOpen(true)}
        />
      )}
    </AppShell>
  );
}

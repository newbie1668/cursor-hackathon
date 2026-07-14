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
    reader.onerror = () => reject(reader.error ?? new Error("Could not read file"));
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
    setCaptures(state.captures);
    setTasks(state.tasks);
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
    const n = created.length;
    setMessages((prev) => [
      ...prev,
      {
        id: uid("msg"),
        role: "assistant",
        text:
          (n === 1
            ? "Got your screenshot from Photos."
            : `Got ${n} screenshots from Photos.`) +
          " Tell me how to file " +
          (n === 1 ? "it" : "them") +
          " — watch, follow up, read, research, or save." +
          (failures.length
            ? ` (Skipped ${failures.length} that couldn’t be read.)`
            : ""),
        at: Date.now(),
      },
    ]);
    setTab("talk");
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

    const assistantMsg: ChatMessage = {
      id: uid("msg"),
      role: "assistant",
      text: result.reply,
      at: Date.now(),
      taskIds: result.tasks.map((t) => t.id),
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
        />
      )}

      {tab === "tasks" && (
        <TodoList
          tasks={tasks}
          onOpen={(id) => setDetail({ kind: "task", id })}
          onToggleDone={toggleDone}
          onCreate={() => setCreateOpen(true)}
        />
      )}
    </AppShell>
  );
}

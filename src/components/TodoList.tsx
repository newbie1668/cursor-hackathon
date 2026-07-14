import { useMemo, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Capture, Task, TaskCategory } from "../types";
import { formatDate } from "../lib/format";
import { CATEGORY_ORDER, SOURCE_LABEL } from "../lib/source";
import "./TodoList.css";

type ViewMode = "bubbles" | "list";
type FocusKey = TaskCategory | "Done";

interface TodoListProps {
  tasks: Task[];
  captures: Capture[];
  onOpen: (id: string) => void;
  onToggleDone: (id: string) => void;
  onCreate: () => void;
}

interface BubbleDatum {
  key: FocusKey;
  count: number;
  color: string;
}

const BUBBLE_COLORS: Record<TaskCategory, string> = {
  Watch: "#e85d4c",
  "Follow up": "#0a66c2",
  Read: "#1f8a7a",
  Research: "#c9852d",
  Save: "#5b6c8f",
  Do: "#16324f",
};

function bubbleSize(count: number, max: number): number {
  const min = 92;
  const top = 168;
  if (max <= 1) return 128;
  const t = Math.sqrt(count / max);
  return Math.round(min + (top - min) * t);
}

export function TodoList({
  tasks,
  captures,
  onOpen,
  onToggleDone,
  onCreate,
}: TodoListProps) {
  const [view, setView] = useState<ViewMode>("bubbles");
  const [focus, setFocus] = useState<FocusKey | null>(null);

  const open = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);
  const byId = new Map(captures.map((c) => [c.id, c]));

  const bubbles = useMemo(() => {
    const groups: BubbleDatum[] = CATEGORY_ORDER.map((category) => ({
      key: category,
      count: open.filter((t) => t.category === category).length,
      color: BUBBLE_COLORS[category],
    })).filter((g) => g.count > 0);

    if (done.length > 0) {
      groups.push({ key: "Done", count: done.length, color: "#6b8094" });
    }
    return groups;
  }, [open, done.length]);

  const maxCount = Math.max(1, ...bubbles.map((b) => b.count));

  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    items: open
      .filter((t) => t.category === category)
      .sort((a, b) => b.createdAt - a.createdAt),
  })).filter((g) => g.items.length > 0);

  const focusedItems =
    focus === "Done"
      ? [...done].sort((a, b) => b.createdAt - a.createdAt)
      : focus
        ? open
            .filter((t) => t.category === focus)
            .sort((a, b) => b.createdAt - a.createdAt)
        : [];

  function renderTaskCard(task: Task, opts?: { done?: boolean }) {
    const shot = task.captureId ? byId.get(task.captureId) : undefined;
    return (
      <article className={`todo-item${opts?.done ? " done" : ""}`}>
        <button
          type="button"
          className={`todo-check${opts?.done ? " checked" : ""}`}
          aria-label={opts?.done ? "Mark not done" : "Mark done"}
          onClick={() => onToggleDone(task.id)}
        />
        <button
          type="button"
          className="todo-body"
          onClick={() => onOpen(task.id)}
        >
          {shot && !opts?.done && (
            <div className="todo-preview">
              <img src={shot.imageDataUrl} alt="" />
            </div>
          )}
          <div className="todo-top">
            <span className="todo-title">{task.title}</span>
            <time dateTime={new Date(task.createdAt).toISOString()}>
              {formatDate(task.createdAt)}
            </time>
          </div>
          <p className="todo-intro">{task.intro}</p>
          {(task.labels?.length ?? 0) > 0 && !opts?.done && (
            <div className="todo-labels">
              {task.labels.slice(0, 5).map((label) => (
                <span key={label} className="label-chip">
                  {label}
                </span>
              ))}
            </div>
          )}
          {!opts?.done && (
            <span className="todo-source">
              {SOURCE_LABEL[task.sourceKind]}
              {task.captureId ? " · Revisit shot" : ""}
            </span>
          )}
        </button>
      </article>
    );
  }

  return (
    <div className="todos">
      <div className="todos-head">
        <div>
          <h1>To-do</h1>
          <p>
            {view === "bubbles"
              ? "Bubbles show how many tasks in each group."
              : "Labeled from your shots — tap to preview."}
          </p>
        </div>
        <button type="button" className="create-btn" onClick={onCreate}>
          New task
        </button>
      </div>

      <div className="view-toggle" role="tablist" aria-label="Task view">
        <button
          type="button"
          role="tab"
          aria-selected={view === "bubbles"}
          className={view === "bubbles" ? "active" : ""}
          onClick={() => {
            setView("bubbles");
            setFocus(null);
          }}
        >
          Bubbles
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "list"}
          className={view === "list" ? "active" : ""}
          onClick={() => {
            setView("list");
            setFocus(null);
          }}
        >
          List
        </button>
      </div>

      {open.length === 0 && done.length === 0 && (
        <div className="todos-empty">
          <h2>Nothing queued</h2>
          <p>Upload a screenshot — I’ll read and label it for you.</p>
        </div>
      )}

      {view === "bubbles" && (open.length > 0 || done.length > 0) && (
        <div className="bubble-board">
          <div className="bubble-field" aria-label="Task bubbles">
            {bubbles.map((bubble, i) => {
              const size = bubbleSize(bubble.count, maxCount);
              const selected = focus === bubble.key;
              const style = {
                "--bubble-size": `${size}px`,
                "--bubble-color": bubble.color,
                "--float-delay": `${i * 0.35}s`,
              } as CSSProperties;

              return (
                <motion.button
                  key={bubble.key}
                  type="button"
                  className={`task-bubble${selected ? " selected" : ""}${bubble.key === "Done" ? " done-bubble" : ""}`}
                  style={style}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 320,
                    damping: 18,
                    delay: i * 0.05,
                  }}
                  onClick={() =>
                    setFocus((prev) =>
                      prev === bubble.key ? null : bubble.key,
                    )
                  }
                  aria-pressed={selected}
                >
                  <span className="bubble-count">{bubble.count}</span>
                  <span className="bubble-name">{bubble.key}</span>
                  <span className="bubble-sub">
                    {bubble.count === 1 ? "task" : "tasks"}
                  </span>
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {focus && (
              <motion.section
                key={focus}
                className="bubble-drill"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
              >
                <div className="bubble-drill-head">
                  <h2>{focus}</h2>
                  <button type="button" onClick={() => setFocus(null)}>
                    Clear
                  </button>
                </div>
                <ul>
                  {focusedItems.map((task) => (
                    <li key={task.id}>
                      {renderTaskCard(task, { done: focus === "Done" })}
                    </li>
                  ))}
                </ul>
              </motion.section>
            )}
          </AnimatePresence>

          {!focus && (
            <p className="bubble-hint">Tap a bubble to see its tasks</p>
          )}
        </div>
      )}

      {view === "list" && (
        <>
          {grouped.map((group) => (
            <section key={group.category} className="todo-group">
              <h2>
                {group.category}
                <span className="group-count">{group.items.length}</span>
              </h2>
              <ul>
                {group.items.map((task, i) => (
                  <motion.li
                    key={task.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.2) }}
                  >
                    {renderTaskCard(task)}
                  </motion.li>
                ))}
              </ul>
            </section>
          ))}

          {done.length > 0 && (
            <section className="todo-group done-group">
              <h2>
                Done
                <span className="group-count">{done.length}</span>
              </h2>
              <ul>
                {done
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .map((task) => (
                    <li key={task.id}>
                      {renderTaskCard(task, { done: true })}
                    </li>
                  ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}

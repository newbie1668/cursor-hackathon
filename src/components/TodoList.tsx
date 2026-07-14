import { motion } from "framer-motion";
import type { Capture, Task } from "../types";
import { formatDate } from "../lib/format";
import { CATEGORY_ORDER, SOURCE_LABEL } from "../lib/source";
import "./TodoList.css";

interface TodoListProps {
  tasks: Task[];
  captures: Capture[];
  onOpen: (id: string) => void;
  onToggleDone: (id: string) => void;
  onCreate: () => void;
}

export function TodoList({
  tasks,
  captures,
  onOpen,
  onToggleDone,
  onCreate,
}: TodoListProps) {
  const open = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);
  const byId = new Map(captures.map((c) => [c.id, c]));

  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    items: open
      .filter((t) => t.category === category)
      .sort((a, b) => b.createdAt - a.createdAt),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="todos">
      <div className="todos-head">
        <div>
          <h1>To-do</h1>
          <p>Labeled from your shots — tap to preview.</p>
        </div>
        <button type="button" className="create-btn" onClick={onCreate}>
          New task
        </button>
      </div>

      {open.length === 0 && (
        <div className="todos-empty">
          <h2>Nothing queued</h2>
          <p>Upload a screenshot — I’ll read and label it for you.</p>
        </div>
      )}

      {grouped.map((group) => (
        <section key={group.category} className="todo-group">
          <h2>{group.category}</h2>
          <ul>
            {group.items.map((task, i) => {
              const shot = task.captureId
                ? byId.get(task.captureId)
                : undefined;
              return (
                <motion.li
                  key={task.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.2) }}
                >
                  <article className="todo-item">
                    <button
                      type="button"
                      className="todo-check"
                      aria-label="Mark done"
                      onClick={() => onToggleDone(task.id)}
                    />
                    <button
                      type="button"
                      className="todo-body"
                      onClick={() => onOpen(task.id)}
                    >
                      {shot && (
                        <div className="todo-preview">
                          <img src={shot.imageDataUrl} alt="" />
                        </div>
                      )}
                      <div className="todo-top">
                        <span className="todo-title">{task.title}</span>
                        <time
                          dateTime={new Date(task.createdAt).toISOString()}
                        >
                          {formatDate(task.createdAt)}
                        </time>
                      </div>
                      <p className="todo-intro">{task.intro}</p>
                      {(task.labels?.length ?? 0) > 0 && (
                        <div className="todo-labels">
                          {task.labels.slice(0, 5).map((label) => (
                            <span key={label} className="label-chip">
                              {label}
                            </span>
                          ))}
                        </div>
                      )}
                      <span className="todo-source">
                        {SOURCE_LABEL[task.sourceKind]}
                        {task.captureId ? " · Revisit shot" : ""}
                      </span>
                    </button>
                  </article>
                </motion.li>
              );
            })}
          </ul>
        </section>
      ))}

      {done.length > 0 && (
        <section className="todo-group done-group">
          <h2>Done</h2>
          <ul>
            {done
              .sort((a, b) => b.createdAt - a.createdAt)
              .map((task) => (
                <li key={task.id}>
                  <article className="todo-item done">
                    <button
                      type="button"
                      className="todo-check checked"
                      aria-label="Mark not done"
                      onClick={() => onToggleDone(task.id)}
                    />
                    <button
                      type="button"
                      className="todo-body"
                      onClick={() => onOpen(task.id)}
                    >
                      <div className="todo-top">
                        <span className="todo-title">{task.title}</span>
                        <time
                          dateTime={new Date(task.createdAt).toISOString()}
                        >
                          {formatDate(task.createdAt)}
                        </time>
                      </div>
                      <p className="todo-intro">{task.intro}</p>
                    </button>
                  </article>
                </li>
              ))}
          </ul>
        </section>
      )}
    </div>
  );
}

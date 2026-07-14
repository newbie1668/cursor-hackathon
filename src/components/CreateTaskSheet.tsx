import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { SourceKind, TaskCategory } from "../types";
import { CATEGORY_ORDER, SOURCE_LABEL } from "../lib/source";
import "./CreateTaskSheet.css";

export interface NewTaskInput {
  title: string;
  intro: string;
  category: TaskCategory;
  sourceKind: SourceKind;
}

interface CreateTaskSheetProps {
  open: boolean;
  onClose: () => void;
  onCreate: (input: NewTaskInput) => void;
}

export function CreateTaskSheet({
  open,
  onClose,
  onCreate,
}: CreateTaskSheetProps) {
  const [title, setTitle] = useState("");
  const [intro, setIntro] = useState("");
  const [category, setCategory] = useState<TaskCategory>("Do");
  const [sourceKind, setSourceKind] = useState<SourceKind>("other");

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setIntro("");
    setCategory("Do");
    setSourceKind("other");
  }, [open]);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate({
      title: title.trim(),
      intro:
        intro.trim() ||
        `Manual task · ${SOURCE_LABEL[sourceKind]} · filed from ShotList.`,
      category,
      sourceKind,
    });
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="create-root"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="create-backdrop"
            aria-label="Close"
            onClick={onClose}
          />
          <motion.form
            className="create-panel"
            onSubmit={submit}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
          >
            <div className="sheet-handle" aria-hidden />
            <div className="create-head">
              <h2>New task</h2>
              <button type="button" onClick={onClose}>
                Cancel
              </button>
            </div>

            <label className="field">
              <span>Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs doing?"
                autoFocus
              />
            </label>

            <label className="field">
              <span>Brief intro</span>
              <textarea
                value={intro}
                onChange={(e) => setIntro(e.target.value)}
                placeholder="One short line of context"
                rows={3}
              />
            </label>

            <label className="field">
              <span>Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
              >
                {CATEGORY_ORDER.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Source</span>
              <select
                value={sourceKind}
                onChange={(e) => setSourceKind(e.target.value as SourceKind)}
              >
                {(
                  ["youtube", "linkedin", "website", "other"] as SourceKind[]
                ).map((s) => (
                  <option key={s} value={s}>
                    {SOURCE_LABEL[s]}
                  </option>
                ))}
              </select>
            </label>

            <button type="submit" className="create-submit" disabled={!title.trim()}>
              Add to list
            </button>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

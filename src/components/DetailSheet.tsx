import { AnimatePresence, motion } from "framer-motion";
import type { Capture, Task } from "../types";
import { formatDateTime } from "../lib/format";
import { SOURCE_LABEL } from "../lib/source";
import "./DetailSheet.css";

interface DetailSheetProps {
  open: boolean;
  task?: Task | null;
  capture?: Capture | null;
  onClose: () => void;
  onToggleDone?: (id: string) => void;
}

export function DetailSheet({
  open,
  task,
  capture,
  onClose,
  onToggleDone,
}: DetailSheetProps) {
  const image = capture?.imageDataUrl;
  const title = task?.title ?? capture?.note ?? "Capture";
  const intro =
    task?.intro ??
    (capture
      ? `${SOURCE_LABEL[capture.sourceKind]} screenshot · ready to categorize in Talk.`
      : "");
  const when = task?.createdAt ?? capture?.createdAt;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="sheet-root"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="sheet-backdrop"
            aria-label="Close"
            onClick={onClose}
          />
          <motion.div
            className="sheet-panel"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
          >
            <div className="sheet-handle" aria-hidden />
            <div className="sheet-head">
              <div>
                <p className="sheet-kicker">
                  {task
                    ? `${task.category} · ${SOURCE_LABEL[task.sourceKind]}`
                    : capture
                      ? SOURCE_LABEL[capture.sourceKind]
                      : "Detail"}
                </p>
                <h2>{title}</h2>
              </div>
              <button type="button" className="sheet-close" onClick={onClose}>
                Close
              </button>
            </div>

            {when != null && (
              <p className="sheet-date">{formatDateTime(when)}</p>
            )}

            {intro && <p className="sheet-intro">{intro}</p>}

            {image ? (
              <div className="sheet-shot">
                <img src={image} alt="Original screenshot" />
              </div>
            ) : (
              <div className="sheet-empty-shot">No screenshot linked</div>
            )}

            {task && onToggleDone && (
              <button
                type="button"
                className="sheet-action"
                onClick={() => onToggleDone(task.id)}
              >
                {task.done ? "Mark not done" : "Mark done"}
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

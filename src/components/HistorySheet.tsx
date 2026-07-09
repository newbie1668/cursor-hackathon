import { AnimatePresence, motion } from "framer-motion";
import type { ReviewCard } from "../data/reviews";
import { formatRisk, riskClass } from "../lib/labels";
import "./HistorySheet.css";

export type HistoryAction = "merge" | "reject" | "keep";

export interface HistoryEntry {
  id: string;
  card: ReviewCard;
  action: HistoryAction;
  at: number;
  followUp?: string;
}

interface HistorySheetProps {
  open: boolean;
  entries: HistoryEntry[];
  onClose: () => void;
  onRestore: (entry: HistoryEntry) => void;
}

const ACTION_META: Record<
  HistoryAction,
  { label: string; className: string }
> = {
  merge: { label: "Merged", className: "action-merge" },
  reject: { label: "Rejected", className: "action-reject" },
  keep: { label: "Keep going", className: "action-keep" },
};

function formatTime(at: number) {
  return new Date(at).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function HistorySheet({
  open,
  entries,
  onClose,
  onRestore,
}: HistorySheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className="sheet-backdrop"
            aria-label="Close history"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="history-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-title"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
          >
            <div className="sheet-handle" aria-hidden />
            <div className="history-header">
              <h3 id="history-title">Swipe history</h3>
              <button
                type="button"
                className="history-close"
                onClick={onClose}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <p className="history-sub">
              See where each review ended up. Restore any card to the stack.
            </p>

            {entries.length === 0 ? (
              <div className="history-empty">
                <p>No swipes yet</p>
                <span>Merge, reject, or keep going — they show up here.</span>
              </div>
            ) : (
              <ul className="history-list">
                {entries.map((entry) => {
                  const meta = ACTION_META[entry.action];
                  return (
                    <li key={entry.id} className="history-item">
                      <div className="history-item-main">
                        <div className="history-item-top">
                          <span className={`history-action ${meta.className}`}>
                            {meta.label}
                          </span>
                          <time
                            className="history-time"
                            dateTime={new Date(entry.at).toISOString()}
                          >
                            {formatTime(entry.at)}
                          </time>
                        </div>
                        <p className="history-title-text">{entry.card.title}</p>
                        <p className="history-meta mono">
                          {entry.card.repo}
                          <span className="repo-sep">·</span>
                          <span className={riskClass(entry.card.risk)}>
                            {formatRisk(entry.card.risk)}
                          </span>
                        </p>
                        {entry.followUp && (
                          <p className="history-follow-up">
                            “{entry.followUp}”
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        className="history-restore"
                        onClick={() => onRestore(entry)}
                      >
                        Restore
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

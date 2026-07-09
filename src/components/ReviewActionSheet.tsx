import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CommentField } from "./CommentField";
import "./KeepGoingSheet.css";

const MERGE_CHIPS = ["LGTM", "Ship it", "Looks good, minor nits"];
const REJECT_CHIPS = ["Needs tests", "Too risky", "Wrong approach"];

export type ReviewAction = "merge" | "reject";

interface ReviewActionSheetProps {
  open: boolean;
  action: ReviewAction;
  title: string;
  onClose: () => void;
  onConfirm: (comment?: string) => void;
}

const ACTION_COPY: Record<
  ReviewAction,
  { heading: string; sub: string; confirm: string; placeholder: string }
> = {
  merge: {
    heading: "Merge",
    sub: "Approve and merge",
    confirm: "Merge",
    placeholder: "e.g. LGTM — nice cleanup on the auth middleware",
  },
  reject: {
    heading: "Reject",
    sub: "Send back without merging",
    confirm: "Reject",
    placeholder: "e.g. Needs integration tests before we ship this",
  },
};

export function ReviewActionSheet({
  open,
  action,
  title,
  onClose,
  onConfirm,
}: ReviewActionSheetProps) {
  const [text, setText] = useState("");
  const copy = ACTION_COPY[action];
  const chips = action === "merge" ? MERGE_CHIPS : REJECT_CHIPS;

  useEffect(() => {
    if (open) setText("");
  }, [open, action]);

  function confirm(comment?: string) {
    const trimmed = comment?.trim();
    onConfirm(trimmed || undefined);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className="sheet-backdrop"
            aria-label={`Close ${action} sheet`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="keep-going-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${action}-sheet-title`}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
          >
            <div className="sheet-handle" aria-hidden />
            <h3 id={`${action}-sheet-title`}>{copy.heading}</h3>
            <p className="sheet-sub">
              {copy.sub} for{" "}
              <span className="sheet-card-title">{title}</span>
              . Add an optional comment for the agent.
            </p>
            <div className="chip-row">
              {chips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  className="follow-chip"
                  onClick={() => confirm(chip)}
                >
                  {chip}
                </button>
              ))}
            </div>
            <CommentField
              id={`${action}-comment-input`}
              label="Comment"
              placeholder={copy.placeholder}
              value={text}
              onChange={setText}
            />
            <div className="sheet-actions">
              <button type="button" className="btn ghost" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className={`btn ${action}`}
                onClick={() => confirm(text)}
              >
                {text.trim() ? `${copy.confirm} with comment` : copy.confirm}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

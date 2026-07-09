import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./KeepGoingSheet.css";

const CHIPS = [
  "Add tests",
  "Fix types",
  "Smaller diff",
  "Explain riskier files",
];

interface KeepGoingSheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSend: (message: string) => void;
}

export function KeepGoingSheet({
  open,
  title,
  onClose,
  onSend,
}: KeepGoingSheetProps) {
  const [text, setText] = useState("");

  useEffect(() => {
    if (open) setText("");
  }, [open]);

  function submit(message: string) {
    const trimmed = message.trim();
    if (!trimmed) return;
    onSend(trimmed);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className="sheet-backdrop"
            aria-label="Close keep going sheet"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="keep-going-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="keep-going-title"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
          >
            <div className="sheet-handle" aria-hidden />
            <h3 id="keep-going-title">Keep going</h3>
            <p className="sheet-sub">
              Send a follow-up to the agent working on{" "}
              <span className="sheet-card-title">{title}</span>
            </p>
            <div className="chip-row">
              {CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  className="follow-chip"
                  onClick={() => submit(chip)}
                >
                  {chip}
                </button>
              ))}
            </div>
            <label className="sheet-label" htmlFor="follow-up-input">
              Custom follow-up
            </label>
            <textarea
              id="follow-up-input"
              className="follow-input"
              rows={3}
              placeholder="e.g. Add a test for the empty-cart case"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="sheet-actions">
              <button type="button" className="btn ghost" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="btn keep"
                disabled={!text.trim()}
                onClick={() => submit(text)}
              >
                Send
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

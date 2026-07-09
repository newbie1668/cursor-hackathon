import { AnimatePresence, motion } from "framer-motion";
import { COACH_STEPS, type CoachStep } from "../lib/swipeCoach";
import "./SwipeCoach.css";

const COPY: Record<
  CoachStep,
  { title: string; detail: string; stamp: string; className: string }
> = {
  merge: {
    title: "Swipe right to merge",
    detail: "Or tap the merge button below",
    stamp: "MERGE",
    className: "coach-merge",
  },
  reject: {
    title: "Swipe left to reject",
    detail: "Or tap the reject button below",
    stamp: "REJECT",
    className: "coach-reject",
  },
  keep: {
    title: "Swipe up to keep going",
    detail: "Send a follow-up · or tap Keep",
    stamp: "KEEP",
    className: "coach-keep",
  },
};

interface SwipeCoachProps {
  step: CoachStep | null;
  onSkip: () => void;
}

export function SwipeCoach({ step, onSkip }: SwipeCoachProps) {
  if (!step) return null;
  const copy = COPY[step];
  const index = COACH_STEPS.indexOf(step);

  return (
    <AnimatePresence>
      <motion.div
        className={`swipe-coach-overlay ${copy.className}`}
        key={step}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.22 }}
        role="status"
        aria-live="polite"
      >
        <div className="coach-stamp" aria-hidden>
          {copy.stamp}
        </div>
        <p className="coach-title">{copy.title}</p>
        <p className="coach-detail">{copy.detail}</p>
        <div className="coach-progress" aria-hidden>
          {COACH_STEPS.map((s, i) => (
            <span
              key={s}
              className={`coach-dot ${i === index ? "active" : ""} ${i < index ? "done" : ""}`}
            />
          ))}
        </div>
        <button type="button" className="coach-skip" onClick={onSkip}>
          Skip tutorial
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

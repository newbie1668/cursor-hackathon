import { AnimatePresence, motion } from "framer-motion";
import { COACH_STEPS, type CoachStep } from "../lib/swipeCoach";
import "./SwipeCoach.css";

const COPY: Record<
  CoachStep,
  { title: string; detail: string; stamp: string; className: string; cta: string }
> = {
  merge: {
    title: "Swipe right to merge",
    detail: "Drag the card right, or tap Merge below",
    stamp: "MERGE →",
    className: "coach-merge",
    cta: "Try Merge",
  },
  reject: {
    title: "Swipe left to reject",
    detail: "Drag the card left, or tap Reject below",
    stamp: "← REJECT",
    className: "coach-reject",
    cta: "Try Reject",
  },
  keep: {
    title: "Swipe up to keep going",
    detail: "Drag the card up, or tap Keep below",
    stamp: "↑ KEEP",
    className: "coach-keep",
    cta: "Try Keep",
  },
};

interface SwipeCoachProps {
  step: CoachStep | null;
  onSkip: () => void;
  onTry: () => void;
}

export function SwipeCoach({ step, onSkip, onTry }: SwipeCoachProps) {
  if (!step) return null;
  const copy = COPY[step];
  const index = COACH_STEPS.indexOf(step);
  const stepNum = index + 1;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className={`swipe-coach-overlay ${copy.className}`}
        key={step}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        role="dialog"
        aria-modal="false"
        aria-labelledby="coach-title"
      >
        <div className="coach-top">
          <span className="coach-step-label">
            Step {stepNum} of {COACH_STEPS.length}
          </span>
          <button
            type="button"
            className="coach-close"
            onClick={onSkip}
            aria-label="Dismiss tutorial"
          >
            ✕
          </button>
        </div>

        <div className="coach-stamp" aria-hidden>
          {copy.stamp}
        </div>
        <p id="coach-title" className="coach-title">
          {copy.title}
        </p>
        <p className="coach-detail">{copy.detail}</p>

        <div className="coach-progress" aria-hidden>
          {COACH_STEPS.map((s, i) => (
            <span
              key={s}
              className={`coach-dot ${i === index ? "active" : ""} ${i < index ? "done" : ""}`}
            />
          ))}
        </div>

        <div className="coach-actions">
          <button type="button" className="coach-try" onClick={onTry}>
            {copy.cta}
          </button>
          <button type="button" className="coach-skip" onClick={onSkip}>
            Skip tutorial
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

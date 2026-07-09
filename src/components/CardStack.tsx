import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import type { ReviewCard } from "../data/reviews";
import type { SwipeAction } from "../lib/swipeActions";
import type { CoachStep } from "../lib/swipeCoach";
import { ReviewCardView } from "./ReviewCard";
import "./CardStack.css";

const MERGE_X = 120;
const REJECT_X = -120;
const KEEP_Y = -110;

export type { SwipeAction };

interface CardStackProps {
  cards: ReviewCard[];
  onSwipe: (action: SwipeAction, card: ReviewCard) => void;
  locked?: boolean;
  /** When set, successful swipes are practice-only (card springs back). */
  coachStep?: CoachStep | null;
  onPracticeSwipe?: (action: SwipeAction) => void;
  /** Play a one-shot demo nudge on the top card. */
  demoNudge?: boolean;
  onDemoNudgeDone?: () => void;
}

export function CardStack({
  cards,
  onSwipe,
  locked,
  coachStep = null,
  onPracticeSwipe,
  demoNudge = false,
  onDemoNudgeDone,
}: CardStackProps) {
  const top = cards[0];
  const next = cards[1];
  const third = cards[2];

  if (!top) return null;

  return (
    <div className="card-stack" aria-live="polite">
      {third && (
        <div className="stack-layer layer-2" aria-hidden>
          <ReviewCardView card={third} interactive={false} />
        </div>
      )}
      {next && (
        <div className="stack-layer layer-1" aria-hidden>
          <ReviewCardView card={next} interactive={false} />
        </div>
      )}
      <SwipeableCard
        key={top.id}
        card={top}
        locked={locked}
        onSwipe={onSwipe}
        coachStep={coachStep}
        onPracticeSwipe={onPracticeSwipe}
        demoNudge={demoNudge}
        onDemoNudgeDone={onDemoNudgeDone}
      />
    </div>
  );
}

type Pose = {
  x: number;
  y: number;
  rotate: number;
  hint: { merge: number; reject: number; keep: number };
};

function SwipeableCard({
  card,
  locked,
  onSwipe,
  coachStep,
  onPracticeSwipe,
  demoNudge,
  onDemoNudgeDone,
}: {
  card: ReviewCard;
  locked?: boolean;
  onSwipe: (action: SwipeAction, card: ReviewCard) => void;
  coachStep: CoachStep | null;
  onPracticeSwipe?: (action: SwipeAction) => void;
  demoNudge: boolean;
  onDemoNudgeDone?: () => void;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const [exiting, setExiting] = useState<"merge" | "reject" | null>(null);
  const [hint, setHint] = useState({ merge: 0, reject: 0, keep: 0 });
  const [nudgePose, setNudgePose] = useState<Pose | null>(null);
  const nudging = nudgePose != null;

  useEffect(() => {
    if (!demoNudge || locked || exiting || coachStep) return;

    let cancelled = false;
    const poses: Pose[] = [
      { x: 78, y: 0, rotate: 7, hint: { merge: 0.9, reject: 0, keep: 0 } },
      { x: -78, y: 0, rotate: -7, hint: { merge: 0, reject: 0.9, keep: 0 } },
      { x: 0, y: -70, rotate: 0, hint: { merge: 0, reject: 0, keep: 0.95 } },
    ];

    async function run() {
      for (const pose of poses) {
        if (cancelled) return;
        setNudgePose(pose);
        setHint(pose.hint);
        await sleep(520);
      }
      if (cancelled) return;
      setNudgePose({ x: 0, y: 0, rotate: 0, hint: { merge: 0, reject: 0, keep: 0 } });
      setHint({ merge: 0, reject: 0, keep: 0 });
      await sleep(280);
      if (cancelled) return;
      setNudgePose(null);
      onDemoNudgeDone?.();
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [demoNudge, locked, exiting, coachStep, onDemoNudgeDone]);

  function practiceOrCommit(action: SwipeAction) {
    if (coachStep) {
      setHint({
        merge: action === "merge" ? 1 : 0,
        reject: action === "reject" ? 1 : 0,
        keep: action === "keep" ? 1 : 0,
      });
      x.set(0);
      y.set(0);
      onPracticeSwipe?.(action);
      window.setTimeout(() => setHint({ merge: 0, reject: 0, keep: 0 }), 280);
      return;
    }

    if (action === "keep") {
      setHint({ merge: 0, reject: 0, keep: 1 });
      x.set(0);
      y.set(0);
      onSwipe("keep", card);
      window.setTimeout(() => setHint({ merge: 0, reject: 0, keep: 0 }), 200);
      return;
    }

    setExiting(action);
    window.setTimeout(() => onSwipe(action, card), 260);
  }

  function commitMergeOrReject(action: "merge" | "reject") {
    if (exiting || locked || nudging) return;
    practiceOrCommit(action);
  }

  function commitKeep() {
    if (exiting || locked || nudging) return;
    practiceOrCommit("keep");
  }

  function onDrag(_: unknown, info: PanInfo) {
    if (nudging) return;
    const mx = Math.max(0, Math.min(1, (info.offset.x - 40) / (MERGE_X - 40)));
    const rx = Math.max(0, Math.min(1, (-info.offset.x - 40) / (MERGE_X - 40)));
    const ky = Math.max(
      0,
      Math.min(1, (-info.offset.y - 40) / (Math.abs(KEEP_Y) - 40)),
    );

    if (info.offset.y < -60 && Math.abs(info.offset.y) > Math.abs(info.offset.x)) {
      setHint({ merge: 0, reject: 0, keep: ky });
    } else {
      setHint({ merge: mx, reject: rx, keep: 0 });
    }
  }

  function onDragEnd(_: unknown, info: PanInfo) {
    if (nudging) return;
    const { offset, velocity } = info;
    const goKeep = offset.y < KEEP_Y || (offset.y < -70 && velocity.y < -600);
    const goMerge = offset.x > MERGE_X || (offset.x > 70 && velocity.x > 700);
    const goReject = offset.x < REJECT_X || (offset.x < -70 && velocity.x < -700);

    if (goKeep && Math.abs(offset.y) >= Math.abs(offset.x) * 0.85) {
      commitKeep();
      return;
    }
    if (goMerge) {
      commitMergeOrReject("merge");
      return;
    }
    if (goReject) {
      commitMergeOrReject("reject");
      return;
    }
    setHint({ merge: 0, reject: 0, keep: 0 });
  }

  const exitX = exiting === "merge" ? 420 : exiting === "reject" ? -420 : 0;
  const dragEnabled = !locked && !exiting && !nudging;

  const animateTarget = exiting
    ? { x: exitX, y: 0, opacity: 0, rotate: 0, transition: { duration: 0.28 } }
    : nudgePose
      ? {
          x: nudgePose.x,
          y: nudgePose.y,
          rotate: nudgePose.rotate,
          opacity: 1,
          transition: { type: "spring" as const, stiffness: 300, damping: 24 },
        }
      : { x: 0, y: 0, opacity: 1, rotate: 0 };

  return (
    <motion.div
      className="stack-layer top-card"
      style={nudging || exiting ? undefined : { x, y, rotate, zIndex: 3 }}
      drag={dragEnabled}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
      animate={animateTarget}
      initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
    >
      <ReviewCardView
        card={card}
        dragHint={{
          merge: exiting === "merge" ? 1 : hint.merge,
          reject: exiting === "reject" ? 1 : hint.reject,
          keep: hint.keep,
        }}
      />
    </motion.div>
  );
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

import { useState } from "react";
import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import type { ReviewCard } from "../data/reviews";
import { ReviewCardView } from "./ReviewCard";
import "./CardStack.css";

const MERGE_X = 120;
const REJECT_X = -120;
const KEEP_Y = -110;

export type SwipeAction = "merge" | "reject" | "keep";

interface CardStackProps {
  cards: ReviewCard[];
  onSwipe: (action: SwipeAction, card: ReviewCard) => void;
  locked?: boolean;
}

export function CardStack({ cards, onSwipe, locked }: CardStackProps) {
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
      <SwipeableCard key={top.id} card={top} locked={locked} onSwipe={onSwipe} />
    </div>
  );
}

function SwipeableCard({
  card,
  locked,
  onSwipe,
}: {
  card: ReviewCard;
  locked?: boolean;
  onSwipe: (action: SwipeAction, card: ReviewCard) => void;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const [exiting, setExiting] = useState<"merge" | "reject" | null>(null);
  const [hint, setHint] = useState({ merge: 0, reject: 0, keep: 0 });

  function commitMergeOrReject(action: "merge" | "reject") {
    if (exiting || locked) return;
    setExiting(action);
    window.setTimeout(() => onSwipe(action, card), 260);
  }

  function commitKeep() {
    if (exiting || locked) return;
    setHint({ merge: 0, reject: 0, keep: 1 });
    x.set(0);
    y.set(0);
    onSwipe("keep", card);
    window.setTimeout(() => setHint({ merge: 0, reject: 0, keep: 0 }), 200);
  }

  function onDrag(_: unknown, info: PanInfo) {
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

  return (
    <motion.div
      className="stack-layer top-card"
      style={{ x, y, rotate, zIndex: 3 }}
      drag={locked || exiting ? false : true}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
      animate={
        exiting
          ? { x: exitX, y: 0, opacity: 0, transition: { duration: 0.28 } }
          : { x: 0, y: 0, opacity: 1 }
      }
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

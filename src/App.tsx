import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActionHints } from "./components/ActionHints";
import { ApprovalShell } from "./components/ApprovalShell";
import { CardStack, type SwipeAction } from "./components/CardStack";
import { KeepGoingSheet } from "./components/KeepGoingSheet";
import { Toast, type ToastState } from "./components/Toast";
import {
  cloneReviews,
  type ReviewCard,
} from "./data/reviews";

export default function App() {
  const [cards, setCards] = useState<ReviewCard[]>(() => cloneReviews());
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimer = useRef<number | null>(null);
  const toastId = useRef(0);

  const readyCards = useMemo(
    () => cards.filter((c) => c.status === "ready"),
    [cards],
  );
  const waitingCount = useMemo(
    () => cards.filter((c) => c.status === "waiting").length,
    [cards],
  );

  const top = readyCards[0] ?? null;

  const clearToastTimer = useCallback(() => {
    if (toastTimer.current != null) {
      window.clearTimeout(toastTimer.current);
      toastTimer.current = null;
    }
  }, []);

  const showToast = useCallback(
    (message: string, opts?: { actionLabel?: string; onAction?: () => void }) => {
      clearToastTimer();
      toastId.current += 1;
      const id = toastId.current;
      setToast({
        id,
        message,
        actionLabel: opts?.actionLabel,
        onAction: opts?.onAction,
      });
      toastTimer.current = window.setTimeout(() => {
        setToast((t) => (t?.id === id ? null : t));
      }, 5000);
    },
    [clearToastTimer],
  );

  useEffect(() => () => clearToastTimer(), [clearToastTimer]);

  function restoreCard(card: ReviewCard) {
    setCards((prev) => {
      const without = prev.filter((c) => c.id !== card.id);
      return [{ ...card, status: "ready" }, ...without];
    });
  }

  function mergeCard(card: ReviewCard) {
    setCards((prev) =>
      prev.map((c) => (c.id === card.id ? { ...c, status: "merged" } : c)),
    );
    showToast(`Merged · ${card.title}`, {
      actionLabel: "Undo",
      onAction: () => restoreCard(card),
    });
  }

  function rejectCard(card: ReviewCard) {
    setCards((prev) =>
      prev.map((c) => (c.id === card.id ? { ...c, status: "rejected" } : c)),
    );
    showToast(`Rejected · ${card.title}`, {
      actionLabel: "Undo",
      onAction: () => restoreCard(card),
    });
  }

  function markWaiting(card: ReviewCard, followUp: string) {
    setCards((prev) => {
      const updated = prev.map((c) =>
        c.id === card.id ? { ...c, status: "waiting" as const } : c,
      );
      // Move waiting card after remaining ready cards so it leaves the active stack
      const ready = updated.filter((c) => c.status === "ready");
      const waiting = updated.filter((c) => c.status === "waiting");
      const done = updated.filter(
        (c) => c.status === "merged" || c.status === "rejected",
      );
      return [...ready, ...waiting, ...done];
    });
    setSheetOpen(false);
    showToast(`Follow-up sent · “${followUp}” · agent resumed`);
  }

  function handleSwipe(action: SwipeAction, card: ReviewCard) {
    if (action === "merge") mergeCard(card);
    else if (action === "reject") rejectCard(card);
    else {
      setSheetOpen(true);
    }
  }

  function resetDemo() {
    clearToastTimer();
    setToast(null);
    setSheetOpen(false);
    setCards(cloneReviews());
    sessionStorage.removeItem("approval-legend-seen");
  }

  return (
    <ApprovalShell readyCount={readyCards.length} waitingCount={waitingCount}>
      {readyCards.length === 0 ? (
        <div className="empty-state">
          <h2>All caught up</h2>
          <p>No agent diffs waiting</p>
          <button type="button" className="btn reset" onClick={resetDemo}>
            Reset demo
          </button>
        </div>
      ) : (
        <>
          <CardStack
            cards={readyCards}
            onSwipe={handleSwipe}
            locked={sheetOpen}
          />
          <ActionHints
            disabled={!top || sheetOpen}
            onMerge={() => top && mergeCard(top)}
            onReject={() => top && rejectCard(top)}
            onKeepGoing={() => setSheetOpen(true)}
          />
        </>
      )}

      <KeepGoingSheet
        open={sheetOpen && !!top}
        title={top?.title ?? ""}
        onClose={() => setSheetOpen(false)}
        onSend={(message) => top && markWaiting(top, message)}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </ApprovalShell>
  );
}

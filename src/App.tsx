import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActionHints } from "./components/ActionHints";
import { ApprovalShell } from "./components/ApprovalShell";
import { CardStack, type SwipeAction } from "./components/CardStack";
import {
  HistorySheet,
  type HistoryEntry,
} from "./components/HistorySheet";
import { KeepGoingSheet } from "./components/KeepGoingSheet";
import { Toast, type ToastState } from "./components/Toast";
import {
  cloneReviews,
  type ReviewCard,
} from "./data/reviews";

let historySeq = 0;

export default function App() {
  const [cards, setCards] = useState<ReviewCard[]>(() => cloneReviews());
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
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
  const canRewind = history.length > 0;

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

  function pushHistory(
    card: ReviewCard,
    action: HistoryEntry["action"],
    followUp?: string,
  ) {
    historySeq += 1;
    const entry: HistoryEntry = {
      id: `hist-${historySeq}`,
      card: { ...card },
      action,
      at: Date.now(),
      followUp,
    };
    setHistory((prev) => [entry, ...prev]);
    return entry;
  }

  function restoreFromEntry(entry: HistoryEntry) {
    setCards((prev) => {
      const without = prev.filter((c) => c.id !== entry.card.id);
      return [{ ...entry.card, status: "ready" }, ...without];
    });
    setHistory((prev) => prev.filter((h) => h.id !== entry.id));
  }

  function rewindLast() {
    const latest = history[0];
    if (!latest) return;
    restoreFromEntry(latest);
    showToast(`Rewound · ${latest.card.title}`);
  }

  function mergeCard(card: ReviewCard) {
    setCards((prev) =>
      prev.map((c) => (c.id === card.id ? { ...c, status: "merged" } : c)),
    );
    const entry = pushHistory(card, "merge");
    showToast(`Merged · ${card.title}`, {
      actionLabel: "Undo",
      onAction: () => restoreFromEntry(entry),
    });
  }

  function rejectCard(card: ReviewCard) {
    setCards((prev) =>
      prev.map((c) => (c.id === card.id ? { ...c, status: "rejected" } : c)),
    );
    const entry = pushHistory(card, "reject");
    showToast(`Rejected · ${card.title}`, {
      actionLabel: "Undo",
      onAction: () => restoreFromEntry(entry),
    });
  }

  function markWaiting(card: ReviewCard, followUp: string) {
    setCards((prev) => {
      const updated = prev.map((c) =>
        c.id === card.id ? { ...c, status: "waiting" as const } : c,
      );
      const ready = updated.filter((c) => c.status === "ready");
      const waiting = updated.filter((c) => c.status === "waiting");
      const done = updated.filter(
        (c) => c.status === "merged" || c.status === "rejected",
      );
      return [...ready, ...waiting, ...done];
    });
    setSheetOpen(false);
    const entry = pushHistory(card, "keep", followUp);
    showToast(`Follow-up sent · “${followUp}” · agent resumed`, {
      actionLabel: "Undo",
      onAction: () => restoreFromEntry(entry),
    });
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
    setHistoryOpen(false);
    setHistory([]);
    setCards(cloneReviews());
  }

  return (
    <ApprovalShell
      readyCount={readyCards.length}
      waitingCount={waitingCount}
      historyCount={history.length}
      onOpenHistory={() => setHistoryOpen(true)}
    >
      {readyCards.length === 0 ? (
        <div className="empty-state">
          <h2>All caught up</h2>
          <p>No agent diffs waiting</p>
          {history.length > 0 && (
            <button
              type="button"
              className="btn ghost history-empty-btn"
              onClick={() => setHistoryOpen(true)}
            >
              View history ({history.length})
            </button>
          )}
          <button type="button" className="btn reset" onClick={resetDemo}>
            Reset demo
          </button>
        </div>
      ) : (
        <>
          <CardStack
            cards={readyCards}
            onSwipe={handleSwipe}
            locked={sheetOpen || historyOpen}
          />
          <ActionHints
            disabled={!top || sheetOpen || historyOpen}
            canRewind={canRewind}
            onMerge={() => top && mergeCard(top)}
            onReject={() => top && rejectCard(top)}
            onKeepGoing={() => setSheetOpen(true)}
            onRewind={rewindLast}
          />
        </>
      )}

      <KeepGoingSheet
        open={sheetOpen && !!top}
        title={top?.title ?? ""}
        onClose={() => setSheetOpen(false)}
        onSend={(message) => top && markWaiting(top, message)}
      />

      <HistorySheet
        open={historyOpen}
        entries={history}
        onClose={() => setHistoryOpen(false)}
        onRestore={(entry) => {
          restoreFromEntry(entry);
          setHistoryOpen(false);
          showToast(`Restored · ${entry.card.title}`);
        }}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </ApprovalShell>
  );
}

import type { ReactNode } from "react";
import { IconHistory } from "./ActionIcons";
import { CursorAppIcon } from "./CursorLogo";
import "./ApprovalShell.css";

interface ApprovalShellProps {
  readyCount: number;
  waitingCount: number;
  historyCount: number;
  onOpenHistory: () => void;
  children: ReactNode;
}

export function ApprovalShell({
  readyCount,
  waitingCount,
  historyCount,
  onOpenHistory,
  children,
}: ApprovalShellProps) {
  return (
    <div className="app-stage">
      <div className="phone-frame">
        <div className="phone-notch" aria-hidden />
        <div className="approval-shell">
          <header className="shell-header">
            <div className="nav-row">
              <div className="brand-lockup">
                <CursorAppIcon className="brand-logo" />
                <span className="brand-wordmark">Cursor</span>
              </div>
              <button
                type="button"
                className="history-btn"
                onClick={onOpenHistory}
                aria-label={
                  historyCount > 0
                    ? `Open swipe history, ${historyCount} items`
                    : "Open swipe history"
                }
                title="Swipe history"
              >
                <IconHistory />
                {historyCount > 0 && (
                  <span className="history-badge">{historyCount}</span>
                )}
              </button>
            </div>
            <h1 className="mode-title">Ready to review</h1>
            <div className="queue-meta">
              <span className="queue-count">
                {readyCount} {readyCount === 1 ? "agent" : "agents"}
              </span>
              {waitingCount > 0 && (
                <span className="waiting-count">{waitingCount} waiting</span>
              )}
              <span className="queue-hint">← reject · ↑ keep · merge →</span>
            </div>
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}

import type { ReactNode } from "react";
import "./ApprovalShell.css";

interface ApprovalShellProps {
  readyCount: number;
  waitingCount: number;
  children: ReactNode;
}

export function ApprovalShell({
  readyCount,
  waitingCount,
  children,
}: ApprovalShellProps) {
  return (
    <div className="app-stage">
      <div className="phone-frame">
        <div className="phone-notch" aria-hidden />
        <div className="approval-shell">
          <header className="shell-header">
            <div className="brand-row">
              <div className="brand-mark" aria-hidden>
                <span className="brand-mark-plus" />
              </div>
              <div className="brand-text">
                <p className="brand-name">Cursor</p>
                <h1 className="mode-title">Approval Mode</h1>
              </div>
            </div>
            <p className="mode-sub">Swipe to review agent diffs</p>
            <div className="queue-meta">
              <span className="queue-count">
                {readyCount} ready
              </span>
              {waitingCount > 0 && (
                <span className="waiting-count">
                  {waitingCount} waiting
                </span>
              )}
            </div>
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}

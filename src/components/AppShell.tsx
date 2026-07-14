import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import type { TabId } from "../types";
import "./AppShell.css";

interface AppShellProps {
  tab: TabId;
  onTabChange: (tab: TabId) => void;
  openCount: number;
  taskCount: number;
  children: ReactNode;
  overlays?: ReactNode;
}

const TABS: { id: TabId; label: string }[] = [
  { id: "captures", label: "Captures" },
  { id: "talk", label: "Talk" },
  { id: "tasks", label: "Tasks" },
];

export function AppShell({
  tab,
  onTabChange,
  openCount,
  taskCount,
  children,
  overlays,
}: AppShellProps) {
  return (
    <div className="device-frame">
      <div className="phone">
        <div className="phone-notch" aria-hidden />
        <header className="app-header">
          <div className="brand-block">
            <p className="brand">ShotList</p>
            <p className="brand-sub">Talk to what you capture</p>
          </div>
          <div className="header-stats" aria-label="Counts">
            <span>{openCount} open</span>
            <span className="dot" aria-hidden />
            <span>{taskCount} tasks</span>
          </div>
        </header>

        <main className="app-main">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              className="tab-pane"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        <nav className="tab-bar" aria-label="Primary">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                className={`tab-btn${active ? " active" : ""}`}
                onClick={() => onTabChange(t.id)}
                aria-current={active ? "page" : undefined}
              >
                <span className="tab-icon" aria-hidden>
                  {t.id === "captures" && (
                    <svg viewBox="0 0 24 24" fill="none">
                      <rect
                        x="3"
                        y="5"
                        width="18"
                        height="14"
                        rx="3"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="3.2"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                    </svg>
                  )}
                  {t.id === "talk" && (
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v6A2.5 2.5 0 0 1 16.5 15H12l-4 4v-4H7.5A2.5 2.5 0 0 1 5 12.5v-6Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  {t.id === "tasks" && (
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M8 7h11M8 12h11M8 17h11"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M4.5 7.2 5.7 8.4 7.8 6"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M4.5 12.2 5.7 13.4 7.8 11"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M4.5 17.2 5.7 18.4 7.8 16"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </nav>

        {overlays}
      </div>
    </div>
  );
}

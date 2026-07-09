import { useState } from "react";
import { cardStats, type ReviewCard } from "../data/reviews";
import { ciClass, formatCi, formatRisk, riskClass } from "../lib/labels";
import { DiffHunk } from "./DiffHunk";
import "./ReviewCard.css";

interface ReviewCardViewProps {
  card: ReviewCard;
  dragHint?: { merge: number; reject: number; keep: number };
  interactive?: boolean;
}

export function ReviewCardView({
  card,
  dragHint = { merge: 0, reject: 0, keep: 0 },
  interactive = true,
}: ReviewCardViewProps) {
  const [openPath, setOpenPath] = useState<string | null>(
    card.files[0]?.path ?? null,
  );
  const stats = cardStats(card);

  return (
    <article className="review-card" aria-label={card.title}>
      <div
        className="gesture-overlay merge"
        style={{ opacity: dragHint.merge }}
        aria-hidden
      >
        <span>MERGE</span>
      </div>
      <div
        className="gesture-overlay reject"
        style={{ opacity: dragHint.reject }}
        aria-hidden
      >
        <span>REJECT</span>
      </div>
      <div
        className="gesture-overlay keep"
        style={{ opacity: dragHint.keep }}
        aria-hidden
      >
        <span>KEEP GOING</span>
      </div>

      <header className="review-card-header">
        <div className="review-card-chips">
          <span
            className={`status-chip ${card.status === "waiting" ? "waiting" : "ready"}`}
          >
            {card.status === "waiting" ? "Waiting · agent resumed" : "Ready for review"}
          </span>
          <span className="model-chip">{card.model}</span>
        </div>
        <p className="repo-line mono">
          {card.repo}
          <span className="repo-sep">·</span>
          {card.branch}
        </p>
        <h2 className="review-title">{card.title}</h2>
        <p className="review-summary">{card.summary}</p>
        <div className="signal-row" aria-label="Oversight signals">
          <span className={`signal ${riskClass(card.risk)}`}>
            {formatRisk(card.risk)}
          </span>
          <span className={`signal ${ciClass(card.ci)}`}>{formatCi(card.ci)}</span>
          <span className="signal signal-neutral mono">
            +{stats.additions}/−{stats.deletions}
          </span>
          <span className="signal signal-neutral">
            {stats.fileCount} {stats.fileCount === 1 ? "file" : "files"}
          </span>
        </div>
      </header>

      <div
        className="file-list"
        role="list"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {card.files.map((file) => {
          const open = openPath === file.path;
          return (
            <div key={file.path} className="file-block" role="listitem">
              <button
                type="button"
                className="file-toggle"
                aria-expanded={open}
                disabled={!interactive}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenPath(open ? null : file.path);
                }}
              >
                <span className="file-chevron" aria-hidden>
                  {open ? "▾" : "▸"}
                </span>
                <span className="file-path mono">{file.path}</span>
                <span className="file-stats mono">
                  +{file.additions}/−{file.deletions}
                </span>
              </button>
              {open &&
                file.hunks.map((hunk, i) => <DiffHunk key={i} hunk={hunk} />)}
            </div>
          );
        })}
      </div>
    </article>
  );
}

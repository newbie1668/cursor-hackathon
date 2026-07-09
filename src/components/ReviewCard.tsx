import { useState } from "react";
import { cardStats, type ReviewCard } from "../data/reviews";
import { formatPrStatus, prStatusClass } from "../lib/labels";
import { splitFilePath } from "../lib/paths";
import {
  IconBack,
  IconExternal,
  IconLink,
  IconMore,
} from "./ActionIcons";
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
  const [openPath, setOpenPath] = useState<string | null>(null);
  const stats = cardStats(card);

  return (
    <article className="review-card pr-detail" aria-label={card.title}>
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

      <nav className="pr-nav" aria-label="Pull request navigation">
        <button
          type="button"
          className="pr-nav-btn"
          aria-label="Back"
          tabIndex={interactive ? 0 : -1}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <IconBack />
        </button>
        <div className="pr-nav-actions">
          <button
            type="button"
            className="pr-nav-btn"
            aria-label="Copy link"
            tabIndex={interactive ? 0 : -1}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <IconLink />
          </button>
          <button
            type="button"
            className="pr-nav-btn"
            aria-label="More options"
            tabIndex={interactive ? 0 : -1}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <IconMore />
          </button>
        </div>
      </nav>

      <header className="pr-hero">
        <h2 className="pr-title">
          {card.title}{" "}
          <span className="pr-number">#{card.prNumber}</span>
        </h2>
        <div className="pr-meta">
          <span className={`pr-status-badge ${prStatusClass(card.status)}`}>
            {formatPrStatus(card.status)}
          </span>
          <span className="pr-stats" aria-label="Pull request stats">
            <span className="stat-add">+{stats.additions}</span>{" "}
            <span className="stat-del">−{stats.deletions}</span>
            <span className="stat-sep">·</span>
            {stats.fileCount} {stats.fileCount === 1 ? "File" : "Files"}
            <span className="stat-sep">·</span>
            {card.commits} {card.commits === 1 ? "Commit" : "Commits"}
          </span>
        </div>
      </header>

      <div
        className="pr-scroll"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {card.previewUrl && (
          <section className="pr-section">
            <h3 className="pr-section-label">Deployments</h3>
            <a
              className="deployment-card"
              href={card.previewUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="deployment-check" aria-hidden>
                ✓
              </span>
              <span className="deployment-label">Preview</span>
              <IconExternal className="deployment-link" />
            </a>
          </section>
        )}

        <section className="pr-section">
          <h3 className="pr-section-label">
            {stats.fileCount} {stats.fileCount === 1 ? "File" : "Files"}
          </h3>
          <ul className="pr-file-list" role="list">
            {card.files.map((file) => {
              const open = openPath === file.path;
              const { name, dir } = splitFilePath(file.path);
              return (
                <li key={file.path} className="pr-file-item">
                  <button
                    type="button"
                    className="pr-file-row"
                    aria-expanded={open}
                    disabled={!interactive}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenPath(open ? null : file.path);
                    }}
                  >
                    <span className="pr-file-chevron" aria-hidden>
                      ›
                    </span>
                    <span className="pr-file-name">{name}</span>
                    {dir && <span className="pr-file-dir">{dir}</span>}
                    <span className="pr-file-stats" aria-hidden>
                      <span className="stat-add">+{file.additions}</span>{" "}
                      <span className="stat-del">−{file.deletions}</span>
                    </span>
                  </button>
                  {open &&
                    file.hunks.map((hunk, i) => (
                      <DiffHunk key={i} hunk={hunk} />
                    ))}
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </article>
  );
}

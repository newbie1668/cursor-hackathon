import { motion } from "framer-motion";
import type { Capture } from "../types";
import { relativeDay } from "../lib/format";
import { SOURCE_LABEL } from "../lib/source";
import "./CaptureInbox.css";

interface CaptureInboxProps {
  captures: Capture[];
  onUpload: (file: File) => void;
  onOpenCapture: (id: string) => void;
  onPickSource: (id: string, kind: Capture["sourceKind"]) => void;
}

export function CaptureInbox({
  captures,
  onUpload,
  onOpenCapture,
  onPickSource,
}: CaptureInboxProps) {
  const sorted = [...captures].sort((a, b) => b.createdAt - a.createdAt);
  const open = sorted.filter((c) => !c.categorized);

  return (
    <div className="captures">
      <section className="hero-capture">
        <h1>Capture the scroll</h1>
        <p>
          Screenshot YouTube, LinkedIn, or any site — then talk it into a dated
          to-do.
        </p>
        <label className="capture-cta">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
              e.currentTarget.value = "";
            }}
          />
          <span>Add screenshot</span>
        </label>
      </section>

      {open.length > 0 && (
        <p className="section-note">
          {open.length} waiting to be categorized in Talk
        </p>
      )}

      <ul className="capture-grid">
        {sorted.map((capture, i) => (
          <motion.li
            key={capture.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.05, 0.25), duration: 0.28 }}
          >
            <button
              type="button"
              className="capture-card"
              onClick={() => onOpenCapture(capture.id)}
            >
              <div className="capture-thumb-wrap">
                <img
                  src={capture.imageDataUrl}
                  alt=""
                  className="capture-thumb"
                />
                {!capture.categorized && (
                  <span className="capture-badge">New</span>
                )}
              </div>
              <div className="capture-meta">
                <div className="capture-meta-top">
                  <span className={`source-pill ${capture.sourceKind}`}>
                    {SOURCE_LABEL[capture.sourceKind]}
                  </span>
                  <time dateTime={new Date(capture.createdAt).toISOString()}>
                    {relativeDay(capture.createdAt)}
                  </time>
                </div>
                <p className="capture-note">
                  {capture.note ?? "Untitled capture"}
                </p>
              </div>
            </button>
            {capture.sourceKind === "other" && (
              <div className="source-picker" onClick={(e) => e.stopPropagation()}>
                {(["youtube", "linkedin", "website"] as const).map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => onPickSource(capture.id, kind)}
                  >
                    {SOURCE_LABEL[kind]}
                  </button>
                ))}
              </div>
            )}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

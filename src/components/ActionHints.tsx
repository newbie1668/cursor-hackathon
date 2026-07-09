import { useEffect, useState } from "react";
import "./ActionHints.css";

interface ActionHintsProps {
  onMerge: () => void;
  onReject: () => void;
  onKeepGoing: () => void;
  disabled?: boolean;
}

export function ActionHints({
  onMerge,
  onReject,
  onKeepGoing,
  disabled,
}: ActionHintsProps) {
  const [showLegend, setShowLegend] = useState(true);

  useEffect(() => {
    const seen = sessionStorage.getItem("approval-legend-seen");
    if (seen) setShowLegend(false);
  }, []);

  function dismissLegend() {
    sessionStorage.setItem("approval-legend-seen", "1");
    setShowLegend(false);
  }

  return (
    <div className="action-hints">
      {showLegend && (
        <button
          type="button"
          className="swipe-legend"
          onClick={dismissLegend}
          aria-label="Dismiss swipe legend"
        >
          <span>← reject</span>
          <span>↑ keep going</span>
          <span>merge →</span>
        </button>
      )}
      <div className="action-buttons" role="group" aria-label="Review actions">
        <button
          type="button"
          className="action-btn reject"
          disabled={disabled}
          onClick={onReject}
          aria-label="Reject"
        >
          Reject
        </button>
        <button
          type="button"
          className="action-btn keep"
          disabled={disabled}
          onClick={onKeepGoing}
          aria-label="Keep going"
        >
          Keep going
        </button>
        <button
          type="button"
          className="action-btn merge"
          disabled={disabled}
          onClick={onMerge}
          aria-label="Merge"
        >
          Merge
        </button>
      </div>
    </div>
  );
}

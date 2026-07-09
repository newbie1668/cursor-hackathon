import {
  IconKeep,
  IconMerge,
  IconReject,
  IconRewind,
} from "./ActionIcons";
import "./ActionHints.css";

interface ActionHintsProps {
  onMerge: () => void;
  onReject: () => void;
  onKeepGoing: () => void;
  onRewind: () => void;
  canRewind: boolean;
  disabled?: boolean;
}

export function ActionHints({
  onMerge,
  onReject,
  onKeepGoing,
  onRewind,
  canRewind,
  disabled,
}: ActionHintsProps) {
  return (
    <div className="action-hints">
      <p className="swipe-coach" aria-hidden>
        Swipe or tap
      </p>
      <div className="action-buttons" role="group" aria-label="Review actions">
        <button
          type="button"
          className="tinder-btn rewind"
          disabled={disabled || !canRewind}
          onClick={onRewind}
          aria-label="Undo last swipe"
          title="Rewind"
        >
          <IconRewind />
          <span className="tinder-btn-label">Rewind</span>
        </button>
        <button
          type="button"
          className="tinder-btn reject"
          disabled={disabled}
          onClick={onReject}
          aria-label="Reject — swipe left"
          title="Reject · swipe left"
        >
          <IconReject />
          <span className="tinder-btn-label">Reject</span>
        </button>
        <button
          type="button"
          className="tinder-btn keep"
          disabled={disabled}
          onClick={onKeepGoing}
          aria-label="Keep going — swipe up"
          title="Keep going · swipe up"
        >
          <IconKeep />
          <span className="tinder-btn-label">Keep</span>
        </button>
        <button
          type="button"
          className="tinder-btn merge"
          disabled={disabled}
          onClick={onMerge}
          aria-label="Merge — swipe right"
          title="Merge · swipe right"
        >
          <IconMerge />
          <span className="tinder-btn-label">Merge</span>
        </button>
      </div>
    </div>
  );
}

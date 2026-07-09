import { useCallback } from "react";
import { useSpeechToText } from "../hooks/useSpeechToText";
import "./CommentField.css";

interface CommentFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
}

export function CommentField({
  id,
  value,
  onChange,
  placeholder,
  rows = 3,
  label,
}: CommentFieldProps) {
  const handleTranscript = useCallback(
    (text: string, isFinal: boolean) => {
      if (!isFinal) return;
      const trimmed = text.trim();
      if (!trimmed) return;
      onChange(value ? `${value.trimEnd()} ${trimmed}` : trimmed);
    },
    [value, onChange],
  );

  const { listening, supported, toggle } = useSpeechToText({
    onTranscript: handleTranscript,
  });

  return (
    <div className="comment-field">
      {label && (
        <label className="sheet-label" htmlFor={id}>
          {label}
        </label>
      )}
      <div className="comment-input-wrap">
        <textarea
          id={id}
          className="follow-input comment-input"
          rows={rows}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {supported && (
          <button
            type="button"
            className={`dictate-btn${listening ? " listening" : ""}`}
            aria-label={listening ? "Stop dictation" : "Dictate comment"}
            aria-pressed={listening}
            onClick={toggle}
          >
            <MicIcon listening={listening} />
          </button>
        )}
      </div>
      {listening && (
        <p className="dictate-hint" role="status">
          Listening… tap the mic when you&apos;re done
        </p>
      )}
    </div>
  );
}

function MicIcon({ listening }: { listening: boolean }) {
  if (listening) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M19 11a7 7 0 0 1-14 0M12 18v3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

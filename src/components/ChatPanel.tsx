import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ChatMessage } from "../types";
import { useSpeechToText } from "../hooks/useSpeechToText";
import "./ChatPanel.css";

interface ChatPanelProps {
  messages: ChatMessage[];
  openCaptures: number;
  onSend: (text: string) => void;
}

export function ChatPanel({ messages, openCaptures, onSend }: ChatPanelProps) {
  const [draft, setDraft] = useState("");
  const [interim, setInterim] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const finalBuffer = useRef("");

  const { listening, supported, toggle, stop } = useSpeechToText({
    onTranscript: (text, isFinal) => {
      if (isFinal) {
        finalBuffer.current = `${finalBuffer.current} ${text}`.trim();
        setDraft(finalBuffer.current);
        setInterim("");
      } else {
        setInterim(text);
      }
    },
  });

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, interim]);

  function submit(e?: FormEvent) {
    e?.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft("");
    setInterim("");
    finalBuffer.current = "";
    stop();
  }

  function handleMic() {
    if (!listening) {
      finalBuffer.current = draft.trim();
    }
    toggle();
  }

  return (
    <div className="chat">
      <div className="chat-banner">
        <strong>Talk it into tasks</strong>
        <span>
          {openCaptures > 0
            ? `${openCaptures} capture${openCaptures === 1 ? "" : "s"} ready to file`
            : "Add a screenshot, then describe what to do"}
        </span>
      </div>

      <div className="chat-scroll" ref={scroller}>
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              className={`bubble ${msg.role}`}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.22 }}
            >
              <p>{msg.text}</p>
            </motion.div>
          ))}
        </AnimatePresence>
        {listening && interim && (
          <div className="bubble user interim">
            <p>{interim}</p>
          </div>
        )}
      </div>

      <form className="chat-composer" onSubmit={submit}>
        <div className="composer-row">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder='e.g. “Read the Stripe billing article”'
            rows={2}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
          />
          {supported && (
            <button
              type="button"
              className={`mic-btn${listening ? " live" : ""}`}
              onClick={handleMic}
              aria-pressed={listening}
              aria-label={listening ? "Stop listening" : "Speak"}
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                <rect
                  x="9"
                  y="3"
                  width="6"
                  height="11"
                  rx="3"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M6 11a6 6 0 0 0 12 0M12 17v3"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>
        <button type="submit" className="send-btn" disabled={!draft.trim()}>
          Categorize
        </button>
      </form>
    </div>
  );
}

import { AnimatePresence, motion } from "framer-motion";
import "./Toast.css";

export interface ToastState {
  id: number;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastProps {
  toast: ToastState | null;
  onDismiss: () => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          className="toast"
          role="status"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
        >
          <span className="toast-message">{toast.message}</span>
          <div className="toast-actions">
            {toast.actionLabel && toast.onAction && (
              <button
                type="button"
                className="toast-action"
                onClick={() => {
                  toast.onAction?.();
                  onDismiss();
                }}
              >
                {toast.actionLabel}
              </button>
            )}
            <button
              type="button"
              className="toast-dismiss"
              aria-label="Dismiss"
              onClick={onDismiss}
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

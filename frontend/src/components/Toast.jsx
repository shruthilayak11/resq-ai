import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const ICONS = { success: CheckCircle2, error: XCircle, info: Info };
const COLORS = {
  success: "border-green-500/40 text-green-400",
  error: "border-red-500/40 text-red-400",
  info: "border-[var(--color-system)]/40 text-[var(--color-system)]",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, type = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const dismiss = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 w-80">
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <div
              key={t.id}
              className={`flex items-start gap-2 rounded border bg-[var(--color-panel-raised)] px-3 py-2.5 shadow-lg ${COLORS[t.type]}`}
            >
              <Icon size={16} className="mt-0.5 shrink-0" />
              <p className="text-sm text-[var(--color-text)] flex-1">{t.message}</p>
              <button onClick={() => dismiss(t.id)} className="text-[var(--color-dim)] hover:text-[var(--color-text)]">
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

import { Loader2, AlertCircle } from "lucide-react";

export function LoadingState({ label = "Loading..." }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-[var(--color-muted)] text-sm">
      <Loader2 size={16} className="animate-spin" />
      {label}
    </div>
  );
}

export function ErrorState({ message = "Something went wrong.", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center px-4">
      <AlertCircle size={20} className="text-red-400" />
      <p className="text-sm text-[var(--color-muted)]">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 text-xs px-3 py-1.5 rounded border border-[var(--color-border)] hover:border-[var(--color-system)] text-[var(--color-text)]"
        >
          Retry
        </button>
      )}
    </div>
  );
}

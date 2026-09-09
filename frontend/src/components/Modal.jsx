import { X } from "lucide-react";

export function Modal({ open, onClose, title, children, width = "max-w-lg" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 px-4" onClick={onClose}>
      <div
        className={`w-full ${width} rounded border border-[var(--color-border)] bg-[var(--color-panel-raised)] shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
          <h3 className="text-sm font-semibold">{title}</h3>
          <button onClick={onClose} className="text-[var(--color-dim)] hover:text-[var(--color-text)]">
            <X size={16} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = "Confirm" }) {
  return (
    <Modal open={open} onClose={onClose} title={title} width="max-w-sm">
      <p className="text-sm text-[var(--color-muted)] mb-4">{message}</p>
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-3 py-1.5 text-sm rounded border border-[var(--color-border)] hover:border-[var(--color-dim)]"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className="px-3 py-1.5 text-sm rounded bg-[var(--color-system)] text-white hover:opacity-90"
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

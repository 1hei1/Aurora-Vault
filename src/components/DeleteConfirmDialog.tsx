import { useEffect } from "react";
import { createPortal } from "react-dom";

interface DeleteConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({ open, title, description, onConfirm, onCancel }: DeleteConfirmDialogProps) {
  useEffect(() => {
    if (!open || typeof window === "undefined") {
      return;
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
      }
      if (event.key === "Enter") {
        event.preventDefault();
        onConfirm();
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [open, onCancel, onConfirm]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 shadow-[var(--shadow-card)]">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">确认删除</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            确认要删除“<span className="font-semibold text-[var(--text-primary)]">{title}</span>”吗？删除后无法恢复。
          </p>
          {description && <p className="text-xs text-[var(--text-tertiary)]">{description}</p>}
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-400"
          >
            删除
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

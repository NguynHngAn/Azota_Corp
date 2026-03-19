import type { ReactNode } from "react";
import ReactDOM from "react-dom";

export function AdminModal({
  open,
  title,
  children,
  onClose,
  footer,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
}) {
  if (!open) return null;
  const root = document.getElementById("app");
  if (!root) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="fixed inset-0 bg-black/40 admin-overlay"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 admin-modal-enter">
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100">
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="px-6 pb-5">{footer}</div>}
      </div>
    </div>,
    root,
  );
}


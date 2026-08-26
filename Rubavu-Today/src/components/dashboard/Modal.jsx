import React, { useEffect } from "react";

function ModalShell({ children, onClose, maxWidth = "max-w-lg" }) {
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 flex max-h-[calc(100dvh-1.5rem)] w-full ${maxWidth} flex-col overflow-hidden rounded-xl bg-white shadow-modal sm:max-h-[85vh]`}>
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, description, onClose }) {
  return (
    <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      </div>
      <button
        onClick={onClose}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        aria-label="Close"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

function ModalFooter({ onCancel, onConfirm, confirmText, confirmClass = "btn-primary", confirmType = "button", loading }) {
  return (
    <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="btn-secondary"
      >
        Cancel
      </button>
      <button
        type={confirmType}
        onClick={onConfirm}
        disabled={loading}
        className={confirmClass}
      >
        {loading ? "Saving..." : confirmText}
      </button>
    </div>
  );
}

function FormField({ label, description, children, required }) {
  return (
    <div className="min-w-0">
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {description && <p className="mb-1.5 text-xs text-slate-400">{description}</p>}
      {children}
    </div>
  );
}

export { ModalShell, ModalHeader, ModalFooter, FormField };

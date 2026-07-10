"use client";

import { AlertTriangle } from "lucide-react";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  danger = true,
  pending = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-neutral-900/70 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-start gap-3">
          <span
            className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
              danger ? "bg-red-100 text-red-600" : "bg-brand-light text-brand"
            }`}
          >
            <AlertTriangle className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-neutral-800">{title}</h2>
            <div className="mt-1 text-sm text-neutral-600">{message}</div>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={`rounded-lg px-4 py-2 text-sm font-bold text-white disabled:opacity-60 ${
              danger ? "bg-red-600 hover:bg-red-700" : "bg-brand hover:bg-brand-dark"
            }`}
          >
            {pending ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

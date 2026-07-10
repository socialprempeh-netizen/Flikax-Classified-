"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_TICKET_STATUS_LABELS, ADMIN_TICKET_STATUS_STYLES } from "@/lib/admin-support";
import { updateTicketStatusAction } from "@/app/admin/support/actions";
import { withAuthRetry } from "@/lib/auth-retry";

export type AdminTicketRow = {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  status: string;
  createdAt: string;
};

export function SupportTable({ tickets }: { tickets: AdminTicketRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const allSelected = tickets.length > 0 && selected.size === tickets.length;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(tickets.map((t) => t.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function run(ids: string[], status: string) {
    setError(null);
    startTransition(async () => {
      try {
        await withAuthRetry(() => updateTicketStatusAction(ids, status));
        setSelected(new Set());
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Action failed.");
      }
    });
  }

  const selectedIds = Array.from(selected);

  if (tickets.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-white py-16 text-center text-sm text-neutral-400">
        No support tickets match these filters.
      </div>
    );
  }

  return (
    <div>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      {selectedIds.length > 0 && (
        <div className="sticky top-14 z-20 mb-3 flex flex-wrap items-center gap-2 rounded-2xl border border-brand/30 bg-brand-light px-4 py-3">
          <span className="text-sm font-bold text-neutral-800">{selectedIds.length} selected</span>
          <button
            type="button"
            disabled={isPending}
            onClick={() => run(selectedIds, "in_progress")}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            Mark in progress
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => run(selectedIds, "resolved")}
            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-60"
          >
            Resolve
          </button>
        </div>
      )}

      <div className="divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-100 bg-white">
        <div className="flex items-center gap-3 bg-neutral-50 px-4 py-2">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            aria-label="Select all"
            className="size-4 accent-brand"
          />
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Select all on this page
          </span>
        </div>

        {tickets.map((ticket) => (
          <div key={ticket.id} className="flex items-start gap-3 p-4 hover:bg-neutral-50">
            <input
              type="checkbox"
              checked={selected.has(ticket.id)}
              onChange={() => toggleOne(ticket.id)}
              aria-label={`Select ticket from ${ticket.name}`}
              className="mt-1 size-4 shrink-0 accent-brand"
            />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-neutral-800">{ticket.name}</span>
                <a href={`mailto:${ticket.email}`} className="text-sm text-brand hover:underline">
                  {ticket.email}
                </a>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                    ADMIN_TICKET_STATUS_STYLES[ticket.status] ?? "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {ADMIN_TICKET_STATUS_LABELS[ticket.status] ?? ticket.status}
                </span>
              </div>
              <p className="mt-0.5 text-sm font-medium text-neutral-600">{ticket.topic}</p>
              <p className="mt-1 text-sm text-neutral-600">{ticket.message}</p>
              <p className="mt-1 text-xs text-neutral-400">{new Date(ticket.createdAt).toLocaleString()}</p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
              {ticket.status !== "in_progress" && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => run([ticket.id], "in_progress")}
                  className="rounded-lg border border-blue-200 px-2.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50 disabled:opacity-60"
                >
                  In progress
                </button>
              )}
              {ticket.status !== "resolved" && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => run([ticket.id], "resolved")}
                  className="rounded-lg border border-green-200 px-2.5 py-1.5 text-xs font-bold text-green-700 hover:bg-green-50 disabled:opacity-60"
                >
                  Resolve
                </button>
              )}
              {ticket.status !== "open" && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => run([ticket.id], "open")}
                  className="rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
                >
                  Reopen
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

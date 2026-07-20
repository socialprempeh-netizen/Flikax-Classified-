"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Flag, TriangleAlert } from "lucide-react";
import { ADMIN_REPORT_STATUS_LABELS, ADMIN_REPORT_STATUS_STYLES } from "@/lib/admin-reports";
import { REPORT_REASON_LABELS, type ReportReason } from "@/lib/report-reasons";
import {
  updateReportStatusAction,
  toggleReportPriorityAction,
  warnSellerForReportAction,
  suspendSellerForReportAction,
  deleteListingForReportAction,
} from "@/app/admin/reports/actions";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { withAuthRetry } from "@/lib/auth-retry";

export type AdminReportRow = {
  id: string;
  reason: string;
  status: string;
  priority: boolean;
  createdAt: string;
  reporterName: string | null;
  listingId: string;
  listingTitle: string;
  listingStatus: string;
  sellerId: string;
  sellerName: string | null;
};

type PendingConfirm =
  | { type: "suspend"; report: AdminReportRow }
  | { type: "delete"; report: AdminReportRow };

export function ReportsTable({ reports }: { reports: AdminReportRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<PendingConfirm | null>(null);
  const [warnTarget, setWarnTarget] = useState<AdminReportRow | null>(null);
  const [warnMessage, setWarnMessage] = useState("");
  const [suspendDays, setSuspendDays] = useState(7);

  const allSelected = reports.length > 0 && selected.size === reports.length;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(reports.map((r) => r.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function run(action: () => Promise<void>, onDone?: () => void) {
    setError(null);
    startTransition(async () => {
      try {
        await withAuthRetry(action);
        onDone?.();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Action failed.");
      }
    });
  }

  const selectedIds = Array.from(selected);

  if (reports.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-strong bg-white py-16 text-center text-sm text-neutral-400">
        No reports match these filters.
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
            onClick={() => run(() => updateReportStatusAction(selectedIds, "resolved"), () => setSelected(new Set()))}
            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-60"
          >
            Resolve
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => run(() => updateReportStatusAction(selectedIds, "dismissed"), () => setSelected(new Set()))}
            className="rounded-lg bg-neutral-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-neutral-700 disabled:opacity-60"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="divide-y divide-neutral-100 overflow-hidden rounded-2xl border-2 border-slate-strong bg-white">
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

        {reports.map((report) => (
          <div key={report.id} className="flex items-start gap-3 p-4 hover:bg-neutral-50">
            <input
              type="checkbox"
              checked={selected.has(report.id)}
              onChange={() => toggleOne(report.id)}
              aria-label={`Select report on ${report.listingTitle}`}
              className="mt-1 size-4 shrink-0 accent-brand"
            />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/admin/listings/${report.listingId}`}
                  className="truncate text-sm font-bold text-neutral-800 hover:text-brand hover:underline"
                >
                  {report.listingTitle}
                </Link>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                    ADMIN_REPORT_STATUS_STYLES[report.status] ?? "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {ADMIN_REPORT_STATUS_LABELS[report.status] ?? report.status}
                </span>
                {report.priority && (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                    <TriangleAlert className="size-3" />
                    High priority
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-sm text-neutral-500">
                {REPORT_REASON_LABELS[report.reason as ReportReason] ?? report.reason} · Reported by{" "}
                {report.reporterName ?? "Unknown"} · Seller:{" "}
                <Link href={`/admin/users/${report.sellerId}`} className="hover:text-brand hover:underline">
                  {report.sellerName ?? "Unknown"}
                </Link>{" "}
                · {new Date(report.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
              {report.status !== "resolved" && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => run(() => updateReportStatusAction([report.id], "resolved"))}
                  className="rounded-lg border border-green-200 px-2.5 py-1.5 text-xs font-bold text-green-700 hover:bg-green-50 disabled:opacity-60"
                >
                  Resolve
                </button>
              )}
              {report.status !== "dismissed" && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => run(() => updateReportStatusAction([report.id], "dismissed"))}
                  className="rounded-lg border-2 border-slate-strong px-2.5 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
                >
                  Dismiss
                </button>
              )}
              <button
                type="button"
                disabled={isPending}
                onClick={() => run(() => toggleReportPriorityAction(report.id, !report.priority))}
                className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-60"
              >
                {report.priority ? "De-escalate" : "Escalate"}
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  setWarnTarget(report);
                  setWarnMessage("");
                }}
                className="rounded-lg border border-amber-200 px-2.5 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-50 disabled:opacity-60"
              >
                Warn seller
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => setConfirm({ type: "suspend", report })}
                className="rounded-lg border border-orange-200 px-2.5 py-1.5 text-xs font-bold text-orange-700 hover:bg-orange-50 disabled:opacity-60"
              >
                Suspend seller
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => setConfirm({ type: "delete", report })}
                className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60"
              >
                Delete listing
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={confirm?.type === "delete"}
        title="Delete this listing?"
        message="This permanently deletes the listing and its photos, and marks the report resolved. This can't be undone."
        confirmLabel="Delete"
        pending={isPending}
        onConfirm={() =>
          confirm?.type === "delete" &&
          run(
            () => deleteListingForReportAction(confirm.report.id, confirm.report.listingId),
            () => setConfirm(null)
          )
        }
        onCancel={() => setConfirm(null)}
      />

      {confirm?.type === "suspend" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-neutral-900/70 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-base font-bold text-neutral-800">Suspend this seller?</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Blocks new listings and plan purchases for the chosen duration, and marks the report resolved.
            </p>
            <select
              value={suspendDays}
              onChange={(e) => setSuspendDays(Number(e.target.value))}
              className="mt-3 rounded-lg border-2 border-slate-strong px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
            >
              {[3, 7, 14, 30].map((d) => (
                <option key={d} value={d}>
                  {d} days
                </option>
              ))}
            </select>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirm(null)}
                disabled={isPending}
                className="rounded-lg border-2 border-slate-strong px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  run(
                    () => suspendSellerForReportAction(confirm.report.id, confirm.report.sellerId, suspendDays),
                    () => setConfirm(null)
                  )
                }
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {isPending ? "Working..." : "Suspend"}
              </button>
            </div>
          </div>
        </div>
      )}

      {warnTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-neutral-900/70 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <Flag className="size-5" />
              </span>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-neutral-800">Warn {warnTarget.sellerName ?? "seller"}</h2>
                <p className="mt-1 text-sm text-neutral-600">
                  Recorded on their profile — not delivered to them (no notification system exists yet).
                </p>
              </div>
            </div>
            <textarea
              rows={3}
              value={warnMessage}
              onChange={(e) => setWarnMessage(e.target.value)}
              placeholder={`Regarding the report on "${warnTarget.listingTitle}"...`}
              className="mt-3 w-full rounded-lg border-2 border-slate-strong px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setWarnTarget(null)}
                disabled={isPending}
                className="rounded-lg border-2 border-slate-strong px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending || !warnMessage.trim()}
                onClick={() =>
                  run(
                    () => warnSellerForReportAction(warnTarget.id, warnTarget.sellerId, warnMessage),
                    () => setWarnTarget(null)
                  )
                }
                className="rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-60"
              >
                {isPending ? "Working..." : "Log warning"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

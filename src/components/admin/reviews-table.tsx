"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Flag, Smile, Meh, Frown, type LucideIcon } from "lucide-react";
import {
  ADMIN_FEEDBACK_REPORT_STATUS_LABELS,
  ADMIN_FEEDBACK_REPORT_STATUS_STYLES,
} from "@/lib/admin-reviews";
import { FEEDBACK_REPORT_REASON_LABELS, type FeedbackReportReason } from "@/lib/feedback-report-reasons";
import {
  updateFeedbackReportStatusAction,
  deleteFeedbackAction,
  warnFeedbackAuthorAction,
} from "@/app/admin/reviews/actions";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { withAuthRetry } from "@/lib/auth-retry";

const SENTIMENT_ICON: Record<string, LucideIcon> = { positive: Smile, neutral: Meh, negative: Frown };

export type AdminReviewRow = {
  id: string;
  reason: string;
  status: string;
  createdAt: string;
  reporterName: string | null;
  feedbackId: string;
  sentiment: string;
  message: string;
  authorId: string;
  authorName: string | null;
  targetProfileId: string;
  targetProfileName: string | null;
};

type PendingConfirm = { type: "delete"; review: AdminReviewRow };

export function ReviewsTable({ reviews }: { reviews: AdminReviewRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<PendingConfirm | null>(null);
  const [warnTarget, setWarnTarget] = useState<AdminReviewRow | null>(null);
  const [warnMessage, setWarnMessage] = useState("");

  const allSelected = reviews.length > 0 && selected.size === reviews.length;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(reviews.map((r) => r.id)));
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

  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-white py-16 text-center text-sm text-neutral-400">
        No reported feedback matches these filters.
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
            onClick={() => run(() => updateFeedbackReportStatusAction(selectedIds, "resolved"), () => setSelected(new Set()))}
            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-60"
          >
            Resolve
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => run(() => updateFeedbackReportStatusAction(selectedIds, "dismissed"), () => setSelected(new Set()))}
            className="rounded-lg bg-neutral-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-neutral-700 disabled:opacity-60"
          >
            Dismiss
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

        {reviews.map((review) => {
          const SentimentIcon = SENTIMENT_ICON[review.sentiment] ?? Meh;
          return (
            <div key={review.id} className="flex items-start gap-3 p-4 hover:bg-neutral-50">
              <input
                type="checkbox"
                checked={selected.has(review.id)}
                onChange={() => toggleOne(review.id)}
                aria-label={`Select report on feedback from ${review.authorName ?? "unknown"}`}
                className="mt-1 size-4 shrink-0 accent-brand"
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <SentimentIcon className="size-4 shrink-0 text-neutral-400" />
                  <span className="text-sm font-bold text-neutral-800">{review.authorName ?? "Unknown"}</span>
                  <span className="text-xs text-neutral-400">on</span>
                  <Link
                    href={`/u/${review.targetProfileId}`}
                    className="text-sm text-neutral-600 hover:text-brand hover:underline"
                  >
                    {review.targetProfileName ?? "Unknown profile"}
                  </Link>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                      ADMIN_FEEDBACK_REPORT_STATUS_STYLES[review.status] ?? "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {ADMIN_FEEDBACK_REPORT_STATUS_LABELS[review.status] ?? review.status}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm text-neutral-600">&quot;{review.message}&quot;</p>
                <p className="mt-0.5 text-sm text-neutral-500">
                  {FEEDBACK_REPORT_REASON_LABELS[review.reason as FeedbackReportReason] ?? review.reason} ·
                  Reported by {review.reporterName ?? "Unknown"} ·{" "}
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                {review.status !== "resolved" && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => run(() => updateFeedbackReportStatusAction([review.id], "resolved"))}
                    className="rounded-lg border border-green-200 px-2.5 py-1.5 text-xs font-bold text-green-700 hover:bg-green-50 disabled:opacity-60"
                  >
                    Resolve
                  </button>
                )}
                {review.status !== "dismissed" && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => run(() => updateFeedbackReportStatusAction([review.id], "dismissed"))}
                    className="rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
                  >
                    Dismiss
                  </button>
                )}
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    setWarnTarget(review);
                    setWarnMessage("");
                  }}
                  className="rounded-lg border border-amber-200 px-2.5 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-50 disabled:opacity-60"
                >
                  Warn author
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setConfirm({ type: "delete", review })}
                  className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  Delete feedback
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={confirm?.type === "delete"}
        title="Delete this feedback?"
        message="Removes the feedback entry and any replies, and marks the report resolved. This can't be undone."
        confirmLabel="Delete"
        pending={isPending}
        onConfirm={() =>
          confirm?.type === "delete" &&
          run(
            () => deleteFeedbackAction(confirm.review.id, confirm.review.feedbackId),
            () => setConfirm(null)
          )
        }
        onCancel={() => setConfirm(null)}
      />

      {warnTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-neutral-900/70 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <Flag className="size-5" />
              </span>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-neutral-800">Warn {warnTarget.authorName ?? "author"}</h2>
                <p className="mt-1 text-sm text-neutral-600">
                  Recorded on their profile — not delivered to them (no notification system exists yet).
                </p>
              </div>
            </div>
            <textarea
              rows={3}
              value={warnMessage}
              onChange={(e) => setWarnMessage(e.target.value)}
              placeholder="Regarding the feedback you left..."
              className="mt-3 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setWarnTarget(null)}
                disabled={isPending}
                className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending || !warnMessage.trim()}
                onClick={() =>
                  run(
                    () => warnFeedbackAuthorAction(warnTarget.id, warnTarget.authorId, warnMessage),
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

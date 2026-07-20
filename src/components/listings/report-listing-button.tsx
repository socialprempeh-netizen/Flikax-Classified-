"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { submitReportAction } from "@/app/listings/actions";
import { withAuthRetry } from "@/lib/auth-retry";
import { REPORT_REASONS, REPORT_REASON_LABELS, type ReportReason } from "@/lib/report-reasons";

export function ReportListingButton({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function close() {
    setOpen(false);
    setReason(null);
    setError(null);
  }

  async function submit() {
    if (!reason) {
      setError("Choose a reason.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await withAuthRetry(() => submitReportAction(listingId, reason));
      setSubmitting(false);
      setDone(true);
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : "Could not submit report.");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 rounded-lg border border-red-200 py-2 text-base font-bold text-red-600 hover:bg-red-50"
      >
        <AlertTriangle className="size-4" />
        Report Abuse
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-neutral-900/70 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            {done ? (
              <>
                <h2 className="text-base font-bold text-neutral-800">Report submitted</h2>
                <p className="mt-1 text-sm text-neutral-600">
                  Thanks — our team will review this listing.
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-5 w-full rounded-lg bg-brand py-2.5 text-sm font-bold text-white hover:bg-brand-dark"
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                    <AlertTriangle className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-base font-bold text-neutral-800">Report this listing</h2>
                    <p className="mt-1 text-sm text-neutral-600">
                      Let us know what&apos;s wrong. We&apos;ll review it as soon as possible.
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {REPORT_REASONS.map((value) => (
                    <label
                      key={value}
                      className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 has-[:checked]:border-brand has-[:checked]:bg-brand-light"
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={value}
                        checked={reason === value}
                        onChange={() => setReason(value)}
                        className="accent-brand"
                      />
                      {REPORT_REASON_LABELS[value]}
                    </label>
                  ))}
                </div>

                {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={close}
                    disabled={submitting}
                    className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={submitting}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    {submitting ? "Submitting..." : "Submit report"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

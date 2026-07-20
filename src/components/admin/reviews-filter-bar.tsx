import Link from "next/link";
import { X } from "lucide-react";
import { ADMIN_FEEDBACK_REPORT_STATUS_LABELS } from "@/lib/admin-reviews";
import { FEEDBACK_REPORT_REASON_LABELS } from "@/lib/feedback-report-reasons";
import type { AdminReviewFilters } from "@/lib/admin-reviews-filters";

export function ReviewsFilterBar({ filters }: { filters: AdminReviewFilters }) {
  const hasFilters = Boolean(filters.q || filters.status || filters.reason);

  return (
    <form
      method="get"
      className="mb-4 flex flex-wrap items-end gap-3 rounded-2xl border-2 border-slate-strong bg-white p-4"
    >
      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Search
        </span>
        <input
          type="text"
          name="q"
          defaultValue={filters.q}
          placeholder="Reporter or author name"
          className="w-56 rounded-lg border-2 border-slate-strong px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Status
        </span>
        <select
          name="status"
          defaultValue={filters.status ?? ""}
          className="rounded-lg border-2 border-slate-strong px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
        >
          <option value="">All</option>
          {Object.entries(ADMIN_FEEDBACK_REPORT_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Reason
        </span>
        <select
          name="reason"
          defaultValue={filters.reason ?? ""}
          className="rounded-lg border-2 border-slate-strong px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
        >
          <option value="">All</option>
          {Object.entries(FEEDBACK_REPORT_REASON_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        className="rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark"
      >
        Apply
      </button>

      {hasFilters && (
        <Link
          href="/admin/reviews"
          className="flex items-center gap-1 pb-2.5 text-sm text-neutral-500 hover:text-brand"
        >
          <X className="size-3.5" />
          Clear
        </Link>
      )}
    </form>
  );
}

import Link from "next/link";
import { X } from "lucide-react";
import { ADMIN_TICKET_STATUS_LABELS } from "@/lib/admin-support";
import type { AdminSupportFilters } from "@/lib/admin-support-filters";

export function SupportFilterBar({ filters }: { filters: AdminSupportFilters }) {
  const hasFilters = Boolean(filters.q || filters.status);

  return (
    <form
      method="get"
      className="mb-4 flex flex-wrap items-end gap-3 rounded-2xl border border-neutral-100 bg-white p-4"
    >
      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Search
        </span>
        <input
          type="text"
          name="q"
          defaultValue={filters.q}
          placeholder="Name or email"
          className="w-56 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Status
        </span>
        <select
          name="status"
          defaultValue={filters.status ?? ""}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
        >
          <option value="">All</option>
          {Object.entries(ADMIN_TICKET_STATUS_LABELS).map(([value, label]) => (
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
          href="/admin/support"
          className="flex items-center gap-1 pb-2.5 text-sm text-neutral-500 hover:text-brand"
        >
          <X className="size-3.5" />
          Clear
        </Link>
      )}
    </form>
  );
}

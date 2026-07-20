import Link from "next/link";
import { X } from "lucide-react";
import { ADMIN_AUDIT_ACTION_LABELS } from "@/lib/admin-audit-labels";
import { ADMIN_AUDIT_TARGET_TYPE_LABELS, type AdminAuditLogFilters } from "@/lib/admin-audit-logs-filters";

export function AuditLogFilterBar({ filters }: { filters: AdminAuditLogFilters }) {
  const hasFilters = Boolean(
    filters.q || filters.action || filters.targetType || filters.dateFrom || filters.dateTo
  );

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
          placeholder="Admin name"
          className="w-52 rounded-lg border-2 border-slate-strong px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Action
        </span>
        <select
          name="action"
          defaultValue={filters.action ?? ""}
          className="rounded-lg border-2 border-slate-strong px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
        >
          <option value="">All</option>
          {Object.entries(ADMIN_AUDIT_ACTION_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Target type
        </span>
        <select
          name="targetType"
          defaultValue={filters.targetType ?? ""}
          className="rounded-lg border-2 border-slate-strong px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
        >
          <option value="">All</option>
          {Object.entries(ADMIN_AUDIT_TARGET_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
          From
        </span>
        <input
          type="date"
          name="dateFrom"
          defaultValue={filters.dateFrom}
          className="rounded-lg border-2 border-slate-strong px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
          To
        </span>
        <input
          type="date"
          name="dateTo"
          defaultValue={filters.dateTo}
          className="rounded-lg border-2 border-slate-strong px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
        />
      </label>

      <button
        type="submit"
        className="rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark"
      >
        Apply
      </button>

      {hasFilters && (
        <Link
          href="/admin/audit-logs"
          className="flex items-center gap-1 pb-2.5 text-sm text-neutral-500 hover:text-brand"
        >
          <X className="size-3.5" />
          Clear
        </Link>
      )}
    </form>
  );
}

import Link from "next/link";
import { X } from "lucide-react";
import { ADMIN_STATUS_LABELS } from "@/lib/admin-listings";
import type { AdminListingFilters } from "@/lib/admin-listing-filters";

export function ListingsFilterBar({
  filters,
  categories,
}: {
  filters: AdminListingFilters;
  categories: { id: string; name: string }[];
}) {
  const hasFilters = Boolean(
    filters.q || filters.status || filters.category || filters.location || filters.featured || filters.bumped
  );

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
          placeholder="Title or seller name"
          className="w-52 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
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
          {Object.entries(ADMIN_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
          <option value="expired">Expired</option>
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Category
        </span>
        <select
          name="category"
          defaultValue={filters.category ?? ""}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
        >
          <option value="">All</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Location
        </span>
        <input
          type="text"
          name="location"
          defaultValue={filters.location}
          placeholder="e.g. Accra"
          className="w-36 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
        />
      </label>

      <label className="flex items-center gap-1.5 pb-2.5 text-sm text-neutral-700">
        <input
          type="checkbox"
          name="featured"
          value="1"
          defaultChecked={filters.featured === "1"}
          className="size-4 accent-brand"
        />
        Featured
      </label>

      <label className="flex items-center gap-1.5 pb-2.5 text-sm text-neutral-700">
        <input
          type="checkbox"
          name="bumped"
          value="1"
          defaultChecked={filters.bumped === "1"}
          className="size-4 accent-brand"
        />
        Bumped
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Sort
        </span>
        <select
          name="sort"
          defaultValue={filters.sort ?? "newest"}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="price_high">Price: high to low</option>
          <option value="price_low">Price: low to high</option>
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
          href="/admin/listings"
          className="flex items-center gap-1 pb-2.5 text-sm text-neutral-500 hover:text-brand"
        >
          <X className="size-3.5" />
          Clear
        </Link>
      )}
    </form>
  );
}

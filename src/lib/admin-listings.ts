// Display-layer labels only — the stored status values (active, declined, sold,
// removed, pending) are unchanged in the database. "Expired" is never stored;
// it's computed the same way is_featured/featured_until already is.
export const ADMIN_STATUS_LABELS: Record<string, string> = {
  active: "Active",
  pending: "Pending review",
  declined: "Rejected",
  removed: "Hidden",
  sold: "Sold",
};

export const ADMIN_STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  declined: "bg-red-100 text-red-700",
  removed: "bg-neutral-200 text-neutral-600",
  sold: "bg-neutral-200 text-neutral-600",
};

export const ADMIN_LISTING_STATUSES = ["active", "pending", "declined", "removed", "sold"] as const;

export function isListingExpired(status: string, expiresAt: string | null): boolean {
  if (status !== "active" || !expiresAt) return false;
  return new Date(expiresAt).getTime() < Date.now();
}

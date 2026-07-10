export const ADMIN_PURCHASE_STATUSES = ["pending", "active", "cancelled", "expired"] as const;

export const ADMIN_PURCHASE_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  active: "Active",
  cancelled: "Cancelled",
  expired: "Expired",
};

export const ADMIN_PURCHASE_STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  active: "bg-green-100 text-green-700",
  cancelled: "bg-neutral-200 text-neutral-600",
  expired: "bg-red-100 text-red-700",
};

export const ADMIN_PLAN_TYPES = ["pay_per_ad", "subscription", "featured_spot", "bump_fee"] as const;

export const ADMIN_PLAN_TYPE_LABELS: Record<string, string> = {
  pay_per_ad: "Pay per ad",
  subscription: "Subscription",
  featured_spot: "Featured spot",
  bump_fee: "Bump fee",
};

/** A purchase's real status is "expired" once it's past expires_at, even though the DB row still says "active". */
export function purchaseDisplayStatus(status: string, expiresAt: string | null): string {
  if (status === "active" && expiresAt && new Date(expiresAt).getTime() < Date.now()) {
    return "expired";
  }
  return status;
}

/** A pending payment older than this with no webhook is effectively stuck/abandoned, not "in progress". */
export const STUCK_PENDING_MINUTES = 30;

export function isStuckPending(status: string, createdAt: string): boolean {
  return status === "pending" && Date.now() - new Date(createdAt).getTime() > STUCK_PENDING_MINUTES * 60 * 1000;
}

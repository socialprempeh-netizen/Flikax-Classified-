export const ADMIN_MODERATION_FLAG_TYPES = ["blurry_image", "duplicate_image", "contact_in_description"] as const;

export const ADMIN_MODERATION_FLAG_TYPE_LABELS: Record<string, string> = {
  blurry_image: "Blurry image",
  duplicate_image: "Duplicate image",
  contact_in_description: "Contact info in text",
};

export const ADMIN_MODERATION_STATUSES = ["pending", "approved", "rejected", "escalated"] as const;

export const ADMIN_MODERATION_STATUS_LABELS: Record<string, string> = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
  escalated: "Escalated",
};

export const ADMIN_MODERATION_STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  escalated: "bg-purple-100 text-purple-700",
};

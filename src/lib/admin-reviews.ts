export const ADMIN_FEEDBACK_REPORT_STATUSES = ["open", "resolved", "dismissed"] as const;

export const ADMIN_FEEDBACK_REPORT_STATUS_LABELS: Record<string, string> = {
  open: "Open",
  resolved: "Resolved",
  dismissed: "Dismissed",
};

export const ADMIN_FEEDBACK_REPORT_STATUS_STYLES: Record<string, string> = {
  open: "bg-amber-100 text-amber-700",
  resolved: "bg-green-100 text-green-700",
  dismissed: "bg-neutral-200 text-neutral-600",
};

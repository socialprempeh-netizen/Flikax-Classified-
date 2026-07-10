export const ADMIN_TICKET_STATUSES = ["open", "in_progress", "resolved"] as const;

export const ADMIN_TICKET_STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
};

export const ADMIN_TICKET_STATUS_STYLES: Record<string, string> = {
  open: "bg-amber-100 text-amber-700",
  in_progress: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
};

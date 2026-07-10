export type AdminAuditLogFilters = {
  q?: string;
  action?: string;
  targetType?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: string;
};

export function buildAdminAuditLogsHref(filters: AdminAuditLogFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.action) params.set("action", filters.action);
  if (filters.targetType) params.set("targetType", filters.targetType);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (filters.page && filters.page !== "1") params.set("page", filters.page);

  const qs = params.toString();
  return qs ? `/admin/audit-logs?${qs}` : "/admin/audit-logs";
}

export const ADMIN_AUDIT_TARGET_TYPES = [
  "listing",
  "user",
  "report",
  "moderation_flag",
  "purchase",
  "category",
  "location",
  "location_region",
  "premium_plan",
  "feature_flag",
  "site_setting",
  "feedback_report",
  "feedback",
  "support_ticket",
] as const;

export const ADMIN_AUDIT_TARGET_TYPE_LABELS: Record<string, string> = {
  listing: "Listing",
  user: "User",
  report: "Report",
  moderation_flag: "Moderation flag",
  purchase: "Purchase",
  category: "Category",
  location: "Location",
  location_region: "Region",
  premium_plan: "Premium plan",
  feature_flag: "Feature flag",
  site_setting: "Site setting",
  feedback_report: "Feedback report",
  feedback: "Feedback",
  support_ticket: "Support ticket",
};

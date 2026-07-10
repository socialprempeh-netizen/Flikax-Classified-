export type AdminModerationFilters = {
  q?: string;
  flagType?: string;
  status?: string;
  page?: string;
};

export function buildAdminModerationHref(filters: AdminModerationFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.flagType) params.set("flagType", filters.flagType);
  if (filters.status) params.set("status", filters.status);
  if (filters.page && filters.page !== "1") params.set("page", filters.page);

  const qs = params.toString();
  return qs ? `/admin/moderation?${qs}` : "/admin/moderation";
}

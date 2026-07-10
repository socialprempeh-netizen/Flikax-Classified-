export type AdminSupportFilters = {
  q?: string;
  status?: string;
  page?: string;
};

export function buildAdminSupportHref(filters: AdminSupportFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.status) params.set("status", filters.status);
  if (filters.page && filters.page !== "1") params.set("page", filters.page);

  const qs = params.toString();
  return qs ? `/admin/support?${qs}` : "/admin/support";
}

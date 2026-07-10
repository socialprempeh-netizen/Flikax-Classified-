export type AdminReviewFilters = {
  q?: string;
  status?: string;
  reason?: string;
  page?: string;
};

export function buildAdminReviewsHref(filters: AdminReviewFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.status) params.set("status", filters.status);
  if (filters.reason) params.set("reason", filters.reason);
  if (filters.page && filters.page !== "1") params.set("page", filters.page);

  const qs = params.toString();
  return qs ? `/admin/reviews?${qs}` : "/admin/reviews";
}

export type AdminPaymentFilters = {
  q?: string;
  status?: string;
  planType?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: string;
};

export function buildAdminPaymentsHref(filters: AdminPaymentFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.status) params.set("status", filters.status);
  if (filters.planType) params.set("planType", filters.planType);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (filters.page && filters.page !== "1") params.set("page", filters.page);

  const qs = params.toString();
  return qs ? `/admin/payments?${qs}` : "/admin/payments";
}

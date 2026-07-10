export type AdminListingFilters = {
  q?: string;
  status?: string;
  category?: string;
  location?: string;
  featured?: string;
  bumped?: string;
  sort?: string;
  page?: string;
};

export function buildAdminListingsHref(filters: AdminListingFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.status) params.set("status", filters.status);
  if (filters.category) params.set("category", filters.category);
  if (filters.location) params.set("location", filters.location);
  if (filters.featured) params.set("featured", filters.featured);
  if (filters.bumped) params.set("bumped", filters.bumped);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.page && filters.page !== "1") params.set("page", filters.page);

  const qs = params.toString();
  return qs ? `/admin/listings?${qs}` : "/admin/listings";
}

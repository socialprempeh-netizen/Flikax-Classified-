export const ANALYTICS_WINDOWS = ["30", "90", "365"] as const;
export type AnalyticsWindow = (typeof ANALYTICS_WINDOWS)[number];

export type AdminAnalyticsFilters = { window?: string };

export function buildAdminAnalyticsHref(filters: AdminAnalyticsFilters): string {
  const params = new URLSearchParams();
  if (filters.window && filters.window !== "30") params.set("window", filters.window);

  const qs = params.toString();
  return qs ? `/admin/analytics?${qs}` : "/admin/analytics";
}

import Link from "next/link";
import { Eye, Bookmark } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { bucketByDay, bucketSumByDay } from "@/lib/admin-analytics";
import { ANALYTICS_WINDOWS, buildAdminAnalyticsHref, type AdminAnalyticsFilters } from "@/lib/admin-analytics-filters";
import { TrendChart, RankBarChart } from "@/components/admin/dashboard-charts";

const WINDOW_LABELS: Record<string, string> = { "30": "30 days", "90": "90 days", "365": "1 year" };

type PageProps = {
  searchParams: Promise<{ window?: string }>;
};

export default async function AdminAnalyticsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const windowDays = ANALYTICS_WINDOWS.includes(params.window as (typeof ANALYTICS_WINDOWS)[number])
    ? Number(params.window)
    : 30;
  const filters: AdminAnalyticsFilters = { window: params.window };

  const supabase = await createClient();
  const sinceIso = new Date(Date.now() - windowDays * 24 * 3600 * 1000).toISOString();

  const [
    { data: listingGrowthRows },
    { data: userGrowthRows },
    { data: revenueRows },
    { data: mostViewed },
    { data: savedRows },
    { data: allListingsForSaved },
    { data: allViews },
  ] = await Promise.all([
    supabase.from("listings").select("created_at").gte("created_at", sinceIso),
    supabase.from("profiles").select("created_at").gte("created_at", sinceIso),
    supabase.from("payments").select("amount, created_at").eq("status", "success").gte("created_at", sinceIso),
    supabase.from("listings").select("id, title, views").order("views", { ascending: false }).limit(10),
    supabase.from("saved_listings").select("listing_id"),
    supabase.from("listings").select("id, title"),
    supabase.from("listings").select("views"),
  ]);

  const listingGrowth = bucketByDay(listingGrowthRows ?? [], windowDays);
  const userGrowth = bucketByDay(userGrowthRows ?? [], windowDays);
  const revenueTrend = bucketSumByDay(revenueRows ?? [], windowDays);

  const listingTitleById = new Map((allListingsForSaved ?? []).map((l) => [l.id, l.title]));
  const savedCounts = new Map<string, number>();
  for (const row of savedRows ?? []) {
    savedCounts.set(row.listing_id, (savedCounts.get(row.listing_id) ?? 0) + 1);
  }
  const mostSaved = Array.from(savedCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([listingId, count]) => ({ name: listingTitleById.get(listingId) ?? "Unknown listing", count }));

  const viewedData = (mostViewed ?? []).map((l) => ({ name: l.title, count: l.views }));
  const totalRevenue = (revenueRows ?? []).reduce((sum, r) => sum + r.amount, 0);
  const totalViews = (allViews ?? []).reduce((sum, l) => sum + l.views, 0);

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-800">Analytics</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Deeper reporting beyond the dashboard. Search-trend analytics isn&apos;t available — no search query
        logging exists in the app yet, so that&apos;s flagged as future work rather than shown here.
      </p>

      <div className="mt-4 flex gap-2">
        {ANALYTICS_WINDOWS.map((w) => (
          <Link
            key={w}
            href={buildAdminAnalyticsHref({ ...filters, window: w })}
            className={`rounded-lg border-2 px-3 py-1.5 text-sm font-medium ${
              String(windowDays) === w
                ? "border-brand bg-brand-light text-brand"
                : "border-slate-strong text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            {WINDOW_LABELS[w]}
          </Link>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border-2 border-slate-strong bg-white p-4">
        <div className="flex items-center gap-2 text-neutral-400">
          <span className="text-xs font-semibold uppercase tracking-wide">
            Revenue ({WINDOW_LABELS[String(windowDays)]})
          </span>
        </div>
        <p className="mt-2 text-2xl font-extrabold text-neutral-800">GHS {totalRevenue.toFixed(2)}</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <TrendChart data={listingGrowth} color="blue" title={`Listing growth (${WINDOW_LABELS[String(windowDays)]})`} />
        <TrendChart data={userGrowth} color="aqua" title={`User growth (${WINDOW_LABELS[String(windowDays)]})`} />
        <TrendChart
          data={revenueTrend}
          color="blue"
          title={`Revenue (${WINDOW_LABELS[String(windowDays)]})`}
          valueLabel="GHS"
        />
        <RankBarChart title="Most-viewed listings" data={viewedData} unit="views" />
        <RankBarChart title="Most-saved listings" data={mostSaved} unit="saves" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border-2 border-slate-strong bg-white p-4">
          <div className="flex items-center gap-2 text-neutral-400">
            <Eye className="size-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">Total views (all time)</span>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-neutral-800">{totalViews}</p>
        </div>
        <div className="rounded-2xl border-2 border-slate-strong bg-white p-4">
          <div className="flex items-center gap-2 text-neutral-400">
            <Bookmark className="size-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">Total saves</span>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-neutral-800">{(savedRows ?? []).length}</p>
        </div>
      </div>
    </div>
  );
}

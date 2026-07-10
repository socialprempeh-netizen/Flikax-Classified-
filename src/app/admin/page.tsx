import Link from "next/link";
import {
  Users,
  ClipboardList,
  Clock3,
  Star,
  TrendingUp,
  CheckCircle2,
  UserPlus,
  PlusCircle,
  Flag,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BUMP_BADGE_DISPLAY_HOURS } from "@/lib/premium-plans";
import { TrendChart, RankBarChart } from "@/components/admin/dashboard-charts";

const DAYS = 30;

function bucketByDay(rows: { created_at: string }[], days: number): { date: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const day = row.created_at.slice(0, 10); // YYYY-MM-DD, UTC — matches Ghana local (UTC+0, no DST)
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }

  const buckets: { date: string; count: number }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i));
    const key = d.toISOString().slice(0, 10);
    buckets.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
      count: counts.get(key) ?? 0,
    });
  }
  return buckets;
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const now = new Date();
  const nowIso = now.toISOString();
  const todayStartIso = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  ).toISOString();
  const bumpCutoffIso = new Date(now.getTime() - BUMP_BADGE_DISPLAY_HOURS * 3600 * 1000).toISOString();
  const growthSinceIso = new Date(now.getTime() - DAYS * 24 * 3600 * 1000).toISOString();

  const [
    totalUsers,
    activeListings,
    pendingListings,
    featuredListings,
    bumpedListings,
    soldListings,
    newUsersToday,
    newListingsToday,
    openReports,
    categoryCountsResult,
    categoriesResult,
    locationRowsResult,
    listingGrowthResult,
    userGrowthResult,
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .or(`expires_at.is.null,expires_at.gt.${nowIso}`),
    supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("is_featured", true)
      .or(`featured_until.is.null,featured_until.gt.${nowIso}`),
    supabase.from("listings").select("id", { count: "exact", head: true }).gt("bumped_at", bumpCutoffIso),
    supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "sold"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", todayStartIso),
    supabase.from("listings").select("id", { count: "exact", head: true }).gte("created_at", todayStartIso),
    supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "open"),
    supabase.rpc("category_counts"),
    supabase.from("categories").select("id, name"),
    supabase.from("listings").select("location").eq("status", "active"),
    supabase.from("listings").select("created_at").gte("created_at", growthSinceIso),
    supabase.from("profiles").select("created_at").gte("created_at", growthSinceIso),
  ]);

  const categoryNames = new Map((categoriesResult.data ?? []).map((c) => [c.id, c.name]));
  const topCategories = [...(categoryCountsResult.data ?? [])]
    .sort((a, b) => b.listing_count - a.listing_count)
    .slice(0, 5)
    .map((row) => ({
      name: categoryNames.get(row.category_id) ?? "Unknown",
      count: row.listing_count,
    }));

  const locationCounts: Record<string, number> = {};
  for (const row of locationRowsResult.data ?? []) {
    locationCounts[row.location] = (locationCounts[row.location] ?? 0) + 1;
  }
  const topLocations = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const listingGrowth = bucketByDay(listingGrowthResult.data ?? [], DAYS);
  const userGrowth = bucketByDay(userGrowthResult.data ?? [], DAYS);

  const stats = [
    { label: "Total users", value: totalUsers.count ?? 0, icon: Users },
    { label: "Active listings", value: activeListings.count ?? 0, icon: ClipboardList },
    { label: "Pending listings", value: pendingListings.count ?? 0, icon: Clock3 },
    { label: "Featured listings", value: featuredListings.count ?? 0, icon: Star },
    { label: "Bumped listings", value: bumpedListings.count ?? 0, icon: TrendingUp },
    { label: "Sold listings", value: soldListings.count ?? 0, icon: CheckCircle2 },
    { label: "New users today", value: newUsersToday.count ?? 0, icon: UserPlus },
    { label: "New listings today", value: newListingsToday.count ?? 0, icon: PlusCircle },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-800">Dashboard</h1>
      <p className="mt-1 text-sm text-neutral-500">Live overview of Flikax activity.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-neutral-100 bg-white p-4">
            <div className="flex items-center gap-2 text-neutral-400">
              <stat.icon className="size-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">{stat.label}</span>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-neutral-800">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/listings?status=pending"
          className="flex items-center justify-between rounded-2xl border border-neutral-100 bg-white p-5 hover:border-brand/40 hover:bg-brand-light/20"
        >
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <Clock3 className="size-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-neutral-800">Pending ads awaiting approval</p>
              <p className="text-xs text-neutral-500">Review and approve or reject</p>
            </div>
          </div>
          <span className="text-2xl font-extrabold text-neutral-800">{pendingListings.count ?? 0}</span>
        </Link>

        <Link
          href="/admin/reports"
          className="flex items-center justify-between rounded-2xl border border-neutral-100 bg-white p-5 hover:border-brand/40 hover:bg-brand-light/20"
        >
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Flag className="size-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-neutral-800">Open reports</p>
              <p className="text-xs text-neutral-500">Flagged listings to review</p>
            </div>
          </div>
          <span className="text-2xl font-extrabold text-neutral-800">{openReports.count ?? 0}</span>
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <TrendChart data={listingGrowth} color="blue" />
        <TrendChart data={userGrowth} color="aqua" />
        <RankBarChart title="Top 5 categories" data={topCategories} />
        <RankBarChart title="Top 5 locations" data={topLocations} />
      </div>
    </div>
  );
}

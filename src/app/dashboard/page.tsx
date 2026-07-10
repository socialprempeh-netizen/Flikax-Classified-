import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";
import { resolveListingImageUrl } from "@/lib/images";
import { PAYMENTS_ENABLED } from "@/lib/payments/config";
import { getEnabledPlans, LISTING_SCOPED_PLAN_TYPES } from "@/lib/premium-plans";
import { DashboardListingsList, type DashboardListingRow } from "@/components/dashboard/dashboard-listings-list";

type Tab = "active" | "declined" | "closed";

type PageProps = {
  searchParams: Promise<{ tab?: string; category?: string }>;
};

export default async function DashboardPage({ searchParams }: PageProps) {
  const { tab: rawTab, category } = await searchParams;
  const tab: Tab = rawTab === "declined" || rawTab === "closed" ? rawTab : "active";

  const supabase = await createClient();
  const {
    data: { user },
  } = await getUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard");
  }

  const [{ data: listings }, { data: categories }, allPlans, { data: profile }] = await Promise.all([
    supabase
      .from("listings")
      .select(
        "id, title, price, status, declined_reason, category_id, is_featured, featured_until, listing_images(storage_path, position)"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("id, name, slug, parent_id").order("name"),
    getEnabledPlans(),
    supabase.from("profiles").select("suspended_until").eq("id", user.id).maybeSingle(),
  ]);

  const isSuspended = Boolean(profile?.suspended_until && new Date(profile.suspended_until) > new Date());

  const listingScopedPlans = allPlans.filter((p) => LISTING_SCOPED_PLAN_TYPES.includes(p.plan_type));

  const all = listings ?? [];
  const categoryList = categories ?? [];
  const categoryById = new Map(categoryList.map((c) => [c.id, c]));
  const parentCategories = categoryList.filter((c) => c.parent_id === null);

  function matchesCategoryFilter(listing: (typeof all)[number]) {
    if (!category) return true;
    const cat = categoryById.get(listing.category_id);
    if (!cat) return false;
    if (cat.slug === category) return true;
    const parent = cat.parent_id ? categoryById.get(cat.parent_id) : undefined;
    return parent?.slug === category;
  }

  const grouped: Record<Tab, typeof all> = {
    active: all.filter((l) => l.status === "active"),
    declined: all.filter((l) => l.status === "declined"),
    closed: all.filter((l) => l.status === "sold" || l.status === "removed"),
  };

  const now = Date.now();
  const visibleListings: DashboardListingRow[] = grouped[tab].filter(matchesCategoryFilter).map((listing) => {
    const cover = [...(listing.listing_images ?? [])].sort((a, b) => a.position - b.position)[0];
    return {
      id: listing.id,
      title: listing.title,
      price: listing.price,
      status: listing.status,
      declined_reason: listing.declined_reason,
      imageUrl: cover ? resolveListingImageUrl(supabase, cover.storage_path) : null,
      isFeatured: listing.is_featured && (listing.featured_until ? new Date(listing.featured_until).getTime() > now : false),
    };
  });

  const tabs: { key: Tab; label: string }[] = [
    { key: "active", label: "Active" },
    { key: "declined", label: "Declined" },
    { key: "closed", label: "Closed" },
  ];

  function tabHref(key: Tab) {
    const params = new URLSearchParams();
    params.set("tab", key);
    if (category) params.set("category", category);
    return `/dashboard?${params.toString()}`;
  }

  return (
    <section>
      <h1 className="mb-6 border-l-4 border-brand pl-3 text-xl font-bold uppercase tracking-wide text-neutral-800">
        Manage My Listings
      </h1>

      <div className="mb-4 flex items-center gap-6 border-b border-neutral-200">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={tabHref(t.key)}
            className={`border-b-2 pb-3 text-sm font-medium ${
              tab === t.key
                ? "border-brand text-brand"
                : "border-transparent text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {t.label} ({grouped[t.key].length})
          </Link>
        ))}
      </div>

      <form action="/dashboard" method="get" className="mb-4 flex items-center gap-2">
        <input type="hidden" name="tab" value={tab} />
        <select
          name="category"
          defaultValue={category ?? ""}
          className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm text-neutral-700 outline-none focus:border-brand"
        >
          <option value="">All categories</option>
          {parentCategories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark"
        >
          Filter
        </button>
      </form>

      {isSuspended && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          Your account is suspended: you can&apos;t post new listings or buy boosts until{" "}
          {new Date(profile!.suspended_until!).toLocaleDateString()}.
        </div>
      )}

      <DashboardListingsList
        listings={visibleListings}
        paymentsEnabled={PAYMENTS_ENABLED && !isSuspended}
        plans={listingScopedPlans}
      />
    </section>
  );
}

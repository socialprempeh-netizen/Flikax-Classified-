import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { resolveListingImageUrl } from "@/lib/images";
import { isRecentlyBumped, BUMP_BADGE_DISPLAY_HOURS } from "@/lib/premium-plans";
import { isListingExpired } from "@/lib/admin-listings";
import { buildAdminListingsHref, type AdminListingFilters } from "@/lib/admin-listing-filters";
import { ListingsFilterBar } from "@/components/admin/listings-filter-bar";
import { ListingsTable, type AdminListingRow } from "@/components/admin/listings-table";

const PAGE_SIZE = 20;

type PageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    category?: string;
    location?: string;
    featured?: string;
    bumped?: string;
    sort?: string;
    page?: string;
  }>;
};

export default async function AdminListingsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters: AdminListingFilters = {
    q: params.q || undefined,
    status: params.status || undefined,
    category: params.category || undefined,
    location: params.location || undefined,
    featured: params.featured || undefined,
    bumped: params.bumped || undefined,
    sort: params.sort || undefined,
    page: params.page || undefined,
  };

  const supabase = await createClient();
  const nowIso = new Date().toISOString();
  const bumpCutoffIso = new Date(Date.now() - BUMP_BADGE_DISPLAY_HOURS * 3600 * 1000).toISOString();

  // Not awaited here — Supabase query builders are lazily thenable, so this
  // doesn't dispatch yet. It's independent of the listings query below (only
  // used later for the filter dropdown), so both fire together in the
  // Promise.all once `query` is fully built, instead of this one paying its
  // own serialized round-trip in front of everything else.
  const categoriesPromise = supabase.from("categories").select("id, name").order("name");

  let query = supabase
    .from("listings")
    .select(
      "id, title, price, status, location, category_id, is_featured, featured_until, bumped_at, expires_at, created_at, user_id, categories(name), profiles(full_name), listing_images(storage_path, position)",
      { count: "exact" }
    );

  if (filters.status) {
    if (filters.status === "expired") {
      query = query.eq("status", "active").lt("expires_at", nowIso);
    } else {
      query = query.eq("status", filters.status);
    }
  }
  if (filters.category) query = query.eq("category_id", filters.category);
  if (filters.location) query = query.ilike("location", `%${filters.location}%`);
  if (filters.featured === "1") {
    query = query.eq("is_featured", true).or(`featured_until.is.null,featured_until.gt.${nowIso}`);
  }
  if (filters.bumped === "1") {
    query = query.gt("bumped_at", bumpCutoffIso);
  }

  if (filters.q) {
    const searchTerm = `%${filters.q}%`;
    const [{ data: titleMatches }, { data: profileMatches }] = await Promise.all([
      supabase.from("listings").select("id").ilike("title", searchTerm),
      supabase.from("profiles").select("id").ilike("full_name", searchTerm),
    ]);
    const profileIds = (profileMatches ?? []).map((p) => p.id);
    let sellerListingIds: string[] = [];
    if (profileIds.length > 0) {
      const { data: sellerListings } = await supabase.from("listings").select("id").in("user_id", profileIds);
      sellerListingIds = (sellerListings ?? []).map((l) => l.id);
    }
    const matchedIds = Array.from(new Set([...(titleMatches ?? []).map((l) => l.id), ...sellerListingIds]));
    query = matchedIds.length > 0 ? query.in("id", matchedIds) : query.eq("id", "00000000-0000-0000-0000-000000000000");
  }

  switch (filters.sort) {
    case "oldest":
      query = query.order("created_at", { ascending: true });
      break;
    case "price_high":
      query = query.order("price", { ascending: false });
      break;
    case "price_low":
      query = query.order("price", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const page = Math.max(1, Number(filters.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  query = query.range(from, to);

  const [{ data: categories }, { data: listingRows, count }] = await Promise.all([categoriesPromise, query]);

  const now = Date.now();
  const listings: AdminListingRow[] = (listingRows ?? []).map((row) => {
    const cover = [...(row.listing_images ?? [])].sort((a, b) => a.position - b.position)[0];
    return {
      id: row.id,
      title: row.title,
      price: row.price,
      status: row.status,
      location: row.location,
      categoryName: row.categories?.name ?? null,
      sellerName: row.profiles?.full_name ?? null,
      imageUrl: cover ? resolveListingImageUrl(supabase, cover.storage_path) : null,
      isFeatured: row.is_featured && (!row.featured_until || new Date(row.featured_until).getTime() > now),
      isBumped: isRecentlyBumped(row.bumped_at),
      isExpired: isListingExpired(row.status, row.expires_at),
    };
  });

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-800">Listings</h1>
      <p className="mt-1 text-sm text-neutral-500">{totalCount} listing{totalCount === 1 ? "" : "s"} total.</p>

      <div className="mt-6">
        <ListingsFilterBar filters={filters} categories={categories ?? []} />
        <ListingsTable listings={listings} />

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <Link
              href={buildAdminListingsHref({ ...filters, page: String(Math.max(1, page - 1)) })}
              aria-disabled={page <= 1}
              className={`flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium ${
                page <= 1 ? "pointer-events-none text-neutral-300" : "text-neutral-700 hover:bg-neutral-50"
              }`}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Link>
            <span className="text-sm text-neutral-500">
              Page {page} of {totalPages}
            </span>
            <Link
              href={buildAdminListingsHref({ ...filters, page: String(Math.min(totalPages, page + 1)) })}
              aria-disabled={page >= totalPages}
              className={`flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium ${
                page >= totalPages ? "pointer-events-none text-neutral-300" : "text-neutral-700 hover:bg-neutral-50"
              }`}
            >
              Next
              <ChevronRight className="size-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

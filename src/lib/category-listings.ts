import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { resolveListingImageUrl } from "@/lib/images";
import { isRecentlyBumped } from "@/lib/premium-plans";
import { getListingPath } from "@/lib/listing-url";
import { formatAttributeValue } from "@/lib/format-attribute-value";
import type { ListingCard } from "@/components/listing-grid";

export const CATEGORY_PAGE_SIZE = 24;

/** Below this, a category+location combo is thin content — rendered (with a
 * friendly empty state) but kept out of the sitemap and marked noindex. */
export const MIN_INDEXABLE_LISTINGS = 3;

export type CategorySort = "recommended" | "newest" | "price_asc" | "price_desc";
export type DatePosted = "24h" | "7d" | "30d";

const DATE_POSTED_HOURS: Record<DatePosted, number> = {
  "24h": 24,
  "7d": 24 * 7,
  "30d": 24 * 30,
};

/** A sidebar attribute filter as actually applied to the query -- "select"/"text" carry
 * `value`, "range" carries `min`/`max` (either end optional). Built by the caller from
 * whichever SidebarFilterField (see category-filters.ts) the visitor filled in. */
export type AttributeFilter =
  | { key: string; kind: "select"; value: string }
  | { key: string; kind: "text"; value: string }
  | { key: string; kind: "range"; min?: number; max?: number };

type CategoryListingsFilter = {
  categoryId: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  q?: string;
  sort?: CategorySort;
  datePosted?: DatePosted;
  attributeFilters?: AttributeFilter[];
  page?: number;
};

export async function fetchCategoryListings(
  supabase: SupabaseClient<Database>,
  {
    categoryId,
    location,
    minPrice,
    maxPrice,
    q,
    sort = "recommended",
    datePosted,
    attributeFilters,
    page = 1,
  }: CategoryListingsFilter
): Promise<{ listings: ListingCard[]; totalCount: number }> {
  let query = supabase
    .from("listings")
    .select(
      "id, title, description, price, location, is_featured, featured_until, bumped_at, short_id, listing_images(storage_path, position), categories(slug)",
      { count: "exact" }
    )
    .eq("category_id", categoryId)
    .eq("status", "active");

  if (location) query = query.eq("location", location);
  if (minPrice !== undefined) query = query.gte("price", minPrice);
  if (maxPrice !== undefined) query = query.lte("price", maxPrice);
  if (datePosted) {
    const cutoff = new Date(Date.now() - DATE_POSTED_HOURS[datePosted] * 3600 * 1000).toISOString();
    query = query.gte("created_at", cutoff);
  }
  // Range fields (year, mileage, ...) are saved as JSON *strings* on `attributes`
  // (whatever the form input sent), not JSON numbers -- so both "->>' (text) and "->"
  // (jsonb-vs-jsonb, where any string ranks above every number regardless of value)
  // silently match nothing for a numeric range. The explicit ::numeric cast on the
  // text-extracted value is what actually makes ">=" mean "greater than", not
  // "sorts later as a string" or "wrong JSON type entirely".
  for (const filter of attributeFilters ?? []) {
    if (filter.kind === "select") {
      query = query.eq(`attributes->>${filter.key}`, filter.value);
    } else if (filter.kind === "text") {
      query = query.ilike(`attributes->>${filter.key}`, `%${filter.value}%`);
    } else {
      if (filter.min !== undefined) query = query.gte(`attributes->>${filter.key}::numeric`, filter.min);
      if (filter.max !== undefined) query = query.lte(`attributes->>${filter.key}::numeric`, filter.max);
    }
  }
  // A plain ilike is enough for "narrow this category by keyword" -- unlike
  // the homepage's search_listings RPC, this isn't cross-category fuzzy
  // search, just a title filter on top of a category the user already
  // picked, so it doesn't need word_similarity ranking.
  if (q) query = query.ilike("title", `%${q}%`);

  // "Recommended" keeps the featured/bumped-first ordering; the other three
  // sorts are what a user explicitly picked, so they override it entirely
  // rather than layering underneath.
  if (sort === "newest") {
    query = query.order("created_at", { ascending: false });
  } else if (sort === "price_asc") {
    query = query.order("price", { ascending: true });
  } else if (sort === "price_desc") {
    query = query.order("price", { ascending: false });
  } else {
    query = query
      .order("is_featured", { ascending: false })
      .order("bumped_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
  }

  const from = (page - 1) * CATEGORY_PAGE_SIZE;
  const { data, count } = await query.range(from, from + CATEGORY_PAGE_SIZE - 1);

  const now = Date.now();
  const listings: ListingCard[] = (data ?? []).map((row) => {
    const cover = [...(row.listing_images ?? [])].sort((a, b) => a.position - b.position)[0];
    return {
      id: row.id,
      href: getListingPath({
        title: row.title,
        location: row.location,
        short_id: row.short_id,
        categorySlug: row.categories?.slug ?? "listing",
      }),
      title: row.title,
      description: row.description,
      price: row.price,
      location: row.location,
      imageUrl: cover ? resolveListingImageUrl(supabase, cover.storage_path) : null,
      isFeatured: row.is_featured && (row.featured_until ? new Date(row.featured_until).getTime() > now : false),
      isBumped: isRecentlyBumped(row.bumped_at),
    };
  });

  return { listings, totalCount: count ?? 0 };
}

/** The N most common values of one attribute among this category's active listings
 * (e.g. "make" for vehicles), for the quick-filter icon row. Counted in JS rather than
 * a SQL GROUP BY on a JSONB path -- categories run in the hundreds of listings, not
 * enough to matter, and it avoids a bespoke RPC just for this. */
export async function getTopAttributeValues(
  supabase: SupabaseClient<Database>,
  categoryId: string,
  attributeKey: string,
  limit = 7
): Promise<{ value: string; count: number }[]> {
  const { data } = await supabase
    .from("listings")
    .select("attributes")
    .eq("category_id", categoryId)
    .eq("status", "active")
    .limit(500);

  // Grouped by the *normalized* value -- "toyota" and "Toyota", or "2026 Cadillac" and
  // "Cadillac", are the same real value with inconsistent seller-typed formatting, and
  // must merge into one count/icon rather than showing as separate near-duplicate entries.
  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const value = (row.attributes as Record<string, unknown> | null)?.[attributeKey];
    if (typeof value !== "string" || !value.trim()) continue;
    const normalized = formatAttributeValue(value);
    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([value, count]) => ({ value, count }));
}

/** Cheap head-only count, for generateMetadata's noindex decision — doesn't need row data. */
export async function countCategoryListings(
  supabase: SupabaseClient<Database>,
  categoryId: string,
  location?: string
): Promise<number> {
  let query = supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("category_id", categoryId)
    .eq("status", "active");

  if (location) query = query.eq("location", location);

  const { count } = await query;
  return count ?? 0;
}

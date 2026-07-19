import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { after } from "next/server";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import type { Metadata } from "next";
import {
  Star,
  TrendingUp,
  Eye,
  MessageSquareWarning,
  CheckCircle2,
  Sparkles,
  Settings2,
  Home as HomeIcon,
  Sofa,
  HardDrive,
  Tag,
  Layers,
  BadgeCheck,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { getUser } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { resolveListingImageUrl } from "@/lib/images";
import { isRecentlyBumped } from "@/lib/premium-plans";
import { getFieldsForCategory, HEADLINE_FIELD_KEYS } from "@/lib/listing-fields";
import {
  computeMarketPriceRange,
  MARKET_PRICE_MIN_SAMPLE,
  MARKET_PRICE_WINDOW_DAYS,
} from "@/lib/market-price";
import { formatRelativeTime } from "@/lib/format-time";
import { getListingPath, extractShortIdFromSlug } from "@/lib/listing-url";
import {
  fetchCategoryListings,
  countCategoryListings,
  CATEGORY_PAGE_SIZE,
  MIN_INDEXABLE_LISTINGS,
  type CategorySort,
  type DatePosted,
} from "@/lib/category-listings";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BottomTabBar } from "@/components/bottom-tab-bar";
import { ListingGallery } from "@/components/listings/listing-gallery";
import { SaveListingButton } from "@/components/listings/save-listing-button";
import { RevealPhoneButton } from "@/components/listings/reveal-phone-button";
import { StartChatButton } from "@/components/listings/start-chat-button";
import { ContactSellerActions } from "@/components/listings/contact-seller-actions";
import { ListingOwnerActions } from "@/components/listings/listing-owner-actions";
import { ShareButtons } from "@/components/listings/share-buttons";
import { ListingGrid, type ListingCard } from "@/components/listing-grid";
import { CategoryFilterRow } from "@/components/category-filter-row";
import { JsonLd } from "@/components/seo/json-ld";
import { TrackRecentlyViewed } from "@/components/track-recently-viewed";

// Only actually applies to the listing-detail branch of this route (the
// location-scoped listing branch reads searchParams for pagination, which
// forces it dynamic regardless of this export -- see CategoryLocationPage).
export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const SIMILAR_LIMIT = 8;
const VALID_SORTS: CategorySort[] = ["recommended", "newest", "price_asc", "price_desc"];
const VALID_DATE_POSTED: DatePosted[] = ["24h", "7d", "30d"];

const currency = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  maximumFractionDigits: 0,
});

const FIELD_ICONS: Record<string, LucideIcon> = {
  condition: Sparkles,
  transmission: Settings2,
  property_type: HomeIcon,
  furnished: Sofa,
  storage: HardDrive,
  brand: Tag,
  material: Layers,
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  sold: "Sold",
  removed: "Unavailable",
  declined: "Declined",
};

const SAFETY_TIPS = [
  "Verify seller identity for high-value items before sharing any details.",
  "Inspect vehicles and high-cost items thoroughly in daylight before finalizing payment.",
  "Do not send prepayments under any circumstances.",
  "Conduct meetings for viewing and transactions only in public, safe areas during daytime.",
  "Ensure all necessary ownership and registration documents are complete and authentic.",
];

type CategoryRow = { id: string; name: string; slug: string; parent_id: string | null };
type LocationRow = { district_name: string; district_slug: string };

type Route =
  | { kind: "location"; category: CategoryRow; location: LocationRow }
  | { kind: "listing"; shortId: number }
  | { kind: "not-found" };

type PageParams = { category: string; slug: string };
type CategoryLocationSearchParams = { page?: string; sort?: string; posted?: string };
type PageProps = { params: Promise<PageParams>; searchParams: Promise<CategoryLocationSearchParams> };

// A category slug that doesn't resolve to a real leaf category is never valid,
// regardless of what the second segment looks like — checked first so a typo'd
// category can't accidentally fall through to a coincidental short-id decode.
const resolveRoute = cache(async (categorySlug: string, slug: string): Promise<Route> => {
  const supabase = createPublicClient();

  const { data: category } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id")
    .eq("slug", categorySlug)
    .not("parent_id", "is", null)
    .maybeSingle();

  if (!category) return { kind: "not-found" };

  const { data: location } = await supabase
    .from("locations")
    .select("district_name, district_slug")
    .eq("district_slug", slug)
    .eq("enabled", true)
    .maybeSingle();

  if (location) return { kind: "location", category, location };

  const shortId = extractShortIdFromSlug(slug);
  if (shortId === null) return { kind: "not-found" };
  return { kind: "listing", shortId };
});

// cache() dedupes repeat calls within a single request; unstable_cache is
// what actually persists the result *across* requests for up to 60s, so a
// burst of views on the same listing shares one Supabase round-trip instead
// of one each. Tagged "listings" so create/update/delete actions can purge
// it immediately via revalidateTag instead of waiting out the 60s window.
const getListingByShortId = cache(async (shortId: number) => {
  return unstable_cache(
    async () => {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("listings")
        .select(
          "*, categories(id, name, slug, parent_id), listing_images(storage_path, position), profiles(full_name, phone, verified)"
        )
        .eq("short_id", shortId)
        .maybeSingle();
      return data;
    },
    ["listing-by-short-id", String(shortId)],
    { revalidate: 60, tags: ["listings"] }
  )();
});

function listingPath(listing: { title: string; location: string; short_id: number; categories: { slug: string } | null }) {
  return getListingPath({
    title: listing.title,
    location: listing.location,
    short_id: listing.short_id,
    categorySlug: listing.categories?.slug ?? "listing",
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: categorySlug, slug } = await params;
  const route = await resolveRoute(categorySlug, slug);

  if (route.kind === "not-found") return {};

  if (route.kind === "location") {
    const supabase = createPublicClient();
    const count = await countCategoryListings(supabase, route.category.id, route.location.district_name);
    const title = `${route.category.name} for Sale in ${route.location.district_name} | Flikax`;
    const description = `Browse ${route.category.name} listings in ${route.location.district_name}, Ghana on Flikax — Ghana's classifieds marketplace.`;
    return {
      title,
      description,
      alternates: { canonical: `/${categorySlug}/${slug}` },
      robots: count < MIN_INDEXABLE_LISTINGS ? { index: false, follow: true } : undefined,
    };
  }

  const listing = await getListingByShortId(route.shortId);
  if (!listing) return {};

  const supabase = createPublicClient();
  const cover = [...(listing.listing_images ?? [])].sort((a, b) => a.position - b.position)[0];
  const imageUrl = cover ? resolveListingImageUrl(supabase, cover.storage_path) : undefined;
  const title = `${listing.title} for Sale in ${listing.location} | Flikax Ghana`;
  const priceLabel = currency.format(listing.price);
  const description = listing.description
    ? `${priceLabel} in ${listing.location}. ${listing.description.slice(0, 150)}`
    : `${priceLabel} in ${listing.location}. Buy and sell on Flikax, Ghana's classifieds marketplace.`;
  const canonicalPath = listingPath(listing);

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title,
      description,
      url: canonicalPath,
      siteName: "Flikax",
      type: "website",
      images: imageUrl ? [imageUrl] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function CategoryOrListingPage({ params, searchParams }: PageProps) {
  const { category: categorySlug, slug } = await params;
  const route = await resolveRoute(categorySlug, slug);

  if (route.kind === "not-found") notFound();

  if (route.kind === "location") {
    return <CategoryLocationPage category={route.category} location={route.location} searchParams={searchParams} />;
  }

  const listing = await getListingByShortId(route.shortId);
  if (!listing) notFound();

  const canonicalPath = listingPath(listing);
  if (canonicalPath !== `/${categorySlug}/${slug}`) {
    permanentRedirect(canonicalPath);
  }

  return <ListingDetail listing={listing} />;
}

async function CategoryLocationPage({
  category,
  location,
  searchParams,
}: {
  category: CategoryRow;
  location: LocationRow;
  searchParams: Promise<CategoryLocationSearchParams>;
}) {
  const supabase = createPublicClient();
  const { page: pageParam, sort: sortParam, posted } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const sort: CategorySort = VALID_SORTS.includes(sortParam as CategorySort)
    ? (sortParam as CategorySort)
    : "recommended";
  const datePosted: DatePosted | undefined = VALID_DATE_POSTED.includes(posted as DatePosted)
    ? (posted as DatePosted)
    : undefined;

  const [parentCategory, { listings, totalCount }] = await Promise.all([
    category.parent_id
      ? supabase
          .from("categories")
          .select("name, slug")
          .eq("id", category.parent_id)
          .maybeSingle()
          .then((r) => r.data)
      : Promise.resolve(null),
    fetchCategoryListings(supabase, {
      categoryId: category.id,
      location: location.district_name,
      page,
      sort,
      datePosted,
    }),
  ]);

  const belowThreshold = totalCount < MIN_INDEXABLE_LISTINGS;
  const totalPages = Math.max(1, Math.ceil(totalCount / CATEGORY_PAGE_SIZE));

  const carryParams = new URLSearchParams();
  if (sort !== "recommended") carryParams.set("sort", sort);
  if (datePosted) carryParams.set("posted", datePosted);
  function pageHref(targetPage: number) {
    const params = new URLSearchParams(carryParams);
    params.set("page", String(targetPage));
    return `?${params.toString()}`;
  }

  const breadcrumbItems = [
    { name: "Home", item: SITE_URL },
    ...(parentCategory ? [{ name: parentCategory.name, item: `${SITE_URL}/${parentCategory.slug}` }] : []),
    { name: category.name, item: `${SITE_URL}/${category.slug}` },
    { name: location.district_name, item: `${SITE_URL}/${category.slug}/${location.district_slug}` },
  ];
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, index) => ({ "@type": "ListItem", position: index + 1, ...item })),
  };

  return (
    <div className="flex flex-1 flex-col bg-neutral-50">
      <JsonLd data={breadcrumbJsonLd} />
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center gap-1 text-sm text-neutral-500">
          <Link href="/" className="hover:text-brand">
            Home
          </Link>
          {parentCategory && (
            <>
              <span>/</span>
              <Link href={`/${parentCategory.slug}`} className="hover:text-brand">
                {parentCategory.name}
              </Link>
            </>
          )}
          <span>/</span>
          <Link href={`/${category.slug}`} className="hover:text-brand">
            {category.name}
          </Link>
          <span>/</span>
          <span className="text-neutral-700">{location.district_name}</span>
        </div>

        <h1 className="mb-6 border-l-4 border-brand pl-3 text-xl font-bold text-neutral-800">
          {category.name} for Sale in {location.district_name}
        </h1>

        {belowThreshold ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-200 bg-white py-16 text-center">
            <p className="text-sm font-medium text-neutral-600">
              No {category.name} listings in {location.district_name} yet.
            </p>
            <Link href={`/${category.slug}`} className="text-sm font-bold text-brand hover:underline">
              Browse {category.name} nationwide
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <CategoryFilterRow sort={sort} datePosted={datePosted} totalCount={totalCount} />
            </div>

            <ListingGrid listings={listings} />
            {totalPages > 1 && (
              <nav className="mt-6 flex items-center justify-center gap-3 text-sm">
                {page > 1 && (
                  <Link
                    href={pageHref(page - 1)}
                    className="rounded-lg border border-neutral-200 px-3 py-1.5 font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    Previous
                  </Link>
                )}
                <span className="text-neutral-500">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={pageHref(page + 1)}
                    className="rounded-lg border border-neutral-200 px-3 py-1.5 font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    Next
                  </Link>
                )}
              </nav>
            )}
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

type ListingRow = NonNullable<Awaited<ReturnType<typeof getListingByShortId>>>;

async function ListingDetail({ listing }: { listing: ListingRow }) {
  // Security-sensitive, and deliberately isolated: a non-active (sold/
  // removed) listing is only visible to its own owner. getUser() is only
  // called for that rare branch -- for the hot path (an active listing,
  // the overwhelming majority of views), this render never touches
  // cookies(), which is what keeps that path cache-eligible. Ownership for
  // the *active*-listing UI (Mark Unavailable, hiding "Message Seller" from
  // yourself, etc.) is resolved client-side instead -- see
  // ContactSellerActions/ListingOwnerActions.
  if (listing.status !== "active") {
    const { data: userData } = await getUser();
    if (userData.user?.id !== listing.user_id) notFound();
  }

  const supabase = createPublicClient();

  const images = [...(listing.listing_images ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((img) => resolveListingImageUrl(supabase, img.storage_path));

  const category = listing.categories;

  const [parentResult, similarSameLocationResult] = await Promise.all([
    category?.parent_id
      ? supabase.from("categories").select("name, slug").eq("id", category.parent_id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("listings")
      .select(
        "id, title, price, location, is_featured, featured_until, bumped_at, listing_images(storage_path, position), categories(slug), short_id"
      )
      .eq("category_id", listing.category_id)
      .eq("status", "active")
      .eq("location", listing.location)
      .neq("id", listing.id)
      .order("created_at", { ascending: false })
      .limit(SIMILAR_LIMIT),
  ]);

  const parentCategory = parentResult.data as { name: string; slug: string } | null;
  const topLevelSlug = parentCategory?.slug ?? category?.slug;

  const fields = getFieldsForCategory(topLevelSlug ?? undefined);
  const attributes = (listing.attributes ?? {}) as Record<string, string | string[]>;

  const specs = fields
    .filter((field) => field.type !== "tags")
    .map((field) => ({ key: field.key, label: field.label, value: attributes[field.key] as string | undefined }))
    .filter((spec) => spec.value);

  const tagSpecs = fields
    .filter((field) => field.type === "tags")
    .map((field) => ({
      key: field.key,
      label: field.label,
      values: (attributes[field.key] as string[] | undefined) ?? [],
    }))
    .filter((spec) => spec.values.length > 0);

  const headlineKeys = topLevelSlug ? (HEADLINE_FIELD_KEYS[topLevelSlug] ?? []) : [];
  const headlineSpecs = specs.filter((spec) => headlineKeys.includes(spec.key));

  const marketPriceSinceIso = new Date(
    Date.now() - MARKET_PRICE_WINDOW_DAYS * 24 * 3600 * 1000
  ).toISOString();
  let comparablePrices: number[] = [];

  const make = attributes.make as string | undefined;
  const model = attributes.model as string | undefined;
  if (topLevelSlug === "vehicles" && make && model) {
    const { data: makeModelRows } = await supabase
      .from("listings")
      .select("price")
      .eq("category_id", listing.category_id)
      .eq("status", "active")
      .neq("id", listing.id)
      .gte("created_at", marketPriceSinceIso)
      .ilike("attributes->>make", make)
      .ilike("attributes->>model", model);
    comparablePrices = (makeModelRows ?? []).map((row) => row.price);
  }

  if (comparablePrices.length < MARKET_PRICE_MIN_SAMPLE) {
    const { data: categoryRows } = await supabase
      .from("listings")
      .select("price")
      .eq("category_id", listing.category_id)
      .eq("status", "active")
      .neq("id", listing.id)
      .gte("created_at", marketPriceSinceIso);
    comparablePrices = (categoryRows ?? []).map((row) => row.price);
  }

  const marketPrice = computeMarketPriceRange(comparablePrices);

  // Ownership is no longer known server-side for an active listing (see
  // above) -- the previous "don't count the owner's own view" exclusion
  // isn't checkable here anymore. Counting it unconditionally very slightly
  // inflates a listing's own-owner view count, a materially smaller cost
  // than reintroducing a per-viewer cookies() check into this hot path.
  after(() => supabase.rpc("increment_listing_views", { listing_id: listing.id }));

  let similarRows = similarSameLocationResult.data ?? [];

  if (similarRows.length < SIMILAR_LIMIT) {
    const excludeIds = [listing.id, ...similarRows.map((r) => r.id)];
    const { data: similarAnyLocation } = await supabase
      .from("listings")
      .select(
        "id, title, price, location, is_featured, featured_until, bumped_at, listing_images(storage_path, position), categories(slug), short_id"
      )
      .eq("category_id", listing.category_id)
      .eq("status", "active")
      .not("id", "in", `(${excludeIds.join(",")})`)
      .order("created_at", { ascending: false })
      .limit(SIMILAR_LIMIT - similarRows.length);
    similarRows = [...similarRows, ...(similarAnyLocation ?? [])];
  }

  const now = Date.now();
  const similarListings: ListingCard[] = similarRows.map((row) => {
    const sortedImages = [...(row.listing_images ?? [])].sort((a, b) => a.position - b.position);
    const [cover, ...rest] = sortedImages;
    return {
      id: row.id,
      href: listingPath(row),
      title: row.title,
      price: row.price,
      location: row.location,
      imageUrl: cover ? resolveListingImageUrl(supabase, cover.storage_path) : null,
      extraImages: rest.map((img) => resolveListingImageUrl(supabase, img.storage_path)),
      isFeatured: row.is_featured && (row.featured_until ? new Date(row.featured_until).getTime() > now : false),
      isBumped: isRecentlyBumped(row.bumped_at),
    };
  });

  const isFeatured =
    listing.is_featured && (!listing.featured_until || new Date(listing.featured_until) > new Date());
  const isBumped = isRecentlyBumped(listing.bumped_at);

  const sellerName = listing.profiles?.full_name || "Flikax user";
  const sellerPhoneDigits = (listing.contact_phone || listing.profiles?.phone)?.replace(/^\+/, "");
  const sellerPhone = sellerPhoneDigits ? `+${sellerPhoneDigits}` : null;
  const feedbackHref = `mailto:feedback@flikax.com?subject=${encodeURIComponent(
    `Feedback on listing: ${listing.title}`
  )}&body=${encodeURIComponent(`Listing ID: ${listing.id}`)}`;

  const canonicalListingPath = listingPath(listing);
  const isVehicle = topLevelSlug === "vehicles";
  const brandName = isVehicle ? make : (attributes.brand as string | undefined);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": isVehicle ? "Vehicle" : "Product",
    name: listing.title,
    description: listing.description || undefined,
    image: images.length > 0 ? images : undefined,
    url: `${SITE_URL}${canonicalListingPath}`,
    ...(brandName ? { brand: { "@type": "Brand", name: brandName } } : {}),
    offers: {
      "@type": "Offer",
      price: listing.price,
      priceCurrency: "GHS",
      availability:
        listing.status === "active" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${SITE_URL}${canonicalListingPath}`,
    },
  };

  const breadcrumbItems = [
    { name: "Home", item: SITE_URL },
    ...(parentCategory ? [{ name: parentCategory.name, item: `${SITE_URL}/${parentCategory.slug}` }] : []),
    ...(category ? [{ name: category.name, item: `${SITE_URL}/${category.slug}` }] : []),
    { name: listing.title, item: `${SITE_URL}${canonicalListingPath}` },
  ];
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, index) => ({ "@type": "ListItem", position: index + 1, ...item })),
  };

  return (
    <div className="flex flex-1 flex-col bg-neutral-50 pb-16 lg:pb-0">
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center gap-1 text-sm text-neutral-500">
          <Link href="/" className="hover:text-brand">
            All ads
          </Link>
          {parentCategory && (
            <>
              <span>/</span>
              <Link href={`/${parentCategory.slug}`} className="hover:text-brand">
                {parentCategory.name}
              </Link>
            </>
          )}
          {category && (
            <>
              <span>/</span>
              <Link href={`/${category.slug}`} className="hover:text-brand">
                {category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="truncate text-neutral-700">{listing.title}</span>
        </div>

        <TrackRecentlyViewed
          id={listing.id}
          href={listingPath(listing)}
          title={listing.title}
          priceLabel={currency.format(listing.price)}
          imageUrl={images[0] ?? null}
        />

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <ListingGallery images={images} title={listing.title} />

            <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
              {(isFeatured || isBumped) && (
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {isFeatured && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
                      <Star className="size-3.5 fill-amber-500 text-amber-500" />
                      Featured
                    </span>
                  )}
                  {isBumped && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">
                      <TrendingUp className="size-3.5 text-blue-600" />
                      Bumped
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-start justify-between gap-3">
                <h1 className="text-2xl font-bold text-neutral-800">{listing.title}</h1>
                <SaveListingButton listingId={listing.id} />
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-base text-neutral-500">
                <span>{listing.location}</span>
                <span>·</span>
                <span>{formatRelativeTime(new Date(listing.created_at))}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Eye className="size-4" />
                  {listing.views} views
                </span>
              </div>

              <p className="mt-3 text-4xl font-extrabold text-brand">
                {currency.format(listing.price)}
                {listing.negotiable === "yes" && (
                  <span className="ml-2 text-base font-medium text-neutral-500">Negotiable</span>
                )}
              </p>

              {marketPrice && (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-neutral-500">
                  <BarChart3 className="size-4 text-neutral-400" />
                  Market price: {currency.format(marketPrice.low)} ~ {currency.format(marketPrice.high)}
                </p>
              )}

              {sellerPhone && (
                <div className="mt-4 flex gap-2 sm:hidden">
                  <RevealPhoneButton phone={sellerPhone} label="Show contact" variant="outline" />
                  <StartChatButton listingId={listing.id} />
                </div>
              )}

              {headlineSpecs.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-4 border-t border-neutral-100 pt-4">
                  {headlineSpecs.map((spec) => {
                    const Icon = FIELD_ICONS[spec.key] ?? Sparkles;
                    return (
                      <div key={spec.key} className="flex items-center gap-2">
                        <span className="flex size-8 items-center justify-center rounded-full bg-brand-light text-brand">
                          <Icon className="size-4" />
                        </span>
                        <span className="text-base font-medium text-neutral-700">{spec.value}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {specs.length > 0 && (
                <div className="mt-5 grid grid-cols-2 divide-y divide-neutral-100 border-t border-neutral-100 sm:grid-cols-3">
                  {specs.map((spec) => (
                    <div key={spec.key} className="py-3 pr-3">
                      <p className="text-base font-semibold text-neutral-800">{spec.value}</p>
                      <p className="text-xs uppercase tracking-wide text-neutral-400">{spec.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {tagSpecs.map((spec) => (
                <div key={spec.key} className="mt-5 border-t border-neutral-100 pt-5">
                  <h2 className="mb-2 text-base font-bold text-neutral-800">{spec.label}</h2>
                  <div className="flex flex-wrap gap-2">
                    {spec.values.map((value) => (
                      <span
                        key={value}
                        className="rounded-full bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-700"
                      >
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              {listing.description && (
                <div className="mt-5 border-t border-neutral-100 pt-5">
                  <h2 className="mb-2 text-base font-bold text-neutral-800">Description</h2>
                  <p className="whitespace-pre-wrap text-base text-neutral-600">{listing.description}</p>
                </div>
              )}

              {sellerPhone && (
                <div className="mt-5 hidden sm:block sm:w-64">
                  <RevealPhoneButton phone={sellerPhone} label="Show contact" />
                </div>
              )}

              <div className="mt-5 border-t border-neutral-100 pt-5">
                <ShareButtons title={listing.title} priceLabel={currency.format(listing.price)} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:col-span-1">
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-light text-lg font-bold text-brand">
                  {sellerName[0]?.toUpperCase() ?? "F"}
                </span>
                <div className="min-w-0">
                  <Link
                    href={`/u/${listing.user_id}`}
                    className="flex items-center gap-1 truncate text-base font-bold text-neutral-800 hover:text-brand hover:underline"
                  >
                    <span className="truncate">{sellerName}</span>
                    {listing.profiles?.verified && (
                      <BadgeCheck className="size-4 shrink-0 fill-brand text-white" aria-label="Verified seller" />
                    )}
                  </Link>
                  <p className="text-sm text-neutral-500">Seller on Flikax</p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                {sellerPhone && <RevealPhoneButton phone={sellerPhone} label="Contact Seller" />}
                <ContactSellerActions
                  listingId={listing.id}
                  sellerId={listing.user_id}
                  hasPhone={Boolean(sellerPhone)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <a
                href={feedbackHref}
                className="flex items-center justify-center gap-2 rounded-lg border border-neutral-200 py-2 text-base font-bold text-neutral-700 hover:bg-neutral-50"
              >
                <MessageSquareWarning className="size-4" />
                Leave Feedback
              </a>

              <span className="flex items-center justify-center gap-2 rounded-lg bg-green-50 py-2 text-base font-bold text-green-700">
                <CheckCircle2 className="size-4" />
                Status: {STATUS_LABELS[listing.status] ?? listing.status}
              </span>

              <ListingOwnerActions listingId={listing.id} sellerId={listing.user_id} status={listing.status} />
            </div>

            <div className="rounded-xl border border-dashed border-brand/30 bg-brand-light p-5 text-center">
              <h3 className="text-sm font-bold text-neutral-800">Post an Ad Similar to This</h3>
              <p className="mt-1 text-xs text-neutral-500">Reach thousands of buyers across Ghana.</p>
              <Link
                href="/sell"
                className="mt-3 inline-block rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark"
              >
                Post an Ad
              </Link>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-bold text-neutral-800">Safety First - Read This Before Proceeding</h3>
              <ul className="list-disc space-y-2 pl-4 marker:text-brand">
                {SAFETY_TIPS.map((tip) => (
                  <li key={tip} className="text-xs font-bold text-neutral-700">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {similarListings.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 border-l-4 border-brand pl-3 text-xl font-bold text-neutral-800">Similar Ads</h2>
            <ListingGrid listings={similarListings} />
          </section>
        )}
      </main>

      <SiteFooter />
      <BottomTabBar activeHref="" />
    </div>
  );
}

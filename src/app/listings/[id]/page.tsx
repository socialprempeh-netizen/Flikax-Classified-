import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";
import {
  MessageCircle,
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
import { createClient, getUser } from "@/lib/supabase/server";
import { resolveListingImageUrl } from "@/lib/images";
import { isRecentlyBumped } from "@/lib/premium-plans";
import { getFieldsForCategory, HEADLINE_FIELD_KEYS } from "@/lib/listing-fields";
import {
  computeMarketPriceRange,
  MARKET_PRICE_MIN_SAMPLE,
  MARKET_PRICE_WINDOW_DAYS,
} from "@/lib/market-price";
import { formatRelativeTime } from "@/lib/format-time";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ListingGallery } from "@/components/listings/listing-gallery";
import { SaveListingButton } from "@/components/listings/save-listing-button";
import { MarkUnavailableButton } from "@/components/listings/mark-unavailable-button";
import { RevealPhoneButton } from "@/components/listings/reveal-phone-button";
import { ShareButtons } from "@/components/listings/share-buttons";
import { ReportListingButton } from "@/components/listings/report-listing-button";
import { ListingGrid, type ListingCard } from "@/components/listing-grid";

const SIMILAR_LIMIT = 8;

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

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: userData }, { data: listing }] = await Promise.all([
    getUser(),
    supabase
      .from("listings")
      .select(
        "*, categories(id, name, slug, parent_id), listing_images(storage_path, position), profiles(full_name, phone, verified)"
      )
      .eq("id", id)
      .maybeSingle(),
  ]);

  if (!listing) notFound();
  const viewerId = userData.user?.id;
  const isOwner = viewerId === listing.user_id;
  if (listing.status !== "active" && !isOwner) notFound();

  const images = [...(listing.listing_images ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((img) => resolveListingImageUrl(supabase, img.storage_path));

  const category = listing.categories;

  // These three don't depend on each other's results (only on the listing
  // fetched above), so they were previously paying their round-trip latency
  // one after another for no reason — with Vercel and Supabase in different
  // regions that's ~150-200ms each, purely serialized. Promise.all collapses
  // them into one round-trip's worth of wall time instead of three.
  const [parentResult, savedResult, similarSameLocationResult] = await Promise.all([
    category?.parent_id
      ? supabase.from("categories").select("name, slug").eq("id", category.parent_id).maybeSingle()
      : Promise.resolve({ data: null }),
    viewerId
      ? supabase
          .from("saved_listings")
          .select("id")
          .eq("user_id", viewerId)
          .eq("listing_id", listing.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("listings")
      .select(
        "id, title, price, location, is_featured, featured_until, bumped_at, listing_images(storage_path, position)"
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
  const initialSaved = Boolean(savedResult.data);

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

  // Tiered comparable-listings lookup for the "Market Price" range: same
  // make+model first (vehicles only, since that's the only category with a
  // structured model field), falling back to same leaf category if that tier
  // doesn't clear the minimum sample size. Only ever a plain aggregate query
  // at this data volume — no precomputation/caching needed.
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

  // A pure side effect that the render doesn't wait on — after() defers it
  // until the response has already been sent, taking it off the critical
  // path entirely rather than just parallelizing it.
  if (!isOwner) {
    after(() => supabase.rpc("increment_listing_views", { listing_id: listing.id }));
  }

  let similarRows = similarSameLocationResult.data ?? [];

  if (similarRows.length < SIMILAR_LIMIT) {
    const excludeIds = [listing.id, ...similarRows.map((r) => r.id)];
    const { data: similarAnyLocation } = await supabase
      .from("listings")
      .select(
      "id, title, price, location, is_featured, featured_until, bumped_at, listing_images(storage_path, position)"
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
    const cover = [...(row.listing_images ?? [])].sort((a, b) => a.position - b.position)[0];
    return {
      id: row.id,
      title: row.title,
      price: row.price,
      location: row.location,
      imageUrl: cover ? resolveListingImageUrl(supabase, cover.storage_path) : null,
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
  const whatsappHref = sellerPhoneDigits ? `https://wa.me/${sellerPhoneDigits}` : null;
  const feedbackHref = `mailto:feedback@flikax.com?subject=${encodeURIComponent(
    `Feedback on listing: ${listing.title}`
  )}&body=${encodeURIComponent(`Listing ID: ${listing.id}`)}`;

  return (
    <div className="flex flex-1 flex-col bg-neutral-50">
      <SiteHeader user={userData.user} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center gap-1 text-sm text-neutral-500">
          <Link href="/" className="hover:text-brand">
            All ads
          </Link>
          {parentCategory && (
            <>
              <span>/</span>
              <Link href={`/?category=${parentCategory.slug}`} className="hover:text-brand">
                {parentCategory.name}
              </Link>
            </>
          )}
          {category && (
            <>
              <span>/</span>
              <Link href={`/?category=${category.slug}`} className="hover:text-brand">
                {category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="truncate text-neutral-700">{listing.title}</span>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <ListingGallery images={images} title={listing.title} />

            <div className="mt-6 rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
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
                <SaveListingButton listingId={listing.id} initialSaved={initialSaved} />
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
                <div className="mt-5 sm:w-64">
                  <RevealPhoneButton phone={sellerPhone} label="Show contact" />
                </div>
              )}

              <div className="mt-5 border-t border-neutral-100 pt-5">
                <ShareButtons title={listing.title} priceLabel={currency.format(listing.price)} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:col-span-1">
            <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
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

              {sellerPhone ? (
                <div className="mt-4 flex flex-col gap-2">
                  <RevealPhoneButton phone={sellerPhone} label="Contact Seller" />
                  {whatsappHref && (
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-lg border border-neutral-200 px-4 py-2.5 text-base font-bold text-neutral-700 hover:bg-neutral-50"
                    >
                      <MessageCircle className="size-4" />
                      Send Message
                    </a>
                  )}
                </div>
              ) : (
                <p className="mt-4 text-sm text-neutral-400">No contact info available.</p>
              )}
            </div>

            <div className="flex flex-col gap-2 rounded-xl border border-neutral-100 bg-white p-4 shadow-sm">
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

              {isOwner && listing.status === "active" && <MarkUnavailableButton listingId={listing.id} />}

              {!isOwner && <ReportListingButton listingId={listing.id} />}
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

            <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
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
    </div>
  );
}

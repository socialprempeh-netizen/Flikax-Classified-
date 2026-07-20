import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { resolveListingImageUrl } from "@/lib/images";
import { isRecentlyBumped } from "@/lib/premium-plans";
import { getFieldsForCategory, HEADLINE_FIELD_KEYS } from "@/lib/listing-fields";
import { ADMIN_STATUS_LABELS, ADMIN_STATUS_STYLES, isListingExpired } from "@/lib/admin-listings";
import { ListingGallery } from "@/components/listings/listing-gallery";
import { ListingDetailActions } from "@/components/admin/listing-detail-actions";

const currency = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  maximumFractionDigits: 0,
});

export default async function AdminListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: listing }, { data: categories }] = await Promise.all([
    supabase
      .from("listings")
      .select(
        "*, categories(id, name, slug, parent_id), listing_images(id, storage_path, position), profiles(full_name, phone, id)"
      )
      .eq("id", id)
      .maybeSingle(),
    supabase.from("categories").select("id, name").order("name"),
  ]);

  if (!listing) notFound();

  const images = [...(listing.listing_images ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((img) => resolveListingImageUrl(supabase, img.storage_path));

  const category = listing.categories;
  let topLevelSlug = category?.slug;
  if (category?.parent_id) {
    const { data: parent } = await supabase
      .from("categories")
      .select("slug")
      .eq("id", category.parent_id)
      .maybeSingle();
    if (parent) topLevelSlug = parent.slug;
  }

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

  const now = Date.now();
  const isFeatured =
    listing.is_featured && (!listing.featured_until || new Date(listing.featured_until).getTime() > now);
  const isBumped = isRecentlyBumped(listing.bumped_at);
  const isExpired = isListingExpired(listing.status, listing.expires_at);

  return (
    <div>
      <Link
        href="/admin/listings"
        className="mb-4 flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-brand"
      >
        <ChevronLeft className="size-4" />
        Back to listings
      </Link>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <ListingGallery images={images} title={listing.title} />

          <div className="mt-6 rounded-2xl border-2 border-slate-strong bg-white p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                  ADMIN_STATUS_STYLES[listing.status] ?? "bg-neutral-100 text-neutral-600"
                }`}
              >
                {ADMIN_STATUS_LABELS[listing.status] ?? listing.status}
              </span>
              {isExpired && (
                <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-700">
                  Expired
                </span>
              )}
              {isFeatured && (
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
                  Featured
                </span>
              )}
              {isBumped && (
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">
                  Bumped
                </span>
              )}
            </div>

            <h1 className="mt-2 text-2xl font-bold text-neutral-800">{listing.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-neutral-500">
              <span>{listing.location}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Eye className="size-4" />
                {listing.views} views
              </span>
              {listing.expires_at && (
                <>
                  <span>·</span>
                  <span>Expires {new Date(listing.expires_at).toLocaleDateString()}</span>
                </>
              )}
            </div>

            <p className="mt-3 text-3xl font-extrabold text-brand">{currency.format(listing.price)}</p>

            {listing.declined_reason && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                Decline reason: {listing.declined_reason}
              </p>
            )}

            {headlineSpecs.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-4 border-t border-neutral-100 pt-4 text-sm text-neutral-700">
                {headlineSpecs.map((spec) => (
                  <span key={spec.key} className="font-medium">
                    {spec.label}: {spec.value}
                  </span>
                ))}
              </div>
            )}

            {specs.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-neutral-100 pt-4 sm:grid-cols-3">
                {specs.map((spec) => (
                  <div key={spec.key}>
                    <p className="text-sm font-semibold text-neutral-800">{spec.value}</p>
                    <p className="text-xs uppercase tracking-wide text-neutral-400">{spec.label}</p>
                  </div>
                ))}
              </div>
            )}

            {tagSpecs.map((spec) => (
              <div key={spec.key} className="mt-4 border-t border-neutral-100 pt-4">
                <h2 className="mb-2 text-sm font-bold text-neutral-800">{spec.label}</h2>
                <div className="flex flex-wrap gap-2">
                  {spec.values.map((value) => (
                    <span
                      key={value}
                      className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700"
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {listing.description && (
              <div className="mt-4 border-t border-neutral-100 pt-4">
                <h2 className="mb-2 text-sm font-bold text-neutral-800">Description</h2>
                <p className="whitespace-pre-wrap text-sm text-neutral-600">{listing.description}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:col-span-1">
          <div className="rounded-2xl border-2 border-slate-strong bg-white p-5">
            <h2 className="text-sm font-bold text-neutral-800">Seller</h2>
            <p className="mt-2 text-sm text-neutral-700">{listing.profiles?.full_name || "Unnamed user"}</p>
            {(listing.contact_phone || listing.profiles?.phone) && (
              <p className="text-sm text-neutral-500">{listing.contact_phone || listing.profiles?.phone}</p>
            )}
            {listing.profiles?.id && (
              <Link
                href={`/admin/users/${listing.profiles.id}`}
                className="mt-2 inline-block text-sm font-medium text-brand hover:underline"
              >
                View user profile
              </Link>
            )}
          </div>

          <ListingDetailActions
            listingId={listing.id}
            status={listing.status}
            categoryId={listing.category_id}
            categories={categories ?? []}
            isFeatured={isFeatured}
            isBumped={isBumped}
          />
        </div>
      </div>
    </div>
  );
}

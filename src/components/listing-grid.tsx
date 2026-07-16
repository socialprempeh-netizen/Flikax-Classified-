import Link from "next/link";
import Image from "next/image";
import { ImageOff, Star, TrendingUp } from "lucide-react";
import { formatRelativeTime } from "@/lib/format-time";
import { CompactSaveButton } from "@/components/listings/compact-save-button";

export type ListingCard = {
  id: string;
  href: string;
  title: string;
  price: number;
  location: string;
  imageUrl: string | null;
  isFeatured?: boolean;
  isBumped?: boolean;
  negotiable?: boolean;
  createdAt?: string;
};

const currency = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  maximumFractionDigits: 0,
});

export function ListingGrid({
  listings,
  savedIds,
}: {
  listings: ListingCard[];
  /** Only pass this when the caller has actually fetched the current user's
   * saved-listing IDs -- omitting it (rather than passing an empty Set)
   * hides the save button entirely instead of risking a wrong "not saved"
   * state for listings that are, in fact, already saved. */
  savedIds?: Set<string>;
}) {
  if (listings.length === 0) {
    return (
      <section className="flex-1">
        <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-neutral-200 bg-white py-16 text-center">
          <p className="text-sm font-medium text-neutral-600">No listings match your filters.</p>
          <p className="text-sm text-neutral-400">Try a different search, category, or price range.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {listings.map((listing) => (
          <Link
            key={listing.id}
            href={listing.href}
            className="block overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm hover:shadow-md"
          >
            <div className="relative aspect-video overflow-hidden bg-brand-light text-brand/40">
              {listing.imageUrl ? (
                <Image
                  src={listing.imageUrl}
                  alt={listing.title}
                  fill
                  sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <ImageOff className="size-8" />
                </div>
              )}
              {(listing.isFeatured || listing.isBumped) && (
                <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
                  {listing.isFeatured && (
                    <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 shadow-sm">
                      <Star className="size-3 fill-amber-500 text-amber-500" />
                      Featured
                    </span>
                  )}
                  {listing.isBumped && (
                    <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 shadow-sm">
                      <TrendingUp className="size-3 text-blue-600" />
                      Bumped
                    </span>
                  )}
                </div>
              )}
              {savedIds && (
                <CompactSaveButton listingId={listing.id} initialSaved={savedIds.has(listing.id)} />
              )}
            </div>
            <div className="space-y-1 p-3">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-extrabold text-brand">{currency.format(listing.price)}</span>
                {listing.negotiable && (
                  <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500">
                    Neg.
                  </span>
                )}
              </div>
              <p className="line-clamp-2 text-sm font-semibold text-neutral-800">{listing.title}</p>
              <div className="flex items-center justify-between gap-2 pt-0.5 text-xs text-neutral-400">
                <span className="truncate">{listing.location}</span>
                {listing.createdAt && (
                  <span className="shrink-0">{formatRelativeTime(new Date(listing.createdAt))}</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

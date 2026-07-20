import Link from "next/link";
import Image from "next/image";
import { ImageOff, Star, TrendingUp } from "lucide-react";
import { formatRelativeTime } from "@/lib/format-time";
import { CompactSaveButton } from "@/components/listings/compact-save-button";

export type ListingCard = {
  id: string;
  href: string;
  title: string;
  description?: string | null;
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

// "home" is the homepage grid: a wider (more horizontal) image with a
// colored frame around it, per the brief. "default" (everywhere else --
// category/search results) gets a bigger card via fewer grid columns and a
// heavier shadow/border instead.
export function ListingGrid({
  listings,
  variant = "default",
}: {
  listings: ListingCard[];
  variant?: "default" | "home";
}) {
  if (listings.length === 0) {
    return (
      <section className="flex-1">
        <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-neutral-300 bg-white py-16 text-center">
          <p className="text-sm font-medium text-neutral-600">No listings match your filters.</p>
          <p className="text-sm text-neutral-400">Try a different search, category, or price range.</p>
        </div>
      </section>
    );
  }

  const isHome = variant === "home";

  return (
    <section className="flex-1">
      <div
        className={`grid gap-3 ${
          isHome ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" : "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3"
        }`}
      >
        {listings.map((listing) => (
          <Link
            key={listing.id}
            href={listing.href}
            className={`block overflow-hidden rounded-xl bg-white ${
              isHome
                ? "border border-neutral-300 shadow-md hover:shadow-lg"
                : "border border-neutral-400 shadow-lg hover:shadow-xl"
            }`}
          >
            <div
              className={`relative overflow-hidden bg-brand-light text-brand/40 ${
                isHome ? "aspect-[2/1] border-2 border-brand" : "aspect-video"
              }`}
            >
              {listing.imageUrl ? (
                <Image
                  src={listing.imageUrl}
                  alt={listing.title}
                  fill
                  sizes={
                    isHome
                      ? "(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
                      : "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 45vw"
                  }
                  quality={82}
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
              <CompactSaveButton listingId={listing.id} />
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
              {listing.description && (
                <p className="line-clamp-2 text-xs text-neutral-500">{listing.description}</p>
              )}
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

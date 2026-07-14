import Link from "next/link";
import Image from "next/image";
import { ImageOff, Star, TrendingUp } from "lucide-react";

export type ListingCard = {
  id: string;
  href: string;
  title: string;
  price: number;
  location: string;
  imageUrl: string | null;
  isFeatured?: boolean;
  isBumped?: boolean;
};

const currency = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  maximumFractionDigits: 0,
});

export function ListingGrid({ listings }: { listings: ListingCard[] }) {
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
            <div className="relative flex aspect-square items-center justify-center bg-brand-light text-brand/40">
              {listing.imageUrl ? (
                <Image
                  src={listing.imageUrl}
                  alt={listing.title}
                  fill
                  sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
                  className="object-cover"
                />
              ) : (
                <ImageOff className="size-8" />
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
            </div>
            <div className="space-y-1 p-3">
              <p className="truncate text-sm font-semibold text-neutral-800">{listing.title}</p>
              <p className="text-xl font-extrabold text-brand">{currency.format(listing.price)}</p>
              <p className="text-xs text-neutral-500">{listing.location}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

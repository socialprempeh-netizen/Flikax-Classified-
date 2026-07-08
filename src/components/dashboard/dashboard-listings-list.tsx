import Link from "next/link";
import { ImageOff, Star, RefreshCw } from "lucide-react";
import { deleteListingAction } from "@/app/my-adverts/actions";
import { DeleteListingButton } from "@/components/listings/delete-listing-button";
import { ListingPlanActions } from "@/components/listings/listing-plan-actions";
import type { PremiumPlan } from "@/lib/premium-plans";

const currency = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  maximumFractionDigits: 0,
});

export type DashboardListingRow = {
  id: string;
  title: string;
  price: number;
  status: string;
  declined_reason: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  declined: "bg-red-100 text-red-700",
  sold: "bg-neutral-200 text-neutral-600",
  removed: "bg-neutral-200 text-neutral-600",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  declined: "Declined",
  sold: "Sold",
  removed: "Closed",
};

export function DashboardListingsList({
  listings,
  paymentsEnabled,
  plans,
}: {
  listings: DashboardListingRow[];
  paymentsEnabled: boolean;
  plans: PremiumPlan[];
}) {
  if (listings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-200 bg-white py-16 text-center">
        <p className="text-sm font-medium text-neutral-600">No listings here yet.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-md">
      {listings.map((listing) => (
        <div key={listing.id} className="relative flex gap-4 p-4 hover:bg-brand-light/30">
          <Link
            href={`/listings/${listing.id}`}
            aria-label={listing.title}
            className="absolute inset-0 z-0"
          />
          <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-light text-brand/40">
            {listing.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={listing.imageUrl} alt={listing.title} className="size-full object-cover" />
            ) : (
              <ImageOff className="size-6" />
            )}
            {listing.status === "declined" && (
              <Link
                href={`/my-adverts/${listing.id}/edit`}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1 bg-neutral-900/60 px-1 text-center text-[10px] font-bold leading-tight text-white hover:bg-neutral-900/70"
              >
                <RefreshCw className="size-4" />
                Re-upload Photo
              </Link>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xl font-extrabold text-brand">{currency.format(listing.price)}</p>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  STATUS_STYLES[listing.status] ?? "bg-neutral-100 text-neutral-600"
                }`}
              >
                {STATUS_LABELS[listing.status] ?? listing.status}
              </span>
              {listing.isFeatured && (
                <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                  <Star className="size-3 fill-amber-500 text-amber-500" />
                  Featured
                </span>
              )}
            </div>
            <p className="mt-1 truncate text-base font-semibold text-neutral-800">{listing.title}</p>
            {listing.status === "declined" && listing.declined_reason && (
              <p className="mt-1 text-sm text-red-600">REASON: {listing.declined_reason}</p>
            )}
            <div className="relative z-10 mt-2 flex items-center gap-4">
              <Link
                href={`/my-adverts/${listing.id}/edit`}
                className="text-sm font-medium text-brand hover:underline"
              >
                Edit
              </Link>
              <form action={deleteListingAction}>
                <input type="hidden" name="id" value={listing.id} />
                <DeleteListingButton />
              </form>
            </div>
            {paymentsEnabled && listing.status === "active" && plans.length > 0 && (
              <div className="relative z-10">
                <ListingPlanActions listingId={listing.id} plans={plans} isFeatured={listing.isFeatured} />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

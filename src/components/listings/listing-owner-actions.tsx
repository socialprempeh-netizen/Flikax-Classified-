"use client";

import { MarkUnavailableButton } from "@/components/listings/mark-unavailable-button";
import { ReportListingButton } from "@/components/listings/report-listing-button";
import { useSessionSummary } from "@/lib/use-session-summary";

// Same reasoning as ContactSellerActions -- ownership is resolved
// client-side so the page's server render doesn't need a per-viewer
// cookies() check for active listings.
export function ListingOwnerActions({
  listingId,
  sellerId,
  status,
}: {
  listingId: string;
  sellerId: string;
  status: string;
}) {
  const { userId } = useSessionSummary();
  const isOwner = userId === sellerId;

  return (
    <>
      {isOwner && status === "active" && <MarkUnavailableButton listingId={listingId} />}
      {!isOwner && <ReportListingButton listingId={listingId} />}
    </>
  );
}

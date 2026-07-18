"use client";

import { StartChatButton } from "@/components/listings/start-chat-button";
import { useSessionSummary } from "@/lib/use-session-summary";

// Split into a client component (rather than a server-computed isOwner
// prop) so the listing detail page's hot path -- viewing an active listing
// -- never needs a per-viewer cookies() check, which is what keeps that
// path cache-eligible. Defaults to the non-owner view while the client
// fetch resolves, which is correct for the overwhelming majority of
// viewers; the owner sees a brief flash of "Message Seller" before it
// corrects, the same tradeoff already accepted for the header/save button.
export function ContactSellerActions({
  listingId,
  sellerId,
  hasPhone,
}: {
  listingId: string;
  sellerId: string;
  hasPhone: boolean;
}) {
  const { userId } = useSessionSummary();
  const isOwner = userId === sellerId;

  return (
    <>
      {!isOwner && <StartChatButton listingId={listingId} />}
      {!hasPhone && isOwner && <p className="text-sm text-neutral-400">No contact info available.</p>}
    </>
  );
}

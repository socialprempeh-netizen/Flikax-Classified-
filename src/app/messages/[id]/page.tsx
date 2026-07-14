import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { after } from "next/server";
import { ImageOff } from "lucide-react";
import { createClient, getUser } from "@/lib/supabase/server";
import { resolveListingImageUrl } from "@/lib/images";
import { getListingPath } from "@/lib/listing-url";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ChatThread } from "@/components/messages/chat-thread";
import { markConversationReadAction } from "@/app/messages/actions";

const currency = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  maximumFractionDigits: 0,
});

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await getUser();

  if (!user) {
    redirect(`/auth/login?redirect=/messages/${id}`);
  }

  // Both queries filter on the route id directly — messages doesn't depend on
  // the conversation lookup's result, so there's no reason to pay their
  // round-trip latency serially. RLS on `messages` already scopes rows to
  // participants regardless of query order, so firing this even for a
  // request that turns out unauthorized is a wasted query, not a security gap.
  const [{ data: conversation }, { data: messages }] = await Promise.all([
    supabase
      .from("conversations")
      .select(
        `id, buyer_id, seller_id, phone_revealed_by_buyer, phone_revealed_by_seller,
         listing:listings(id, title, price, location, status, contact_phone, short_id, listing_images(storage_path, position), categories(slug)),
         buyer:profiles!conversations_buyer_id_fkey(full_name, phone),
         seller:profiles!conversations_seller_id_fkey(full_name, phone)`
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("messages")
      .select("id, sender_id, body, created_at")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true })
      .limit(50),
  ]);

  if (!conversation || (user.id !== conversation.buyer_id && user.id !== conversation.seller_id)) {
    notFound();
  }

  // Deferred until after the response is sent, same as the listing page's view-count bump.
  after(() => markConversationReadAction(id));

  const isBuyer = user.id === conversation.buyer_id;
  const otherParty = isBuyer ? conversation.seller : conversation.buyer;
  const currentUserPhone = (isBuyer ? conversation.buyer?.phone : conversation.seller?.phone) ?? null;
  const otherPartyPhone = isBuyer
    ? conversation.listing?.contact_phone || conversation.seller?.phone || null
    : conversation.buyer?.phone || null;

  const cover = [...(conversation.listing?.listing_images ?? [])].sort((a, b) => a.position - b.position)[0];
  const coverUrl = cover ? resolveListingImageUrl(supabase, cover.storage_path) : null;

  return (
    <div className="flex flex-1 flex-col bg-neutral-50">
      <SiteHeader user={user} />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-6 sm:px-6">
        <Link
          href="/messages"
          className="w-fit text-sm font-medium text-neutral-500 hover:text-brand hover:underline"
        >
          ← Back to messages
        </Link>

        {conversation.listing && (
          <Link
            href={getListingPath({
              title: conversation.listing.title,
              location: conversation.listing.location,
              short_id: conversation.listing.short_id,
              categorySlug: conversation.listing.categories?.slug ?? "listing",
            })}
            className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-white p-3 shadow-sm hover:shadow-md"
          >
            <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-light text-brand/40">
              {coverUrl ? (
                <Image src={coverUrl} alt={conversation.listing.title} fill sizes="56px" className="object-cover" />
              ) : (
                <ImageOff className="size-5" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-neutral-800">{conversation.listing.title}</p>
              <p className="text-sm font-extrabold text-brand">{currency.format(conversation.listing.price)}</p>
              {conversation.listing.status !== "active" && (
                <p className="text-xs text-neutral-400">This listing is no longer active.</p>
              )}
            </div>
          </Link>
        )}

        <p className="text-sm font-semibold text-neutral-600">
          Chat with {otherParty?.full_name || "Flikax user"}
        </p>

        <ChatThread
          conversationId={id}
          currentUserId={user.id}
          otherPartyName={otherParty?.full_name || "Flikax user"}
          isBuyer={isBuyer}
          initialMessages={messages ?? []}
          initialPhoneRevealedByBuyer={conversation.phone_revealed_by_buyer}
          initialPhoneRevealedBySeller={conversation.phone_revealed_by_seller}
          currentUserPhone={currentUserPhone}
          otherPartyPhone={otherPartyPhone}
        />
      </main>
      <SiteFooter />
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { MessageSquare, ImageOff } from "lucide-react";
import { createClient, getUser } from "@/lib/supabase/server";
import { resolveListingImageUrl } from "@/lib/images";
import { formatRelativeTime } from "@/lib/format-time";
import { isConversationUnread } from "@/lib/messages";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await getUser();

  if (!user) {
    redirect("/auth/login?redirect=/messages");
  }

  const { data: conversations } = await supabase
    .from("conversations")
    .select(
      `id, buyer_id, seller_id, last_message_at, last_read_by_buyer_at, last_read_by_seller_at,
       listing:listings(id, title, status, listing_images(storage_path, position)),
       buyer:profiles!conversations_buyer_id_fkey(full_name),
       seller:profiles!conversations_seller_id_fkey(full_name)`
    )
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order("last_message_at", { ascending: false });

  const conversationIds = (conversations ?? []).map((c) => c.id);
  const { data: recentMessages } = conversationIds.length
    ? await supabase
        .from("messages")
        .select("conversation_id, body, created_at")
        .in("conversation_id", conversationIds)
        .order("created_at", { ascending: false })
    : { data: [] };

  const latestMessageByConversation = new Map<string, { body: string; created_at: string }>();
  for (const message of recentMessages ?? []) {
    if (!latestMessageByConversation.has(message.conversation_id)) {
      latestMessageByConversation.set(message.conversation_id, message);
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-neutral-50">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="mb-6 border-l-4 border-brand pl-3 text-xl font-bold text-neutral-800">Messages</h1>

        {!conversations || conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white py-20 text-center shadow-lg">
            <span className="flex size-14 items-center justify-center rounded-full bg-brand text-white shadow-md">
              <MessageSquare className="size-6" />
            </span>
            <p className="text-base font-semibold text-neutral-700">No messages yet</p>
            <p className="max-w-sm text-sm text-neutral-500">
              When a buyer or seller messages you about a listing, it&apos;ll show up here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {conversations.map((conversation) => {
              const isBuyer = user.id === conversation.buyer_id;
              const otherParty = isBuyer ? conversation.seller : conversation.buyer;
              const unread = isConversationUnread(conversation, user.id);
              const preview = latestMessageByConversation.get(conversation.id);
              const cover = [...(conversation.listing?.listing_images ?? [])].sort(
                (a, b) => a.position - b.position
              )[0];
              const coverUrl = cover ? resolveListingImageUrl(supabase, cover.storage_path) : null;

              return (
                <Link
                  key={conversation.id}
                  href={`/messages/${conversation.id}`}
                  className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm hover:shadow-md"
                >
                  <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-light text-brand/40">
                    {coverUrl ? (
                      <Image src={coverUrl} alt="" fill sizes="56px" quality={82} className="object-cover" />
                    ) : (
                      <ImageOff className="size-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`truncate text-sm ${unread ? "font-bold text-neutral-800" : "font-semibold text-neutral-700"}`}
                      >
                        {otherParty?.full_name || "Flikax user"}
                      </p>
                      {conversation.last_message_at && (
                        <span className="shrink-0 text-xs text-neutral-400">
                          {formatRelativeTime(new Date(conversation.last_message_at))}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-neutral-500">{conversation.listing?.title}</p>
                    <p className={`truncate text-sm ${unread ? "font-semibold text-neutral-700" : "text-neutral-400"}`}>
                      {preview?.body || "No messages yet"}
                    </p>
                  </div>
                  {unread && <span className="size-2.5 shrink-0 rounded-full bg-brand" />}
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

import { NextResponse } from "next/server";
import { createClient, getUser } from "@/lib/supabase/server";
import { getInitials } from "@/lib/avatar";
import { isConversationUnread } from "@/lib/messages";

// Reads cookies(), so this route itself is always dynamic -- that's expected
// and fine for a route handler. The point of splitting it out of SiteHeader
// is that a *page* rendering SiteHeader no longer needs to touch cookies()
// in its own render path, so the page itself stays static/ISR-eligible.
// The header fetches this client-side after the cached shell has painted.
export async function GET() {
  const { data } = await getUser();
  const user = data.user;

  if (!user) {
    return NextResponse.json({
      isLoggedIn: false,
      userId: undefined,
      avatarUrl: undefined,
      initials: undefined,
      hasUnreadMessages: false,
    });
  }

  const meta = (user.user_metadata ?? {}) as { avatar_url?: string; full_name?: string; name?: string };

  const supabase = await createClient();
  const { data: conversations } = await supabase
    .from("conversations")
    .select("buyer_id, seller_id, last_message_at, last_read_by_buyer_at, last_read_by_seller_at")
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);
  const hasUnreadMessages = (conversations ?? []).some((c) => isConversationUnread(c, user.id));

  return NextResponse.json(
    {
      isLoggedIn: true,
      userId: user.id,
      avatarUrl: meta.avatar_url,
      initials: getInitials(meta.full_name || meta.name || undefined),
      hasUnreadMessages,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

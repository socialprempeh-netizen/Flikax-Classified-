import Link from "next/link";
import { Home, Bookmark, SquarePlus, MessageSquare, User } from "lucide-react";
import { createClient, getUser } from "@/lib/supabase/server";
import { isConversationUnread } from "@/lib/messages";

const TABS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Saved", href: "/saved", icon: Bookmark },
  { label: "Sell", href: "/sell", icon: SquarePlus },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Profile", href: "/dashboard", icon: User },
] as const;

/**
 * Global mobile-only bottom nav. Self-contained (fetches its own auth/unread
 * state) rather than taking props, matching how SiteHeader already does the
 * same thing -- every page that wants it just drops in <BottomTabBar />.
 */
export async function BottomTabBar({ activeHref }: { activeHref: string }) {
  const {
    data: { user },
  } = await getUser();
  const isLoggedIn = Boolean(user);

  let hasUnreadMessages = false;
  if (user) {
    const supabase = await createClient();
    const { data: conversations } = await supabase
      .from("conversations")
      .select("buyer_id, seller_id, last_message_at, last_read_by_buyer_at, last_read_by_seller_at")
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);
    hasUnreadMessages = (conversations ?? []).some((c) => isConversationUnread(c, user.id));
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-neutral-100 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
      {TABS.map((tab) => {
        const isActive = tab.href === activeHref;
        const gated = tab.href !== "/" && tab.href !== "/sell" && !isLoggedIn;
        const href = gated ? "/auth/login" : tab.href;
        return (
          <Link
            key={tab.label}
            href={href}
            className={`relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
              isActive ? "text-brand" : "text-neutral-500"
            }`}
          >
            <tab.icon className="size-5" />
            {tab.label}
            {tab.href === "/messages" && hasUnreadMessages && (
              <span className="absolute right-1/3 top-1 size-2 rounded-full bg-red-500" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

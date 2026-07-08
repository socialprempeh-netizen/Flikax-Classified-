import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { Bookmark, MessageSquare, Bell, ClipboardList, UserRound } from "lucide-react";
import { getInitials } from "@/lib/avatar";

type HeaderUser = Pick<User, "phone" | "user_metadata">;

export function SiteHeader({ user }: { user?: HeaderUser | null }) {
  const isLoggedIn = Boolean(user);
  const meta = (user?.user_metadata ?? {}) as { avatar_url?: string; full_name?: string; name?: string };
  const displayName = meta.full_name || meta.name || undefined;
  const avatarUrl = meta.avatar_url;
  const initials = getInitials(displayName);

  const accountHref = isLoggedIn ? "/settings" : "/auth/login";
  const gatedHref = isLoggedIn ? undefined : "/auth/login";

  return (
    <header className="sticky top-0 z-50 bg-brand">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:py-4 sm:px-6">
        <Link href="/" className="font-logo text-2xl font-extrabold lowercase text-white sm:text-4xl">
          flikax
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <Link
            href={gatedHref ?? "/saved"}
            title="Saved"
            aria-label="Saved"
            className="flex size-9 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 sm:size-11"
          >
            <Bookmark className="size-4 sm:size-5" />
          </Link>

          <Link
            href={gatedHref ?? "/messages"}
            title="Messages"
            aria-label="Messages"
            className="flex size-9 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 sm:size-11"
          >
            <MessageSquare className="size-4 sm:size-5" />
          </Link>

          <Link
            href={gatedHref ?? "/notifications"}
            title="Notifications"
            aria-label="Notifications"
            className="flex size-9 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 sm:size-11"
          >
            <Bell className="size-4 sm:size-5" />
          </Link>

          <Link
            href={gatedHref ?? "/dashboard"}
            title="My Adverts"
            aria-label="My Adverts"
            className="hidden size-9 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 sm:flex sm:size-11"
          >
            <ClipboardList className="size-4 sm:size-5" />
          </Link>

          <Link
            href={accountHref}
            title="My Account"
            aria-label="My Account"
            className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-white/15 text-white hover:bg-white/25 sm:size-11"
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="size-full object-cover" />
            ) : initials ? (
              <span className="text-xs font-bold sm:text-sm">{initials}</span>
            ) : (
              <UserRound className="size-4 sm:size-5" />
            )}
          </Link>

          <Link
            href="/sell"
            className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-brand hover:bg-brand-light sm:px-5 sm:py-2 sm:text-sm"
          >
            SELL
          </Link>
        </div>
      </div>
    </header>
  );
}

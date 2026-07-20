"use client";

import Link from "next/link";
import { MessageSquare, Bell, Gem, ClipboardList, UserRound, UserPlus, Megaphone } from "lucide-react";
import { useSessionSummary } from "@/lib/use-session-summary";

// Split out of SiteHeader so the auth-dependent icons (which need cookies())
// don't force every page that renders the header into dynamic rendering --
// see useSessionSummary for the fetch/caching behavior and its tradeoff.
export function HeaderUserActions() {
  const { isLoggedIn, avatarUrl, initials, hasUnreadMessages } = useSessionSummary();

  const accountHref = isLoggedIn ? "/settings" : "/auth/login";
  const gatedHref = isLoggedIn ? undefined : "/auth/login";

  return (
    <>
      {/* Mobile: everything else lives in the hamburger drawer already, so the
          header itself only needs one action -- sign up when logged out,
          or the account avatar when logged in. Desktop keeps the full row. */}
      <div className="flex items-center gap-1.5 sm:hidden">
        {isLoggedIn ? (
          <Link
            href={accountHref}
            title="My Account"
            aria-label="My Account"
            className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-white/15 text-white hover:bg-white/25"
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="size-full object-cover" />
            ) : initials ? (
              <span className="text-xs font-bold">{initials}</span>
            ) : (
              <UserRound className="size-4" />
            )}
          </Link>
        ) : (
          <Link
            href="/auth/login"
            className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-brand hover:bg-brand-light"
          >
            <UserPlus className="size-4" />
            Sign up
          </Link>
        )}
      </div>

      <div className="hidden items-center gap-1.5 sm:flex sm:gap-3">
        <Link
          href={gatedHref ?? "/messages"}
          title="Messages"
          aria-label="Messages"
          className="relative flex size-9 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 sm:size-10"
        >
          <MessageSquare className="size-4 sm:size-5" />
          {hasUnreadMessages && (
            <span className="absolute right-1 top-1 size-2 rounded-full bg-red-500 ring-2 ring-brand" />
          )}
        </Link>

        <Link
          href={gatedHref ?? "/notifications"}
          title="Notifications"
          aria-label="Notifications"
          className="flex size-9 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 sm:size-10"
        >
          <Bell className="size-4 sm:size-5" />
        </Link>

        <Link
          href="/premium"
          title="Premium"
          aria-label="Premium"
          className="flex size-9 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 sm:size-10"
        >
          <Gem className="size-4 sm:size-5" />
        </Link>

        <Link
          href={gatedHref ?? "/dashboard"}
          title="My Adverts"
          aria-label="My Adverts"
          className="flex size-9 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 sm:size-10"
        >
          <ClipboardList className="size-4 sm:size-5" />
        </Link>

        <Link
          href={accountHref}
          title="My Account"
          aria-label="My Account"
          className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-white/15 text-white hover:bg-white/25 sm:size-10"
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
          className="flex items-center gap-1.5 rounded-full bg-orange-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-600 sm:px-5 sm:py-2 sm:text-sm"
        >
          <Megaphone className="size-3.5 sm:size-4" />
          Advertise for Free
        </Link>
      </div>
    </>
  );
}

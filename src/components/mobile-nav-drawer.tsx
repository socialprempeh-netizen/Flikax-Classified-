"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  Bookmark,
  MessageSquare,
  ClipboardList,
  Gem,
  Settings,
  LifeBuoy,
  LogIn,
} from "lucide-react";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { LogoutButton } from "@/components/auth/logout-button";
import type { Category } from "@/components/category-sidebar";

const ACCOUNT_LINKS = [
  { label: "Saved", href: "/saved", icon: Bookmark },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "My Ads", href: "/dashboard", icon: ClipboardList },
  { label: "Premium Plans", href: "/premium", icon: Gem },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Help & Support", href: "/contact", icon: LifeBuoy },
];

export function MobileNavDrawer({
  categories,
  isLoggedIn,
  hasUnreadMessages,
}: {
  categories: Category[];
  isLoggedIn: boolean;
  hasUnreadMessages: boolean;
}) {
  const [open, setOpen] = useState(false);
  const parents = categories.filter((c) => c.parent_id === null);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className="flex size-9 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 sm:size-11 lg:hidden"
        >
          <Menu className="size-4.5 sm:size-5" />
        </button>
      </SheetTrigger>

      <SheetContent side="left" className="lg:hidden">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <p className="mb-2 mt-2 text-xs font-bold uppercase tracking-wide text-neutral-400">
            Categories
          </p>
          <nav className="mb-4 flex flex-col">
            {parents.map((cat) => (
              <SheetClose asChild key={cat.id}>
                <Link
                  href={`/${cat.slug}`}
                  className="rounded-lg px-2 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  {cat.name}
                </Link>
              </SheetClose>
            ))}
          </nav>

          <div className="border-t border-neutral-100 pt-3">
            <nav className="flex flex-col">
              {ACCOUNT_LINKS.map((item) => (
                <SheetClose asChild key={item.href}>
                  <Link
                    href={isLoggedIn ? item.href : "/auth/login"}
                    className="relative flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    <item.icon className="size-4.5 shrink-0 text-neutral-400" />
                    {item.label}
                    {item.href === "/messages" && hasUnreadMessages && (
                      <span className="size-2 rounded-full bg-red-500" />
                    )}
                  </Link>
                </SheetClose>
              ))}
            </nav>
          </div>

          <div className="mt-3 border-t border-neutral-100 pt-3">
            {isLoggedIn ? (
              <LogoutButton className="w-full rounded-lg px-2 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50" />
            ) : (
              <SheetClose asChild>
                <Link
                  href="/auth/login"
                  className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-brand hover:bg-brand-light"
                >
                  <LogIn className="size-4.5 shrink-0" />
                  Log in
                </Link>
              </SheetClose>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

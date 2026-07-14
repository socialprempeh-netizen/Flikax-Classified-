"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Handshake,
  MessageSquare,
  ShieldCheck,
  BellRing,
  Star,
  TrendingUp,
  Wallet,
  Gift,
  ShieldAlert,
  Lock,
  Gem,
  type LucideIcon,
} from "lucide-react";
import { getInitials } from "@/lib/avatar";

const MENU_ITEMS: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Listings", href: "/dashboard", icon: ClipboardList },
  { label: "Premium", href: "/premium", icon: Gem },
  { label: "Active Offers", href: "/dashboard/offers", icon: Handshake },
  { label: "Messaging", href: "/messages", icon: MessageSquare },
  { label: "Verified User Badge", href: "/dashboard/verified-badge", icon: ShieldCheck },
  { label: "Saved Search Alerts", href: "/dashboard/saved-alerts", icon: BellRing },
  { label: "Feedback & Ratings", href: "/dashboard/feedback", icon: Star },
  { label: "Performance Insights", href: "/dashboard/insights", icon: TrendingUp },
  { label: "GHC Balance", href: "/dashboard/balance", icon: Wallet },
  { label: "Referral Program", href: "/dashboard/referral", icon: Gift },
  { label: "Safety Centre", href: "/dashboard/safety", icon: ShieldAlert },
  { label: "Privacy Policy", href: "/privacy", icon: Lock },
];

export function DashboardSidebar({
  fullName,
  phone,
  avatarUrl,
  declinedCount,
}: {
  fullName: string | null;
  phone: string | null;
  avatarUrl?: string | null;
  declinedCount: number;
}) {
  const pathname = usePathname();
  const initials = getInitials(fullName);

  return (
    <div className="flex w-full shrink-0 flex-col gap-4 sm:w-72">
      <div className="flex flex-col items-center gap-2 rounded-xl border-t-4 border-brand bg-white p-5 text-center shadow-lg">
        <span className="flex size-16 items-center justify-center overflow-hidden rounded-full bg-brand text-xl font-bold text-white ring-4 ring-brand-light">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="size-full object-cover" />
          ) : (
            initials || fullName?.[0]?.toUpperCase() || "F"
          )}
        </span>
        <p className="text-base font-bold text-neutral-800">{fullName || "Flikax user"}</p>
        {phone && <p className="text-sm text-neutral-500">{phone}</p>}
      </div>

      {declinedCount > 0 && (
        <div className="rounded-xl bg-amber-500 p-4 shadow-lg">
          <p className="text-sm font-semibold text-white">
            {declinedCount} of your ad{declinedCount > 1 ? "s were" : " was"} declined
          </p>
          <Link
            href="/dashboard?tab=declined"
            className="mt-1 inline-block text-sm font-bold text-white underline underline-offset-2 hover:text-amber-100"
          >
            VIEW DETAILS
          </Link>
        </div>
      )}

      <nav className="flex flex-col overflow-hidden rounded-xl bg-white shadow-lg">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 border-b border-neutral-50 px-4 py-3 text-sm font-medium last:border-b-0 ${
                isActive ? "bg-brand text-white" : "text-neutral-700 hover:bg-brand-light hover:text-brand"
              }`}
            >
              <item.icon className="size-4.5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";

const NAV_GROUPS: { label: string; href: string; badge?: string }[][] = [
  [
    { label: "Personal details", href: "/settings" },
    { label: "Business details", href: "/settings/business" },
    { label: '"Verified ID" badge', href: "/settings/verified" },
  ],
  [
    { label: "Change phone number", href: "/settings/phone" },
    { label: "Change email", href: "/settings/email" },
  ],
  [
    { label: "Automatic ad sharing", href: "/settings/ad-sharing", badge: "New!" },
    { label: "Disable chats", href: "/settings/disable-chats" },
    { label: "Disable Feedback", href: "/settings/disable-feedback" },
    { label: "Manage notifications", href: "/settings/notifications" },
  ],
  [
    { label: "Change password", href: "/settings/password" },
    { label: "Delete my account permanently", href: "/settings/delete" },
  ],
];

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex w-full shrink-0 flex-col gap-4 sm:w-72">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-neutral-800 shadow-lg hover:text-brand"
      >
        <ChevronLeft className="size-4" />
        Settings
      </Link>

      <nav className="flex flex-col overflow-hidden rounded-xl bg-white shadow-lg">
        {NAV_GROUPS.map((group, i) => (
          <div key={i} className={i > 0 ? "border-t border-neutral-100" : undefined}>
            {group.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between gap-2 px-4 py-3 text-sm font-medium ${
                    isActive ? "bg-brand text-white" : "text-neutral-700 hover:bg-brand-light hover:text-brand"
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                  <span className="flex shrink-0 items-center gap-2">
                    {item.badge && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className={`size-4 ${isActive ? "text-white" : "text-neutral-300"}`} />
                  </span>
                </Link>
              );
            })}
          </div>
        ))}
        <div className="border-t border-neutral-100">
          <LogoutButton className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50" />
        </div>
      </nav>
    </div>
  );
}

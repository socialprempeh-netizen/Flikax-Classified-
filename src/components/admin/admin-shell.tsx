"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  BarChart3,
  ToggleLeft,
  ShieldCheck,
  Gem,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import type { AdminRole } from "@/lib/admin-auth";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  comingSoon?: boolean;
  superAdminOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Listings", href: "/admin/listings", icon: ClipboardList, comingSoon: true },
  { label: "Users", href: "/admin/users", icon: Users, comingSoon: true },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3, comingSoon: true },
  { label: "Admins", href: "/admin/admins", icon: ShieldCheck, superAdminOnly: true },
  { label: "Premium Plans", href: "/admin/premium-plans", icon: Gem, superAdminOnly: true },
  { label: "Feature Flags", href: "/admin/settings", icon: ToggleLeft, superAdminOnly: true },
];

function useBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean); // e.g. ["admin", "settings"]

  return segments.map((segment, i) => ({
    label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));
}

export function AdminShell({
  adminName,
  role,
  children,
}: {
  adminName: string | null;
  role: AdminRole;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const crumbs = useBreadcrumbs();

  // Super-admin-only items are hidden outright for a plain admin, not just
  // disabled — they have no access at all, unlike the "coming soon" modules
  // nobody can reach yet. The layout guard is the real enforcement; this is
  // just so a plain admin never sees a link that immediately bounces them.
  const navItems = NAV_ITEMS.filter((item) => !item.superAdminOnly || role === "super_admin");

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <aside
        className={`flex shrink-0 flex-col border-r border-neutral-200 bg-neutral-900 text-white transition-all ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-white/10 px-3">
          {!collapsed && <span className="text-sm font-extrabold tracking-wide">FLIKAX ADMIN</span>}
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex size-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
          >
            {collapsed ? <PanelLeftOpen className="size-4.5" /> : <PanelLeftClose className="size-4.5" />}
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            if (item.comingSoon) {
              return (
                <span
                  key={item.label}
                  title="Coming soon"
                  className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/30"
                >
                  <item.icon className="size-4.5 shrink-0" />
                  {!collapsed && (
                    <span className="flex flex-1 items-center justify-between">
                      {item.label}
                      <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                        Soon
                      </span>
                    </span>
                  )}
                </span>
              );
            }
            return (
              <Link
                key={item.label}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive ? "bg-brand text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon className="size-4.5 shrink-0" />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-4 sm:px-6">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-neutral-500">
            {crumbs.map((crumb, i) => (
              <span key={crumb.href} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="size-3.5 text-neutral-300" />}
                {crumb.isLast ? (
                  <span className="font-semibold text-neutral-800">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="hover:text-brand">
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              {role === "super_admin" ? "Super Admin" : "Admin"}
            </span>
            <span className="text-sm text-neutral-600">{adminName || "Admin"}</span>
            <LogoutButton className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50" />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

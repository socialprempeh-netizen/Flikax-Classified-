import Link from "next/link";
import { getCategories } from "@/lib/categories";
import { MobileNavDrawer } from "@/components/mobile-nav-drawer";
import { HeaderUserActions } from "@/components/header-user-actions";
import type { Category } from "@/components/category-sidebar";

// `categories` is optional so most call sites keep working unchanged (they
// don't otherwise need it, and this component fetching it itself is no
// extra cost for them). The three ISR pages (homepage, category, listing
// detail) pass it explicitly, since they already fetch it for their own
// sidebar/nav anyway -- doing so means SiteHeader makes *zero* Supabase/
// cookies() calls in their render path, which is what keeps those specific
// pages static/ISR-eligible. Auth state (login status, unread badge, avatar)
// is no longer fetched here at all -- see HeaderUserActions/useSessionSummary
// for why that moved to a client-side fetch instead of a prop.
export async function SiteHeader({ categories: categoriesProp }: { categories?: Category[] }) {
  const categories = categoriesProp ?? (await getCategories());

  return (
    <header className="sticky top-0 z-50 border-b border-white/25 bg-brand">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-2 sm:gap-4 sm:py-2.5 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <MobileNavDrawer categories={categories} />
          <Link href="/" className="font-logo text-2xl font-extrabold lowercase text-white sm:text-3xl">
            flikax
          </Link>
        </div>

        <nav className="hidden items-center gap-6 text-sm font-semibold text-white lg:flex">
          <Link href="/" className="hover:text-white/80">
            Browse
          </Link>
          <Link href="/?category=vehicles" className="hover:text-white/80">
            Vehicles
          </Link>
          <Link href="/?category=property" className="hover:text-white/80">
            Property
          </Link>
        </nav>

        <HeaderUserActions />
      </div>
    </header>
  );
}

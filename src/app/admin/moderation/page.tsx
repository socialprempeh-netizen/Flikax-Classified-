import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { buildAdminModerationHref, type AdminModerationFilters } from "@/lib/admin-moderation-filters";
import { ModerationFilterBar } from "@/components/admin/moderation-filter-bar";
import { ModerationTable, type AdminModerationRow } from "@/components/admin/moderation-table";

const PAGE_SIZE = 20;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type PageProps = {
  searchParams: Promise<{
    q?: string;
    flagType?: string;
    status?: string;
    page?: string;
  }>;
};

export default async function AdminModerationPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters: AdminModerationFilters = {
    q: params.q || undefined,
    flagType: params.flagType || undefined,
    status: params.status || undefined,
    page: params.page || undefined,
  };

  const supabase = await createClient();

  let query = supabase
    .from("listing_moderation_flags")
    .select(
      "id, flag_type, detail, status, created_at, listings!listing_moderation_flags_listing_id_fkey(id, title, user_id, profiles(full_name))",
      { count: "exact" }
    );

  if (filters.flagType) query = query.eq("flag_type", filters.flagType);
  if (filters.status) query = query.eq("status", filters.status);

  if (filters.q) {
    const searchTerm = `%${filters.q}%`;
    const [{ data: titleMatches }, { data: profileMatches }] = await Promise.all([
      supabase.from("listings").select("id").ilike("title", searchTerm),
      supabase.from("profiles").select("id").ilike("full_name", searchTerm),
    ]);
    const profileIds = (profileMatches ?? []).map((p) => p.id);
    let sellerListingIds: string[] = [];
    if (profileIds.length > 0) {
      const { data: sellerListings } = await supabase.from("listings").select("id").in("user_id", profileIds);
      sellerListingIds = (sellerListings ?? []).map((l) => l.id);
    }
    const matchedListingIds = Array.from(
      new Set([...(titleMatches ?? []).map((l) => l.id), ...sellerListingIds])
    );
    query =
      matchedListingIds.length > 0
        ? query.in("listing_id", matchedListingIds)
        : query.eq("listing_id", "00000000-0000-0000-0000-000000000000");
  }

  query = query.order("created_at", { ascending: false });

  const page = Math.max(1, Number(filters.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  query = query.range(from, to);

  const { data: flagRows, count } = await query;

  const duplicateListingIds = Array.from(
    new Set(
      (flagRows ?? [])
        .filter((row) => row.flag_type === "duplicate_image" && row.detail && UUID_RE.test(row.detail))
        .map((row) => row.detail as string)
    )
  );
  const duplicateTitles = new Map<string, string>();
  if (duplicateListingIds.length > 0) {
    const { data: dupListings } = await supabase.from("listings").select("id, title").in("id", duplicateListingIds);
    for (const l of dupListings ?? []) duplicateTitles.set(l.id, l.title);
  }

  const flags: AdminModerationRow[] = (flagRows ?? [])
    .filter((row) => row.listings)
    .map((row) => {
      const duplicateOfListingId =
        row.flag_type === "duplicate_image" && row.detail && UUID_RE.test(row.detail) ? row.detail : null;
      return {
        id: row.id,
        flagType: row.flag_type,
        detail: row.detail,
        status: row.status,
        createdAt: row.created_at,
        listingId: row.listings!.id,
        listingTitle: row.listings!.title,
        sellerName: row.listings!.profiles?.full_name ?? null,
        duplicateOfListingId,
        duplicateOfListingTitle: duplicateOfListingId ? duplicateTitles.get(duplicateOfListingId) ?? null : null,
      };
    });

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-800">Moderation Queue</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {totalCount} flagged listing{totalCount === 1 ? "" : "s"} total. Automatically flagged for blurry
        photos, duplicate photos across sellers, and contact info typed into the title or description.
        Category-mismatch detection isn&apos;t built yet — flagged as future work.
      </p>

      <div className="mt-6">
        <ModerationFilterBar filters={filters} />
        <ModerationTable flags={flags} />

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <Link
              href={buildAdminModerationHref({ ...filters, page: String(Math.max(1, page - 1)) })}
              aria-disabled={page <= 1}
              className={`flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium ${
                page <= 1 ? "pointer-events-none text-neutral-300" : "text-neutral-700 hover:bg-neutral-50"
              }`}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Link>
            <span className="text-sm text-neutral-500">
              Page {page} of {totalPages}
            </span>
            <Link
              href={buildAdminModerationHref({ ...filters, page: String(Math.min(totalPages, page + 1)) })}
              aria-disabled={page >= totalPages}
              className={`flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium ${
                page >= totalPages ? "pointer-events-none text-neutral-300" : "text-neutral-700 hover:bg-neutral-50"
              }`}
            >
              Next
              <ChevronRight className="size-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

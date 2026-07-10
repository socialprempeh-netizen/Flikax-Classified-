import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { buildAdminReviewsHref, type AdminReviewFilters } from "@/lib/admin-reviews-filters";
import { ReviewsFilterBar } from "@/components/admin/reviews-filter-bar";
import { ReviewsTable, type AdminReviewRow } from "@/components/admin/reviews-table";

const PAGE_SIZE = 20;

type PageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    reason?: string;
    page?: string;
  }>;
};

export default async function AdminReviewsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters: AdminReviewFilters = {
    q: params.q || undefined,
    status: params.status || undefined,
    reason: params.reason || undefined,
    page: params.page || undefined,
  };

  const supabase = await createClient();

  let query = supabase
    .from("feedback_reports")
    .select(
      "id, reason, status, created_at, reporter:profiles!feedback_reports_reporter_id_fkey(full_name), profile_feedback!feedback_reports_feedback_id_fkey(id, sentiment, message, author_id, profile_id, author:profiles!profile_feedback_author_id_fkey(full_name), target:profiles!profile_feedback_profile_id_fkey(full_name))",
      { count: "exact" }
    );

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.reason) query = query.eq("reason", filters.reason);

  if (filters.q) {
    const searchTerm = `%${filters.q}%`;
    const { data: profileMatches } = await supabase.from("profiles").select("id").ilike("full_name", searchTerm);
    const matchedIds = (profileMatches ?? []).map((p) => p.id);
    if (matchedIds.length > 0) {
      const [{ data: byReporter }, { data: byAuthorFeedback }] = await Promise.all([
        supabase.from("feedback_reports").select("id").in("reporter_id", matchedIds),
        supabase.from("profile_feedback").select("id").in("author_id", matchedIds),
      ]);
      const feedbackIds = (byAuthorFeedback ?? []).map((f) => f.id);
      let byAuthorReportIds: string[] = [];
      if (feedbackIds.length > 0) {
        const { data: byAuthor } = await supabase.from("feedback_reports").select("id").in("feedback_id", feedbackIds);
        byAuthorReportIds = (byAuthor ?? []).map((r) => r.id);
      }
      const matchedReportIds = Array.from(new Set([...(byReporter ?? []).map((r) => r.id), ...byAuthorReportIds]));
      query = matchedReportIds.length > 0 ? query.in("id", matchedReportIds) : query.eq("id", "00000000-0000-0000-0000-000000000000");
    } else {
      query = query.eq("id", "00000000-0000-0000-0000-000000000000");
    }
  }

  query = query.order("created_at", { ascending: false });

  const page = Math.max(1, Number(filters.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  query = query.range(from, to);

  const { data: reviewRows, count } = await query;

  const reviews: AdminReviewRow[] = (reviewRows ?? [])
    .filter((row) => row.profile_feedback)
    .map((row) => ({
      id: row.id,
      reason: row.reason,
      status: row.status,
      createdAt: row.created_at,
      reporterName: row.reporter?.full_name ?? null,
      feedbackId: row.profile_feedback!.id,
      sentiment: row.profile_feedback!.sentiment,
      message: row.profile_feedback!.message,
      authorId: row.profile_feedback!.author_id,
      authorName: row.profile_feedback!.author?.full_name ?? null,
      targetProfileId: row.profile_feedback!.profile_id,
      targetProfileName: row.profile_feedback!.target?.full_name ?? null,
    }));

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-800">Reviews &amp; Ratings</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {totalCount} reported feedback item{totalCount === 1 ? "" : "s"} total.
      </p>

      <div className="mt-6">
        <ReviewsFilterBar filters={filters} />
        <ReviewsTable reviews={reviews} />

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <Link
              href={buildAdminReviewsHref({ ...filters, page: String(Math.max(1, page - 1)) })}
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
              href={buildAdminReviewsHref({ ...filters, page: String(Math.min(totalPages, page + 1)) })}
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

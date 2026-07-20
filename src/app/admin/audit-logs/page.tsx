import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { requireSuperAdmin } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { buildAdminAuditLogsHref, type AdminAuditLogFilters } from "@/lib/admin-audit-logs-filters";
import { AuditLogFilterBar } from "@/components/admin/audit-log-filter-bar";
import { AuditLogTable, type AdminAuditLogRow } from "@/components/admin/audit-log-table";

const PAGE_SIZE = 30;

type PageProps = {
  searchParams: Promise<{
    q?: string;
    action?: string;
    targetType?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: string;
  }>;
};

export default async function AdminAuditLogsPage({ searchParams }: PageProps) {
  await requireSuperAdmin();

  const params = await searchParams;
  const filters: AdminAuditLogFilters = {
    q: params.q || undefined,
    action: params.action || undefined,
    targetType: params.targetType || undefined,
    dateFrom: params.dateFrom || undefined,
    dateTo: params.dateTo || undefined,
    page: params.page || undefined,
  };

  const supabase = await createClient();

  let query = supabase
    .from("admin_audit_log")
    .select("id, action, target_type, target_id, detail, created_at, actor:profiles!admin_audit_log_actor_id_fkey(full_name)", {
      count: "exact",
    });

  if (filters.action) query = query.eq("action", filters.action);
  if (filters.targetType) query = query.eq("target_type", filters.targetType);
  if (filters.dateFrom) query = query.gte("created_at", filters.dateFrom);
  if (filters.dateTo) query = query.lte("created_at", `${filters.dateTo}T23:59:59`);

  if (filters.q) {
    const { data: profileMatches } = await supabase
      .from("profiles")
      .select("id")
      .ilike("full_name", `%${filters.q}%`);
    const matchedIds = (profileMatches ?? []).map((p) => p.id);
    query = matchedIds.length > 0 ? query.in("actor_id", matchedIds) : query.eq("actor_id", "00000000-0000-0000-0000-000000000000");
  }

  query = query.order("created_at", { ascending: false });

  const page = Math.max(1, Number(filters.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  query = query.range(from, to);

  const { data: rows, count } = await query;

  const entries: AdminAuditLogRow[] = (rows ?? []).map((row) => ({
    id: row.id,
    action: row.action,
    targetType: row.target_type,
    targetId: row.target_id,
    detail: row.detail as Record<string, unknown> | null,
    createdAt: row.created_at,
    actorName: row.actor?.full_name ?? null,
  }));

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-800">Audit Logs</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {totalCount} logged action{totalCount === 1 ? "" : "s"} total. Read-only record of every admin
        mutation across the app.
      </p>

      <div className="mt-6">
        <AuditLogFilterBar filters={filters} />
        <AuditLogTable entries={entries} />

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <Link
              href={buildAdminAuditLogsHref({ ...filters, page: String(Math.max(1, page - 1)) })}
              aria-disabled={page <= 1}
              className={`flex items-center gap-1 rounded-lg border-2 border-slate-strong px-3 py-1.5 text-sm font-medium ${
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
              href={buildAdminAuditLogsHref({ ...filters, page: String(Math.min(totalPages, page + 1)) })}
              aria-disabled={page >= totalPages}
              className={`flex items-center gap-1 rounded-lg border-2 border-slate-strong px-3 py-1.5 text-sm font-medium ${
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

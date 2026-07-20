import { ADMIN_AUDIT_ACTION_LABELS } from "@/lib/admin-audit-labels";
import { ADMIN_AUDIT_TARGET_TYPE_LABELS } from "@/lib/admin-audit-logs-filters";

export type AdminAuditLogRow = {
  id: string;
  action: string;
  targetType: string;
  targetId: string | null;
  detail: Record<string, unknown> | null;
  createdAt: string;
  actorName: string | null;
};

export function AuditLogTable({ entries }: { entries: AdminAuditLogRow[] }) {
  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-strong bg-white py-16 text-center text-sm text-neutral-400">
        No audit log entries match these filters.
      </div>
    );
  }

  return (
    <div className="divide-y divide-neutral-100 overflow-hidden rounded-2xl border-2 border-slate-strong bg-white">
      {entries.map((entry) => (
        <div key={entry.id} className="flex items-start gap-3 p-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-neutral-800">
                {ADMIN_AUDIT_ACTION_LABELS[entry.action] ?? entry.action}
              </span>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-bold text-neutral-600">
                {ADMIN_AUDIT_TARGET_TYPE_LABELS[entry.targetType] ?? entry.targetType}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-neutral-500">
              By {entry.actorName ?? "Unknown"} · {new Date(entry.createdAt).toLocaleString()}
            </p>
            {entry.targetId && <p className="mt-0.5 text-xs text-neutral-400">Target: {entry.targetId}</p>}
            {entry.detail && Object.keys(entry.detail).length > 0 && (
              <p className="mt-0.5 truncate text-xs text-neutral-400">{JSON.stringify(entry.detail)}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

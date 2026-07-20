import Link from "next/link";
import { X } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { accountStatus, type AdminUserRow } from "@/lib/admin-users";
import { UsersRowActions } from "@/components/admin/users-row-actions";

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  user: "User",
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  suspended: "bg-amber-100 text-amber-700",
  banned: "bg-red-100 text-red-700",
};

type PageProps = {
  searchParams: Promise<{ q?: string; role?: string; status?: string }>;
};

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q?.trim().toLowerCase();
  const roleFilter = params.role;
  const statusFilter = params.status;

  const adminClient = createAdminClient();
  if (!adminClient) {
    return (
      <div>
        <h1 className="text-xl font-bold text-neutral-800">Users</h1>
        <p className="mt-4 text-sm text-red-600">
          Admin operations aren&apos;t configured on this environment (missing service role key).
        </p>
      </div>
    );
  }

  const [{ data: profiles }, { data: authData }] = await Promise.all([
    adminClient.from("profiles").select("*").order("created_at", { ascending: false }),
    adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);

  const authUsersById = new Map((authData?.users ?? []).map((u) => [u.id, u]));

  let rows: AdminUserRow[] = (profiles ?? []).map((p) => {
    const authUser = authUsersById.get(p.id);
    return {
      id: p.id,
      fullName: p.full_name,
      phone: p.phone,
      role: p.role,
      createdAt: p.created_at,
      suspendedUntil: p.suspended_until,
      email: authUser?.email ?? null,
      bannedUntil: authUser?.banned_until ?? null,
      lastSignInAt: authUser?.last_sign_in_at ?? null,
    };
  });

  if (q) {
    rows = rows.filter(
      (r) =>
        r.fullName?.toLowerCase().includes(q) ||
        r.phone?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
    );
  }
  if (roleFilter) {
    rows = rows.filter((r) => (roleFilter === "user" ? !r.role : r.role === roleFilter));
  }
  if (statusFilter) {
    rows = rows.filter((r) => accountStatus(r) === statusFilter);
  }

  const hasFilters = Boolean(q || roleFilter || statusFilter);

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-800">Users</h1>
      <p className="mt-1 text-sm text-neutral-500">{rows.length} user{rows.length === 1 ? "" : "s"}.</p>

      <form
        method="get"
        className="mt-6 mb-4 flex flex-wrap items-end gap-3 rounded-2xl border border-neutral-100 bg-white p-4"
      >
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Search
          </span>
          <input
            type="text"
            name="q"
            defaultValue={params.q}
            placeholder="Name, phone, email, or ID"
            className="w-64 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Role
          </span>
          <select
            name="role"
            defaultValue={roleFilter ?? ""}
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
          >
            <option value="">All</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Status
          </span>
          <select
            name="status"
            defaultValue={statusFilter ?? ""}
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>
        </label>

        <button
          type="submit"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark"
        >
          Apply
        </button>

        {hasFilters && (
          <Link
            href="/admin/users"
            className="flex items-center gap-1 pb-2.5 text-sm text-neutral-500 hover:text-brand"
          >
            <X className="size-3.5" />
            Clear
          </Link>
        )}
      </form>

      <div className="divide-y divide-neutral-100 rounded-2xl border border-neutral-100 bg-white">
        {rows.length === 0 ? (
          <p className="p-6 text-sm text-neutral-400">No users match these filters.</p>
        ) : (
          rows.map((row) => {
            const status = accountStatus(row);
            return (
              <div key={row.id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/users/${row.id}`}
                      className="text-sm font-bold text-neutral-800 hover:text-brand hover:underline"
                    >
                      {row.fullName || "Unnamed user"}
                    </Link>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${STATUS_STYLES[status]}`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                    {row.role && (
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-bold text-neutral-600">
                        {ROLE_LABELS[row.role] ?? row.role}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-neutral-500">
                    {[row.phone, row.email].filter(Boolean).join(" · ") || "No contact info"}
                  </p>
                </div>

                <UsersRowActions
                  userId={row.id}
                  suspended={status === "suspended"}
                  banned={status === "banned"}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

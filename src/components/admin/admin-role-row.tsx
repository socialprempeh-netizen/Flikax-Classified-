"use client";

import { useState, useTransition } from "react";
import { updateAdminRoleAction } from "@/app/admin/admins/actions";

export type AdminListItem = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: string | null;
};

export function AdminRoleRow({ admin, isSelf }: { admin: AdminListItem; isSelf: boolean }) {
  const [role, setRole] = useState(admin.role);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleChange(next: "super_admin" | "admin" | "") {
    const prev = role;
    const newRole = next === "" ? null : next;
    setRole(newRole);
    setError(null);
    startTransition(async () => {
      try {
        await updateAdminRoleAction(admin.id, newRole);
      } catch (err) {
        setRole(prev);
        setError(err instanceof Error ? err.message : "Failed to update role.");
      }
    });
  }

  return (
    <div className="flex items-center justify-between gap-4 p-5">
      <div>
        <p className="text-sm font-semibold text-neutral-800">
          {admin.full_name || "Unnamed user"}
          {isSelf && <span className="ml-2 text-xs font-normal text-neutral-400">(you)</span>}
        </p>
        {admin.phone && <p className="mt-0.5 text-sm text-neutral-500">{admin.phone}</p>}
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>

      <select
        value={role ?? ""}
        disabled={isSelf || isPending}
        onChange={(e) => handleChange(e.target.value as "super_admin" | "admin" | "")}
        title={isSelf ? "You can't change your own role here" : undefined}
        className="rounded-lg border-2 border-slate-strong px-3 py-1.5 text-sm text-neutral-800 outline-none focus:border-brand disabled:bg-neutral-50 disabled:text-neutral-400"
      >
        <option value="admin">Admin</option>
        <option value="super_admin">Super Admin</option>
        <option value="">Revoke access</option>
      </select>
    </div>
  );
}

"use client";

import { useState, useTransition, type FormEvent } from "react";
import { grantAdminAccessAction } from "@/app/admin/admins/actions";

export function GrantAdminForm() {
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"admin" | "super_admin">("admin");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      try {
        await grantAdminAccessAction(phone, role);
        setPhone("");
        setSuccess(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to grant access.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-wrap items-end gap-3">
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-neutral-600">Phone number</span>
        <input
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="024 123 4567"
          className="w-44 rounded-lg border-2 border-slate-strong px-3 py-1.5 text-sm text-neutral-800 outline-none focus:border-brand"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-neutral-600">Role</span>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "admin" | "super_admin")}
          className="rounded-lg border-2 border-slate-strong px-3 py-1.5 text-sm text-neutral-800 outline-none focus:border-brand"
        >
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-brand px-4 py-1.5 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {isPending ? "Granting..." : "Grant access"}
      </button>

      {error && <p className="w-full text-sm text-red-600">{error}</p>}
      {success && <p className="w-full text-sm text-green-600">Access granted.</p>}
    </form>
  );
}

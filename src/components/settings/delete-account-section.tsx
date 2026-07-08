"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteAccountAction } from "@/app/settings/actions";

export function DeleteAccountSection() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm("Delete your account permanently? This cannot be undone.")) return;

    setLoading(true);
    setError(null);
    const result = await deleteAccountAction();
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-red-100 bg-red-50/50 p-5">
      <h2 className="text-sm font-bold text-red-700">Delete my account permanently</h2>
      <p className="mt-1 text-sm text-red-600/80">
        This removes your profile and listings. This action can&apos;t be undone.
      </p>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="mt-3 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-60"
      >
        {loading ? "Deleting..." : "Delete my account"}
      </button>
    </div>
  );
}

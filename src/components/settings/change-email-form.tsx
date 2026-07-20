"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export function ChangeEmailForm({ currentEmail }: { currentEmail: string | null }) {
  const [supabase] = useState(() => createClient());
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ email });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-md">
      <h2 className="text-sm font-bold text-neutral-800">Change email</h2>
      <p className="mt-1 text-sm text-neutral-500">Current: {currentEmail ?? "Not set"}</p>

      {sent && (
        <p className="mt-2 text-sm text-green-700">Check your new inbox to confirm the change.</p>
      )}

      <form onSubmit={handleSubmit} className="mt-3 flex flex-wrap items-center gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {loading ? "Sending..." : "Update email"}
        </button>
      </form>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

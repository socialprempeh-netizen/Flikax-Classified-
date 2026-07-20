"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [supabase] = useState(() => createClient());
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Supabase's recovery-link redirect delivers the session as a URL hash
    // fragment (#access_token=...), not a ?code= param — fragments never
    // reach the server, so this must NOT go through the server-side
    // /auth/callback route (that's PKCE-code-flow-only, used by Google
    // OAuth). The browser client's detectSessionInUrl auto-consumes the
    // fragment once it lands on this page directly.
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    setLoading(false);
    // Always show the same confirmation regardless of whether the email
    // exists — avoids leaking which addresses are registered.
    setSent(true);
  }

  if (sent) {
    return (
      <div className="w-full max-w-sm rounded-2xl border-2 border-slate-strong bg-white p-6 shadow-sm">
        <h1 className="text-lg font-bold text-neutral-800">Check your email</h1>
        <p className="mt-1 text-sm text-neutral-500">
          If an account exists for <span className="font-medium text-neutral-700">{email}</span>, we&apos;ve
          sent a link to reset your password.
        </p>
        <Link
          href="/auth/login"
          className="mt-4 block w-full rounded-lg border-2 border-slate-strong py-2.5 text-center text-sm font-bold text-neutral-700 hover:bg-neutral-50"
        >
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm space-y-4 rounded-2xl border-2 border-slate-strong bg-white p-6 shadow-sm"
    >
      <div>
        <h1 className="text-lg font-bold text-neutral-800">Reset your password</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Enter your email and we&apos;ll send you a link to reset it.
        </p>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-neutral-700">Email</span>
        <input
          type="email"
          autoComplete="email"
          autoFocus
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-lg border-2 border-slate-strong px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-brand py-2.5 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {loading ? "Sending..." : "Send reset link"}
      </button>

      <Link href="/auth/login" className="block text-center text-sm font-medium text-brand hover:underline">
        Back to login
      </Link>
    </form>
  );
}

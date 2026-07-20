"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ChangePasswordForm } from "@/components/settings/change-password-form";

type Status = "checking" | "ready" | "invalid";

export function ResetPasswordGate() {
  const [supabase] = useState(() => createClient());
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    // The recovery link lands here with the session in a URL hash fragment
    // (#access_token=...&type=recovery), which never reaches the server —
    // the browser client's detectSessionInUrl (on by default) consumes it
    // automatically on init. Poll getSession() once mounted rather than
    // gating server-side, since a server component render happens before
    // any client JS runs and would never see the fragment at all.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setStatus(session ? "ready" : "invalid");
    });
  }, [supabase]);

  if (status === "checking") {
    return <p className="text-sm text-neutral-500">Checking your link...</p>;
  }

  if (status === "invalid") {
    return (
      <div className="w-full max-w-sm rounded-2xl border-2 border-slate-strong bg-white p-6 text-center shadow-sm">
        <p className="text-sm text-neutral-600">This reset link is invalid or has expired.</p>
        <Link
          href="/auth/forgot-password"
          className="mt-3 inline-block text-sm font-bold text-brand hover:underline"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <p className="mb-3 text-center text-sm text-neutral-500">Choose a new password for your account.</p>
      <ChangePasswordForm redirectTo="/dashboard" />
    </div>
  );
}

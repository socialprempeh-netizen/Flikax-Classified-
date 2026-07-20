"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GoogleIcon } from "@/components/icons/social-icons";

export function GoogleSignInButton({ redirectTo = "/" }: { redirectTo?: string }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
      },
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white py-3.5 text-sm font-bold text-neutral-700 shadow-sm hover:bg-neutral-50 disabled:opacity-60"
    >
      <GoogleIcon className="size-4.5" aria-hidden="true" />
      {loading ? "Redirecting..." : "Continue with Google"}
    </button>
  );
}

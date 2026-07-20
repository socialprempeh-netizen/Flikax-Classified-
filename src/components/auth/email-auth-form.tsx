"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "sign-in" | "sign-up";

export function EmailAuthForm({ redirectTo = "/" }: { redirectTo?: string }) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setCheckEmail(false);
  }

  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push(redirectTo);
  }

  async function handleSignUp(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError("Enter your name.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName.trim() } },
    });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (data.session) {
      router.push(redirectTo);
      return;
    }

    // No session back means the project requires email confirmation before
    // the account can log in — the request still succeeded either way.
    setCheckEmail(true);
  }

  if (checkEmail) {
    return (
      <div className="w-full max-w-sm rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-bold text-neutral-800">Check your email</h1>
        <p className="mt-1 text-sm text-neutral-500">
          We sent a confirmation link to <span className="font-medium text-neutral-700">{email}</span>. Click
          it to activate your account, then come back and sign in.
        </p>
        <button
          type="button"
          onClick={() => switchMode("sign-in")}
          className="mt-4 w-full rounded-lg border border-neutral-200 py-2.5 text-sm font-bold text-neutral-700 hover:bg-neutral-50"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex rounded-lg bg-neutral-100 p-1 text-sm font-bold">
        <button
          type="button"
          onClick={() => switchMode("sign-in")}
          className={`flex-1 rounded-md py-1.5 ${
            mode === "sign-in" ? "bg-white text-neutral-800 shadow-sm" : "text-neutral-500"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => switchMode("sign-up")}
          className={`flex-1 rounded-md py-1.5 ${
            mode === "sign-up" ? "bg-white text-neutral-800 shadow-sm" : "text-neutral-500"
          }`}
        >
          Sign up
        </button>
      </div>

      <form onSubmit={mode === "sign-in" ? handleSignIn : handleSignUp} className="space-y-4">
        {mode === "sign-up" && (
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">Full name</span>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ama Owusu"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
            />
          </label>
        )}

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-neutral-700">Email</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-neutral-700">Password</span>
          <input
            type="password"
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
            required
            minLength={mode === "sign-up" ? 8 : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
          />
        </label>

        {mode === "sign-up" && (
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">Confirm password</span>
            <input
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
            />
          </label>
        )}

        {mode === "sign-in" && (
          <Link href="/auth/forgot-password" className="block text-right text-sm font-medium text-brand hover:underline">
            Forgot password?
          </Link>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand py-2.5 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {loading ? "Please wait..." : mode === "sign-in" ? "Sign in" : "Create account"}
        </button>
      </form>
    </div>
  );
}

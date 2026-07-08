"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toGhanaE164 } from "@/lib/phone";

const RESEND_SECONDS = 30;

type Step = "phone" | "otp" | "name";

export function PhoneAuthForm({ redirectTo = "/" }: { redirectTo?: string }) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [step, setStep] = useState<Step>("phone");
  const [rawPhone, setRawPhone] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function sendOtp(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const e164 = toGhanaE164(rawPhone);
    if (!e164) {
      setError("Enter a valid Ghana phone number, e.g. 024 123 4567.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: e164 });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setPhone(e164);
    setStep("otp");
    setCooldown(RESEND_SECONDS);
  }

  async function resendOtp() {
    if (cooldown > 0) return;
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    setCooldown(RESEND_SECONDS);
  }

  async function verifyOtp(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: "sms",
    });

    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }

    const user = data.user;
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile?.full_name) {
        setLoading(false);
        setStep("name");
        return;
      }
    }

    router.push(redirectTo);
  }

  async function saveName(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError("Enter your name.");
      return;
    }

    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName.trim() })
        .eq("id", user.id);

      if (error) {
        setLoading(false);
        setError(error.message);
        return;
      }
    }

    router.push(redirectTo);
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
      {step === "phone" && (
        <form onSubmit={sendOtp} className="space-y-4">
          <div>
            <h1 className="text-lg font-bold text-neutral-800">Log in or sign up</h1>
            <p className="mt-1 text-sm text-neutral-500">
              We&apos;ll text you a code to verify your number.
            </p>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">
              Phone number
            </span>
            <div className="flex items-center rounded-lg border border-neutral-200 focus-within:border-brand">
              <span className="border-r border-neutral-200 px-3 py-2 text-sm text-neutral-500">
                +233
              </span>
              <input
                type="tel"
                inputMode="tel"
                autoFocus
                required
                value={rawPhone}
                onChange={(e) => setRawPhone(e.target.value)}
                placeholder="024 123 4567"
                className="min-w-0 flex-1 rounded-r-lg px-3 py-2 text-sm text-neutral-800 outline-none placeholder:text-neutral-400"
              />
            </div>
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand py-2.5 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {loading ? "Sending code..." : "Send code"}
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={verifyOtp} className="space-y-4">
          <div>
            <h1 className="text-lg font-bold text-neutral-800">Enter the code</h1>
            <p className="mt-1 text-sm text-neutral-500">
              We sent a 6-digit code to {phone}.{" "}
              <button
                type="button"
                onClick={() => setStep("phone")}
                className="font-medium text-brand hover:underline"
              >
                Change
              </button>
            </p>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">
              Verification code
            </span>
            <input
              type="text"
              inputMode="numeric"
              autoFocus
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-center text-lg tracking-[0.5em] text-neutral-800 outline-none focus:border-brand"
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full rounded-lg bg-brand py-2.5 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>

          <button
            type="button"
            onClick={resendOtp}
            disabled={cooldown > 0 || loading}
            className="w-full text-center text-sm text-neutral-500 disabled:opacity-60"
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
          </button>
        </form>
      )}

      {step === "name" && (
        <form onSubmit={saveName} className="space-y-4">
          <div>
            <h1 className="text-lg font-bold text-neutral-800">What&apos;s your name?</h1>
            <p className="mt-1 text-sm text-neutral-500">
              This is how buyers and sellers will see you on Flikax.
            </p>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">Full name</span>
            <input
              type="text"
              autoFocus
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ama Owusu"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand py-2.5 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {loading ? "Saving..." : "Continue"}
          </button>
        </form>
      )}
    </div>
  );
}

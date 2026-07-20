"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { toGhanaE164 } from "@/lib/phone";

export function ChangePhoneForm({ currentPhone }: { currentPhone: string | null }) {
  const [supabase] = useState(() => createClient());
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [rawPhone, setRawPhone] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function requestChange(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const e164 = toGhanaE164(rawPhone);
    if (!e164) {
      setError("Enter a valid Ghana phone number, e.g. 024 123 4567.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ phone: e164 });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    setPhone(e164);
    setStep("otp");
  }

  async function verifyChange(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "phone_change" });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
    setStep("phone");
    setRawPhone("");
    setOtp("");
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-md">
      <h2 className="text-sm font-bold text-neutral-800">Change phone number</h2>
      <p className="mt-1 text-sm text-neutral-500">Current: {currentPhone ?? "Not set"}</p>

      {done && <p className="mt-2 text-sm text-green-700">Phone number updated.</p>}

      {step === "phone" && (
        <form onSubmit={requestChange} className="mt-3 flex flex-wrap items-center gap-2">
          <input
            type="tel"
            required
            value={rawPhone}
            onChange={(e) => setRawPhone(e.target.value)}
            placeholder="024 123 4567"
            className="rounded-lg border-2 border-slate-strong px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send code"}
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={verifyChange} className="mt-3 flex flex-wrap items-center gap-2">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="123456"
            className="rounded-lg border-2 border-slate-strong px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

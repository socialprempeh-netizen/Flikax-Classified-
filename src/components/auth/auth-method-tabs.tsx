"use client";

import { useState } from "react";
import { EmailAuthForm } from "@/components/auth/email-auth-form";
import { PhoneAuthForm } from "@/components/auth/phone-auth-form";

type Method = "email" | "phone";

export function AuthMethodTabs({ redirectTo }: { redirectTo?: string }) {
  const [method, setMethod] = useState<Method>("email");

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-neutral-200" />
        <span className="text-xs font-medium text-neutral-400">or</span>
        <span className="h-px flex-1 bg-neutral-200" />
      </div>

      <div className="flex justify-center gap-6 text-base font-bold">
        <button
          type="button"
          onClick={() => setMethod("email")}
          className={`border-b-2 pb-1 ${
            method === "email" ? "border-brand text-brand" : "border-transparent text-neutral-400"
          }`}
        >
          Email
        </button>
        <button
          type="button"
          onClick={() => setMethod("phone")}
          className={`border-b-2 pb-1 ${
            method === "phone" ? "border-brand text-brand" : "border-transparent text-neutral-400"
          }`}
        >
          Phone
        </button>
      </div>

      {method === "email" ? (
        <EmailAuthForm redirectTo={redirectTo} />
      ) : (
        <PhoneAuthForm redirectTo={redirectTo} />
      )}
    </div>
  );
}

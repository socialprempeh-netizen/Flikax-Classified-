"use client";

import { useState } from "react";
import { Phone } from "lucide-react";

export function RevealPhoneButton({
  phone,
  label,
  variant = "solid",
}: {
  phone: string;
  label: string;
  variant?: "solid" | "outline";
}) {
  const [revealed, setRevealed] = useState(false);

  const baseClasses = "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-base font-bold";
  const variantClasses =
    variant === "solid"
      ? "bg-brand text-white hover:bg-brand-dark"
      : "border-2 border-slate-strong text-neutral-700 hover:bg-neutral-50";

  if (revealed) {
    return (
      <a href={`tel:${phone}`} className={`${baseClasses} ${variantClasses}`}>
        <Phone className="size-4" />
        {phone}
      </a>
    );
  }

  return (
    <button type="button" onClick={() => setRevealed(true)} className={`${baseClasses} ${variantClasses}`}>
      <Phone className="size-4" />
      {label}
    </button>
  );
}

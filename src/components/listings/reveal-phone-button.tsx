"use client";

import { useState } from "react";
import { Phone } from "lucide-react";

export function RevealPhoneButton({
  phone,
  label,
  variant = "solid",
  compact = false,
}: {
  phone: string;
  label: string;
  variant?: "solid" | "outline";
  /** Content-sized and sharing a row with a sibling action (e.g. the mobile
   * Show contact/Message pair), rather than the default full-width block
   * used everywhere this stands alone in a sidebar column. */
  compact?: boolean;
}) {
  const [revealed, setRevealed] = useState(false);

  const baseClasses = compact
    ? "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold"
    : "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-base font-bold";
  const variantClasses =
    variant === "solid"
      ? "bg-brand text-white hover:bg-brand-dark"
      : "border border-brand/30 bg-brand-light text-brand hover:bg-brand/10";

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

import { Mail } from "lucide-react";

// Single source of truth for the support mailbox. If this address ever
// changes, update it here — every "Contact Support" CTA site-wide reads it
// from this one place instead of hardcoding it per page.
export const SUPPORT_EMAIL = "flikaxsupport@gmail.com";

const VARIANT_CLASSES = {
  solid: "bg-brand text-white hover:bg-brand-dark",
  outline: "border-2 border-brand text-brand hover:bg-brand-light",
};

export function SupportCta({
  label = "Contact Support",
  subject,
  variant = "solid",
  className = "",
}: {
  label?: string;
  subject?: string;
  variant?: keyof typeof VARIANT_CLASSES;
  className?: string;
}) {
  const href = subject
    ? `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`
    : `mailto:${SUPPORT_EMAIL}`;

  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-colors ${VARIANT_CLASSES[variant]} ${className}`}
    >
      <Mail className="size-4" />
      {label}
    </a>
  );
}

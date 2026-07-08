import Link from "next/link";
import type { LucideIcon } from "lucide-react";

// Single source of truth for every "Sell / Post an Ad / Create Listing"-style
// call to action across the site. If the post-listing route ever moves,
// update SELL_ROUTE here instead of hunting down every hardcoded link.
const SELL_ROUTE = "/sell";

const VARIANT_CLASSES = {
  solid: "bg-brand text-white hover:bg-brand-dark",
  outline: "border-2 border-brand text-brand hover:bg-brand-light",
  footer: "bg-white/10 text-white hover:bg-white/20",
};

const SIZE_CLASSES = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export function SellCta({
  label = "Post an Ad",
  variant = "solid",
  size = "md",
  icon: Icon,
  className = "",
}: {
  label?: string;
  variant?: keyof typeof VARIANT_CLASSES;
  size?: keyof typeof SIZE_CLASSES;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <Link
      href={SELL_ROUTE}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-bold transition-colors ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
    >
      {Icon && <Icon className="size-4" />}
      {label}
    </Link>
  );
}

import type { LucideIcon } from "lucide-react";

type Badge = {
  label: string;
  icon?: LucideIcon;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
};

const TONE_CLASSES = {
  brand: "bg-brand-light text-brand",
  amber: "bg-amber-50 text-amber-600",
};

const POSITION_CLASSES: Record<Badge["position"], string> = {
  "top-left": "-left-3 -top-3 sm:-left-4 sm:-top-4",
  "top-right": "-right-3 -top-3 sm:-right-4 sm:-top-4",
  "bottom-left": "-left-3 -bottom-3 sm:-left-4 sm:-bottom-4",
  "bottom-right": "-right-3 -bottom-3 sm:-right-4 sm:-bottom-4",
};

// Decorative, icon-based "photo" placeholder — used in place of stock photography
// on the About page (safety, premium, hand-off visuals) so the page has no
// dependency on external/hotlinked images.
export function IllustrationCard({
  icon: Icon,
  tone = "brand",
  badges = [],
  className = "",
}: {
  icon: LucideIcon;
  tone?: keyof typeof TONE_CLASSES;
  badges?: Badge[];
  className?: string;
}) {
  return (
    <div className={`relative mx-auto w-full max-w-sm ${className}`}>
      <div className={`flex aspect-square items-center justify-center rounded-3xl ${TONE_CLASSES[tone]}`}>
        <Icon className="size-20 sm:size-24" strokeWidth={1.5} />
      </div>
      {badges.map((badge) => (
        <div
          key={badge.label}
          className={`absolute flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-neutral-700 shadow-lg ${POSITION_CLASSES[badge.position]}`}
        >
          {badge.icon && <badge.icon className="size-3.5 text-brand" />}
          {badge.label}
        </div>
      ))}
    </div>
  );
}

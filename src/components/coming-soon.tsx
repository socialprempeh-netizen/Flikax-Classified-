import type { LucideIcon } from "lucide-react";

export function ComingSoon({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl bg-white py-20 text-center shadow-lg">
      <span className="flex size-14 items-center justify-center rounded-full bg-brand text-white shadow-md">
        <Icon className="size-6" />
      </span>
      <h1 className="text-xl font-bold text-neutral-800">{title}</h1>
      <p className="max-w-sm text-sm text-neutral-500">{description}</p>
      <span className="mt-1 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-500">
        Coming soon
      </span>
    </div>
  );
}

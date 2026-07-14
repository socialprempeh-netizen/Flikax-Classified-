// No per-category color is stored anywhere (categories only carry an icon
// name) and the brand palette is a single blue, so there's nothing to reuse
// for the mobile icon grid's colored chips. This cycles a small fixed
// palette by position instead of introducing a color column — new
// categories automatically pick up a color with no data migration.
const PALETTE = [
  "bg-blue-100 text-blue-600",
  "bg-rose-100 text-rose-600",
  "bg-amber-100 text-amber-600",
  "bg-emerald-100 text-emerald-600",
  "bg-violet-100 text-violet-600",
  "bg-cyan-100 text-cyan-600",
  "bg-pink-100 text-pink-600",
  "bg-lime-100 text-lime-700",
  "bg-orange-100 text-orange-600",
  "bg-indigo-100 text-indigo-600",
];

export function getCategoryColor(index: number) {
  return PALETTE[index % PALETTE.length];
}

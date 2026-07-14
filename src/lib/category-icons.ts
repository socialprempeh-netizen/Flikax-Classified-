import {
  Car,
  Home,
  Smartphone,
  Laptop,
  Sofa,
  Shirt,
  Sparkles,
  Wrench,
  Hammer,
  Briefcase,
  Dumbbell,
  Baby,
  ShoppingBasket,
  PawPrint,
  Tag,
  Package,
  Grid3x3,
  Book,
  Camera,
  Gamepad2,
  Bike,
  Music,
  Utensils,
  Palette,
  type LucideIcon,
} from "lucide-react";

/** Curated icon set for the categories admin picker — every icon already used by the
 * legacy hardcoded slug map in category-nav.tsx, plus a handful of generic options
 * for new categories. */
export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  Car,
  Home,
  Smartphone,
  Laptop,
  Sofa,
  Shirt,
  Sparkles,
  Wrench,
  Hammer,
  Briefcase,
  Dumbbell,
  Baby,
  ShoppingBasket,
  PawPrint,
  Tag,
  Package,
  Grid3x3,
  Book,
  Camera,
  Gamepad2,
  Bike,
  Music,
  Utensils,
  Palette,
};

export const CATEGORY_ICON_OPTIONS: { name: string; Icon: LucideIcon }[] = Object.entries(
  CATEGORY_ICON_MAP
).map(([name, Icon]) => ({ name, Icon }));

// Legacy fallback for any top-level category with no `icon` set in the DB
// (pre-Phase-4C categories, or a slug this map doesn't recognize) — kept so
// nothing regresses for categories that haven't been given an icon yet.
const LEGACY_ICONS: Record<string, string> = {
  vehicles: "Car",
  property: "Home",
  "phones-tablets": "Smartphone",
  electronics: "Laptop",
  "home-furniture-appliances": "Sofa",
  fashion: "Shirt",
  "beauty-personal-care": "Sparkles",
  services: "Wrench",
  "repair-construction": "Hammer",
  "commercial-equipment-tools": "Briefcase",
  "leisure-activities": "Dumbbell",
  "babies-kids": "Baby",
  "food-agriculture-farming": "ShoppingBasket",
  "animals-pets": "PawPrint",
};

export function resolveCategoryIcon(cat: { slug: string; icon?: string | null }): LucideIcon {
  const iconName = cat.icon ?? LEGACY_ICONS[cat.slug];
  return (iconName && CATEGORY_ICON_MAP[iconName]) || Car;
}

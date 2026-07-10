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

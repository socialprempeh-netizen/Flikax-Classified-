import { Car, Home, Smartphone, Laptop2, type LucideIcon } from "lucide-react";
import { CATEGORY_FIELDS } from "@/lib/listing-fields";

export type SidebarFieldType = "select" | "text" | "range";

export type SidebarFilterField = {
  key: string;
  label: string;
  type: SidebarFieldType;
  options?: string[];
};

/** Curated, per-top-level-category subset of CATEGORY_FIELDS shown in the sidebar --
 * deliberately narrow (Location + Price are handled separately, always shown) rather
 * than dumping every attribute the listing form collects. */
const SIDEBAR_FIELD_KEYS: Record<string, string[]> = {
  vehicles: ["make", "year", "condition", "transmission", "mileage"],
  property: ["property_type", "bedrooms", "bathrooms", "furnished"],
  "phones-tablets": ["brand", "condition"],
  electronics: ["brand", "condition"],
  "home-furniture-appliances": ["material", "condition"],
};

// "range" for number fields (rendered as min/max inputs, filtered numerically),
// "select" for anything with a fixed option list, "text" (substring search) otherwise.
function resolveFieldType(key: string, formType: string): SidebarFieldType {
  if (formType === "number") return "range";
  if (formType === "select") return "select";
  return "text";
}

export function getSidebarFields(topLevelSlug: string | undefined): SidebarFilterField[] {
  if (!topLevelSlug) return [];
  const keys = SIDEBAR_FIELD_KEYS[topLevelSlug];
  if (!keys) return [];
  const defs = CATEGORY_FIELDS[topLevelSlug] ?? [];
  return keys
    .map((key) => defs.find((f) => f.key === key))
    .filter((f): f is NonNullable<typeof f> => Boolean(f))
    .map((f) => ({ key: f.key, label: f.label, type: resolveFieldType(f.key, f.type), options: f.options }));
}

/** The attribute that best represents "sub-type" for this category's quick-filter icon
 * row (e.g. Make for vehicles, Property Type for property) -- undefined where no
 * attribute in our schema fits that role well. */
const QUICK_FILTER_KEY: Record<string, string> = {
  vehicles: "make",
  property: "property_type",
  "phones-tablets": "brand",
  electronics: "brand",
};

const QUICK_FILTER_ICON: Record<string, LucideIcon> = {
  vehicles: Car,
  property: Home,
  "phones-tablets": Smartphone,
  electronics: Laptop2,
};

export function getQuickFilterKey(topLevelSlug: string | undefined): string | undefined {
  if (!topLevelSlug) return undefined;
  return QUICK_FILTER_KEY[topLevelSlug];
}

export function getQuickFilterIcon(topLevelSlug: string | undefined): LucideIcon {
  return (topLevelSlug && QUICK_FILTER_ICON[topLevelSlug]) || Car;
}

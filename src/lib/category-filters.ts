import { Home, Building2, Trees, Building, type LucideIcon } from "lucide-react";
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
 * than dumping every attribute the listing form collects. Verified sellers/Discount are
 * deliberately not included -- Jiji has them, this sidebar doesn't. */
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

/** The attribute that best represents "sub-type" for this category's quick-filter row
 * (e.g. Make for vehicles, Property Type for property) -- undefined where no attribute
 * in our schema fits that role well. */
const QUICK_FILTER_KEY: Record<string, string> = {
  vehicles: "make",
  property: "property_type",
  "phones-tablets": "brand",
  electronics: "brand",
};

export function getQuickFilterKey(topLevelSlug: string | undefined): string | undefined {
  if (!topLevelSlug) return undefined;
  return QUICK_FILTER_KEY[topLevelSlug];
}

export type QuickFilterStyle = "brand" | "type";

/** "brand" categories render each value as a colored brand monogram (see BRAND_COLORS
 * below); "type" categories render a representative lucide icon per value instead --
 * there's no logo for "Apartment". */
const QUICK_FILTER_STYLE: Record<string, QuickFilterStyle> = {
  vehicles: "brand",
  "phones-tablets": "brand",
  electronics: "brand",
};

export function getQuickFilterStyle(topLevelSlug: string | undefined): QuickFilterStyle {
  return (topLevelSlug && QUICK_FILTER_STYLE[topLevelSlug]) || "type";
}

// Real brand mark artwork isn't something this app has a license to embed, so brand
// values render as a monogram in the brand's actual identity color instead of a photo
// of their logo -- same purpose (instant recognition), no trademarked artwork involved.
const BRAND_COLORS: Record<string, string> = {
  Toyota: "#EB0A1E",
  Honda: "#E4002B",
  Ford: "#00095B",
  Hyundai: "#002C5F",
  Kia: "#05141F",
  "Mercedes-Benz": "#00A5C8",
  Nissan: "#C3002F",
  "Land Rover": "#1B4332",
  "Range Rover": "#1B4332",
  Cadillac: "#1A1A1A",
  Chevrolet: "#CD9834",
  Volkswagen: "#001E50",
  BMW: "#0066B1",
  Audi: "#BB0A30",
  Lexus: "#1A1A1A",
  Mazda: "#910A2D",
  Mitsubishi: "#E60012",
  Suzuki: "#E30016",
  Peugeot: "#0C0FF2",
  Jeep: "#425821",
  Volvo: "#003057",
  Samsung: "#1428A0",
  Apple: "#1A1A1A",
  Google: "#4285F4",
  Huawei: "#FF0000",
  Xiaomi: "#FF6900",
  Tecno: "#0072CE",
  Infinix: "#00A651",
  Itel: "#FF6600",
  Oppo: "#1A8A5C",
  Vivo: "#4157F2",
  Nokia: "#124191",
  HP: "#0096D6",
  Dell: "#007DB8",
  Lenovo: "#E2231A",
  Asus: "#1A1A1A",
  Acer: "#83B81A",
  Toshiba: "#DE1785",
};

const FALLBACK_BRAND_COLOR = "#516170";

export function getBrandColor(value: string): string {
  return BRAND_COLORS[value] ?? FALLBACK_BRAND_COLOR;
}

const PROPERTY_TYPE_ICONS: Record<string, LucideIcon> = {
  House: Home,
  Apartment: Building2,
  Land: Trees,
  Commercial: Building,
};

const TYPE_ICON_BY_CATEGORY: Record<string, Record<string, LucideIcon>> = {
  property: PROPERTY_TYPE_ICONS,
};

export function getTypeIcon(topLevelSlug: string | undefined, value: string): LucideIcon {
  const map = (topLevelSlug && TYPE_ICON_BY_CATEGORY[topLevelSlug]) || {};
  return map[value] ?? Building;
}

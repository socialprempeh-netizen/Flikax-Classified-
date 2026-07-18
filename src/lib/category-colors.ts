// Fixed, identity-based color per top-level category (not the previous
// index-based rotation, which meant a category's color depended on its
// position in the list rather than its identity, and would change color if
// the list order ever changed or a category was added/removed). Every
// subcategory inherits a lighter shade of its own parent's color, so a
// glance at any icon grid visually groups a category with its children.
type ColorKey =
  | "blue"
  | "orange"
  | "purple"
  | "teal"
  | "pink"
  | "amber"
  | "rose"
  | "indigo"
  | "yellow"
  | "cyan"
  | "lime"
  | "violet"
  | "emerald"
  | "fuchsia";

const TOP_LEVEL_COLOR_BY_SLUG: Record<string, ColorKey> = {
  vehicles: "blue",
  property: "orange",
  "phones-tablets": "purple",
  electronics: "teal",
  fashion: "pink",
  "home-furniture-appliances": "amber",
  "beauty-personal-care": "rose",
  services: "indigo",
  "repair-construction": "yellow",
  "commercial-equipment-tools": "cyan",
  "leisure-activities": "lime",
  "babies-kids": "violet",
  "food-agriculture-farming": "emerald",
  "animals-pets": "fuchsia",
};

const SUBCATEGORY_PARENT_SLUG: Record<string, string> = {
  "buses-microbuses": "vehicles",
  cars: "vehicles",
  "construction-heavy-machinery": "vehicles",
  "motorcycles-scooters": "vehicles",
  "personal-mobility": "vehicles",
  "trucks-trailers": "vehicles",
  "vehicle-parts-accessories": "vehicles",
  "watercraft-boats": "vehicles",

  "commercial-property-for-rent": "property",
  "event-centres-venues-workstations": "property",
  "houses-apartments-for-rent": "property",
  "houses-apartments-for-sale": "property",
  "land-plots-for-rent": "property",
  "land-plots-for-sale": "property",
  "new-builds": "property",
  "short-let": "property",

  "phone-tablet-accessories": "phones-tablets",
  "mobile-phones": "phones-tablets",
  "smart-watches": "phones-tablets",
  tablets: "phones-tablets",

  "audio-music-equipment": "electronics",
  headphones: "electronics",
  "laptops-computers": "electronics",
  "networking-products": "electronics",
  "photo-video-cameras": "electronics",
  "printers-scanners": "electronics",
  "security-surveillance": "electronics",
  "tv-video-equipment": "electronics",
  "video-game-consoles": "electronics",

  "baby-kids-fashion": "fashion",
  "mens-fashion": "fashion",
  "womens-fashion": "fashion",

  furniture: "home-furniture-appliances",
  "garden-supplies": "home-furniture-appliances",
  "home-accessories": "home-furniture-appliances",
  "home-appliances": "home-furniture-appliances",
  "household-chemicals": "home-furniture-appliances",
  "kitchen-appliances": "home-furniture-appliances",
  "kitchenware-cookware": "home-furniture-appliances",
  lighting: "home-furniture-appliances",
  "storage-organization": "home-furniture-appliances",

  "body-care": "beauty-personal-care",
  "face-care": "beauty-personal-care",
  fragrance: "beauty-personal-care",
  "hair-beauty": "beauty-personal-care",
  makeup: "beauty-personal-care",
  "oral-care": "beauty-personal-care",
  "sexual-wellness": "beauty-personal-care",
  "beauty-tools-accessories": "beauty-personal-care",
  "vitamins-supplements": "beauty-personal-care",

  "building-trades-services": "services",
  "car-services": "services",
  "cleaning-services": "services",
  "computer-it-services": "services",
  "legal-services": "services",
  "logistics-services": "services",
  "manufacturing-services": "services",
  "printing-services": "services",
  "repair-services": "services",

  "building-materials-supplies": "repair-construction",
  "doors-security": "repair-construction",
  "electrical-equipment": "repair-construction",
  "electrical-hand-tools": "repair-construction",
  "hand-tools": "repair-construction",
  "hardware-fasteners": "repair-construction",
  "measuring-testing-tools": "repair-construction",
  "plumbing-water-systems": "repair-construction",
  "windows-glass": "repair-construction",

  "manufacturing-equipment": "commercial-equipment-tools",
  "manufacturing-materials-supplies": "commercial-equipment-tools",
  "medical-equipment-supplies": "commercial-equipment-tools",
  "restaurant-catering-equipment": "commercial-equipment-tools",
  "retail-store-equipment": "commercial-equipment-tools",
  "safety-equipment-protective-gear": "commercial-equipment-tools",
  "salon-beauty-equipment": "commercial-equipment-tools",
  "stationery-office-equipment": "commercial-equipment-tools",

  "arts-crafts-awards": "leisure-activities",
  "books-table-games": "leisure-activities",
  massagers: "leisure-activities",
  "music-video": "leisure-activities",
  "musical-instruments-gear": "leisure-activities",
  "outdoor-gear": "leisure-activities",
  "smoking-accessories": "leisure-activities",
  "sports-equipment": "leisure-activities",

  "babies-kids-accessories": "babies-kids",
  "baby-gear-equipment": "babies-kids",
  "care-feeding": "babies-kids",
  "childrens-clothing": "babies-kids",
  "childrens-furniture": "babies-kids",
  "childrens-shoes": "babies-kids",
  "maternity-pregnancy": "babies-kids",
  "toys-games": "babies-kids",
  "transport-safety": "babies-kids",

  "farm-animal-feed-supplements": "food-agriculture-farming",
  "farm-animals": "food-agriculture-farming",
  "farm-machinery-equipment": "food-agriculture-farming",
  "food-beverages": "food-agriculture-farming",
  "seeds-fertilizers": "food-agriculture-farming",

  birds: "animals-pets",
  "cats-kittens": "animals-pets",
  "dogs-puppies": "animals-pets",
  fish: "animals-pets",
  "other-animals": "animals-pets",
  "pet-services": "animals-pets",
  "pets-accessories": "animals-pets",
};

/** Flat slug -> color lookup covering every top-level category and
 * subcategory (a subcategory resolves to its own parent's color). */
export const CATEGORY_COLOR_BY_SLUG: Record<string, ColorKey> = {
  ...TOP_LEVEL_COLOR_BY_SLUG,
  ...Object.fromEntries(
    Object.entries(SUBCATEGORY_PARENT_SLUG).map(([slug, parentSlug]) => [
      slug,
      TOP_LEVEL_COLOR_BY_SLUG[parentSlug],
    ])
  ),
};

// Tailwind's compiler scans source for literal class strings, so these
// have to be spelled out in full rather than built with `bg-${color}-100`
// template interpolation, which it can't statically detect.
const COLOR_CLASSES: Record<ColorKey, { strong: string; soft: string }> = {
  blue: { strong: "bg-blue-100 text-blue-600", soft: "bg-blue-50 text-blue-500" },
  orange: { strong: "bg-orange-100 text-orange-600", soft: "bg-orange-50 text-orange-500" },
  purple: { strong: "bg-purple-100 text-purple-600", soft: "bg-purple-50 text-purple-500" },
  teal: { strong: "bg-teal-100 text-teal-600", soft: "bg-teal-50 text-teal-500" },
  pink: { strong: "bg-pink-100 text-pink-600", soft: "bg-pink-50 text-pink-500" },
  amber: { strong: "bg-amber-100 text-amber-600", soft: "bg-amber-50 text-amber-500" },
  rose: { strong: "bg-rose-100 text-rose-600", soft: "bg-rose-50 text-rose-500" },
  indigo: { strong: "bg-indigo-100 text-indigo-600", soft: "bg-indigo-50 text-indigo-500" },
  yellow: { strong: "bg-yellow-100 text-yellow-700", soft: "bg-yellow-50 text-yellow-600" },
  cyan: { strong: "bg-cyan-100 text-cyan-600", soft: "bg-cyan-50 text-cyan-500" },
  lime: { strong: "bg-lime-100 text-lime-700", soft: "bg-lime-50 text-lime-600" },
  violet: { strong: "bg-violet-100 text-violet-600", soft: "bg-violet-50 text-violet-500" },
  emerald: { strong: "bg-emerald-100 text-emerald-600", soft: "bg-emerald-50 text-emerald-500" },
  fuchsia: { strong: "bg-fuchsia-100 text-fuchsia-600", soft: "bg-fuchsia-50 text-fuchsia-500" },
};

const FALLBACK = COLOR_CLASSES.blue;

/** Classes for a top-level category's icon chip (the stronger shade). */
export function getTopLevelColorClasses(slug: string): string {
  const color = TOP_LEVEL_COLOR_BY_SLUG[slug];
  return (color ? COLOR_CLASSES[color] : FALLBACK).strong;
}

/** Classes for a subcategory's icon chip -- a lighter shade of its parent's color. */
export function getSubcategoryColorClasses(slug: string): string {
  const color = CATEGORY_COLOR_BY_SLUG[slug];
  return (color ? COLOR_CLASSES[color] : FALLBACK).soft;
}

/** Picks strong vs. soft automatically from whether the category has a parent. */
export function getCategoryColorClasses(cat: { slug: string; parent_id: string | null }): string {
  return cat.parent_id === null ? getTopLevelColorClasses(cat.slug) : getSubcategoryColorClasses(cat.slug);
}

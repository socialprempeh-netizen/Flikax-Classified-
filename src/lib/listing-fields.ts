export type ListingFieldType = "text" | "number" | "select" | "boolean" | "tags";

export type ListingFieldDef = {
  key: string;
  label: string;
  type: ListingFieldType;
  options?: string[];
  required?: boolean;
};

/** Shared across every category that gets the universal fields — a house's exterior
 * colour and a phone's colour are the same comparison axis, so one curated list. */
export const COLOR_OPTIONS = [
  "Black",
  "White",
  "Silver",
  "Gray",
  "Red",
  "Blue",
  "Green",
  "Yellow",
  "Brown",
  "Beige",
  "Gold",
  "Orange",
  "Purple",
  "Maroon",
  "Multicolor",
];

const CONDITION_3_TIER = ["New", "Foreign Used", "Locally Used"];

// Vehicle list is lifted directly from the Jiji reference screenshot. The others are
// reasonable defaults, not reference-confirmed — worth a sanity check/edit.
const KEY_FEATURE_OPTIONS: Record<string, string[]> = {
  vehicles: [
    "Air Conditioning",
    "Alloy Wheels",
    "AM/FM Radio",
    "Electric Windows",
    "Airbags",
    "ABS Brakes",
    "Bluetooth",
    "Reverse Camera",
    "Sunroof",
    "Leather Seats",
    "Navigation System",
    "Cruise Control",
    "Keyless Entry",
    "Power Steering",
    "Heated Seats",
  ],
  "phones-tablets": [
    "Face ID / Fingerprint Scanner",
    "Fast Charging",
    "Wireless Charging",
    "Dual SIM",
    "5G",
    "Water Resistant",
    "NFC",
  ],
  electronics: ["Warranty Included", "Smart / WiFi Enabled", "Bluetooth", "Voice Control", "Energy Efficient"],
  "home-furniture-appliances": [
    "Assembly Required",
    "Extendable",
    "Water Resistant",
    "Energy Efficient",
    "Storage Included",
  ],
  property: [
    "Gated Community",
    "Swimming Pool",
    "CCTV Security",
    "Borehole / Water Supply",
    "Boys Quarters",
    "Air Conditioning",
    "Parking Space",
    "Fitted Kitchen",
  ],
};

/** Dynamic fields shown in the post-ad flow, keyed by top-level category slug.
 * Condition/Colour/Key Features/Exchange Possible are added to whichever categories
 * they make sense for (property skips Condition/Colour — see below). */
export const CATEGORY_FIELDS: Record<string, ListingFieldDef[]> = {
  vehicles: [
    { key: "make", label: "Make", type: "text", required: true },
    { key: "model", label: "Model", type: "text", required: true },
    { key: "year", label: "Year of Manufacture", type: "number", required: true },
    { key: "trim", label: "Trim", type: "text" },
    { key: "condition", label: "Condition", type: "select", options: CONDITION_3_TIER, required: true },
    { key: "color", label: "Colour", type: "select", options: COLOR_OPTIONS, required: true },
    { key: "interior_color", label: "Interior Color", type: "text" },
    { key: "body_type", label: "Body Type", type: "select", options: [
      "Sedan", "SUV", "Hatchback", "Coupe", "Convertible", "Wagon", "Station Wagon", "Pickup", "Van", "Minivan", "Truck", "Bus",
    ] },
    { key: "engine_size", label: "Engine Size", type: "select", options: [
      "1000cc", "1200cc", "1300cc", "1400cc", "1500cc", "1600cc", "1800cc", "2000cc", "2200cc", "2400cc", "2500cc", "3000cc", "3500cc", "4000cc", "4000cc+",
    ] },
    { key: "powertrain_type", label: "Powertrain Type", type: "select", options: ["Internal Combustion", "Hybrid", "Electric"] },
    { key: "fuel_type", label: "Fuel", type: "select", options: ["Petrol", "Diesel", "Electric", "Hybrid", "Mild Hybrid", "Plug-in Hybrid"] },
    {
      key: "transmission",
      label: "Transmission",
      type: "select",
      options: ["Automatic", "Manual"],
      required: true,
    },
    { key: "vin", label: "VIN / Chassis number", type: "text" },
    { key: "registered", label: "Registered Car", type: "boolean" },
    { key: "key_features", label: "Key Features", type: "tags", options: KEY_FEATURE_OPTIONS.vehicles },
    { key: "exchange_possible", label: "Exchange Possible", type: "boolean" },
  ],
  property: [
    {
      key: "property_type",
      label: "Property Type",
      type: "select",
      options: ["House", "Apartment", "Land", "Commercial"],
      required: true,
    },
    { key: "bedrooms", label: "Bedrooms", type: "number" },
    { key: "bathrooms", label: "Bathrooms", type: "number" },
    {
      key: "furnished",
      label: "Furnished",
      type: "select",
      options: ["Yes", "No", "Partly"],
    },
    // No Condition/Colour here on purpose — "New/Used" and a paint-swatch list don't
    // fit real estate the way they fit consumer goods.
    { key: "key_features", label: "Key Features", type: "tags", options: KEY_FEATURE_OPTIONS.property },
    { key: "exchange_possible", label: "Exchange Possible", type: "boolean" },
  ],
  "phones-tablets": [
    { key: "brand", label: "Brand", type: "text", required: true },
    { key: "storage", label: "Storage", type: "text" },
    {
      key: "condition",
      label: "Condition",
      type: "select",
      options: CONDITION_3_TIER,
      required: true,
    },
    { key: "color", label: "Colour", type: "select", options: COLOR_OPTIONS },
    { key: "key_features", label: "Key Features", type: "tags", options: KEY_FEATURE_OPTIONS["phones-tablets"] },
    { key: "exchange_possible", label: "Exchange Possible", type: "boolean" },
  ],
  electronics: [
    { key: "brand", label: "Brand", type: "text" },
    {
      key: "condition",
      label: "Condition",
      type: "select",
      options: CONDITION_3_TIER,
      required: true,
    },
    { key: "color", label: "Colour", type: "select", options: COLOR_OPTIONS },
    { key: "key_features", label: "Key Features", type: "tags", options: KEY_FEATURE_OPTIONS.electronics },
    { key: "exchange_possible", label: "Exchange Possible", type: "boolean" },
  ],
  "home-furniture-appliances": [
    { key: "material", label: "Material", type: "text" },
    {
      key: "condition",
      label: "Condition",
      type: "select",
      options: ["New", "Used"],
      required: true,
    },
    { key: "color", label: "Colour", type: "select", options: COLOR_OPTIONS },
    { key: "key_features", label: "Key Features", type: "tags", options: KEY_FEATURE_OPTIONS["home-furniture-appliances"] },
    { key: "exchange_possible", label: "Exchange Possible", type: "boolean" },
  ],
};

export function getFieldsForCategory(topLevelSlug: string | undefined): ListingFieldDef[] {
  if (!topLevelSlug) return [];
  return CATEGORY_FIELDS[topLevelSlug] ?? [];
}

/** The 1-2 most important attributes per category, surfaced as icon badges above the spec table. */
export const HEADLINE_FIELD_KEYS: Record<string, string[]> = {
  vehicles: ["condition", "transmission"],
  property: ["property_type", "furnished"],
  "phones-tablets": ["condition", "storage"],
  electronics: ["condition", "brand"],
  "home-furniture-appliances": ["condition", "material"],
};

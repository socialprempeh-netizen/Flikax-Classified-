export type ListingFieldType = "text" | "number" | "select" | "boolean";

export type ListingFieldDef = {
  key: string;
  label: string;
  type: ListingFieldType;
  options?: string[];
  required?: boolean;
};

/** Dynamic fields shown in the post-ad flow, keyed by top-level category slug. */
export const CATEGORY_FIELDS: Record<string, ListingFieldDef[]> = {
  vehicles: [
    { key: "make", label: "Make", type: "text", required: true },
    { key: "model", label: "Model", type: "text", required: true },
    { key: "year", label: "Year of Manufacture", type: "number", required: true },
    { key: "trim", label: "Trim", type: "text" },
    { key: "color", label: "Color", type: "text", required: true },
    { key: "interior_color", label: "Interior Color", type: "text" },
    {
      key: "condition",
      label: "Condition",
      type: "select",
      options: ["New", "Foreign Used", "Locally Used"],
      required: true,
    },
    {
      key: "transmission",
      label: "Transmission",
      type: "select",
      options: ["Automatic", "Manual"],
      required: true,
    },
    { key: "vin", label: "VIN / Chassis number", type: "text" },
    { key: "registered", label: "Registered Car", type: "boolean" },
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
  ],
  "phones-tablets": [
    { key: "brand", label: "Brand", type: "text", required: true },
    { key: "storage", label: "Storage", type: "text" },
    {
      key: "condition",
      label: "Condition",
      type: "select",
      options: ["New", "Foreign Used", "Locally Used"],
      required: true,
    },
  ],
  electronics: [
    { key: "brand", label: "Brand", type: "text" },
    {
      key: "condition",
      label: "Condition",
      type: "select",
      options: ["New", "Foreign Used", "Locally Used"],
      required: true,
    },
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

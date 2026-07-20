/** Cleans up a free-typed attribute value (e.g. listings.attributes.make) for display --
 * sellers type these by hand, so the raw data is inconsistently cased ("toyota") and
 * sometimes has the vehicle's model year accidentally typed into the make field itself
 * ("2026 Cadillac" instead of "Cadillac"). This is a display-layer fix rather than a data
 * migration: new listings keep whatever the seller typed, but everywhere this value is
 * shown or grouped (quick-filter icons, spec tables), it goes through this first. */
export function formatAttributeValue(raw: string): string {
  const withoutYearPrefix = raw.trim().replace(/^\d{4}\s+/, "");
  return withoutYearPrefix
    .split(/(\s|-)/)
    .map((part) => (part === " " || part === "-" ? part : titleCaseWord(part)))
    .join("");
}

function titleCaseWord(word: string): string {
  if (!word) return word;
  return word[0].toUpperCase() + word.slice(1).toLowerCase();
}

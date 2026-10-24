/**
 * Moroccan Secrets Riad - Brand Configuration
 * Single source of truth for brand names, descriptions and metadata.
 */

export const BRAND_NAME = "Moroccan Secrets Riad";
export const BRAND_SHORT = "Riad";
export const TAGLINE = "Dine with a Moroccan family in Marrakesh";
export const BRAND_DESCRIPTION =
  "Sit at a Moroccan family's table: share a traditional home-cooked meal, taste local dishes and discover authentic Moroccan traditions.";

export const BRAND_META = {
  name: BRAND_NAME,
  shortName: BRAND_SHORT,
  tagline: TAGLINE,
  description: BRAND_DESCRIPTION,
  themeColor: "#8B1A1A",
  backgroundColor: "#FDFCF9",
  twitterHandle: "@moroccansecrets",
} as const;

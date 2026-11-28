// ♟️ Constants

/**
 * Tag tree roots, never nested; keep to about ten.
 */
export const TAG_ROOT = {
  aspect: "Aspect",
  body: "Body",
  daily: "Daily",
  eclipse: "Eclipse",
  ingress: "Ingress",
  lunar: "Lunar",
  planetary: "Planetary",
  sign: "Sign",
  temporality: "Temporality",
  yearly: "Yearly",
} as const;

/** Raw tags every detector attaches, which tell no event apart from another. */
export const UNCLASSIFIED_RAW_TAGS = ["Astronomy", "Astrology"] as const;

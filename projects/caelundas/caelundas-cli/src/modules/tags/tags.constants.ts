// ♟️ Constants

/**
 * Tag tree roots, never nested; keep to about ten.
 */
export const TAG_ROOT = {
  aspect: "Aspect",
  body: "Body",
  daily: "Daily",
  duration: "Duration",
  eclipse: "Eclipse",
  lunar: "Lunar",
  planetary: "Planetary",
  sign: "Sign",
  solar: "Solar",
  temporality: "Temporality",
} as const;

/** Raw tags every detector attaches, which tell no event apart from another. */
export const UNCLASSIFIED_RAW_TAGS = ["Astronomy", "Astrology"] as const;

// ♟️ Constants

/**
 * Tag tree roots, one per caelundas-cli module group, never nested. Each
 * filter, group and sort menu opens on these, so keep them to about ten.
 */
export const TAG_ROOT = {
  aspect: "Aspect",
  body: "Body",
  daily: "Daily",
  eclipse: "Eclipse",
  lunar: "Lunar",
  planetary: "Planetary",
  solar: "Solar",
  temporality: "Temporality",
  zodiac: "Zodiac",
} as const;

/** Raw tags every detector attaches, which tell no event apart from another. */
export const UNCLASSIFIED_RAW_TAGS = ["Astronomy", "Astrology"] as const;

// ♟️ Constants

/** Sixteen orientation names: each corner, turned zero to three quarters. */
export const LETTER_ORIENTATION_NAMES = [
  "Southeast",
  "SoutheastQuarter",
  "SoutheastHalf",
  "SoutheastThreeQuarter",
  "Southwest",
  "SouthwestQuarter",
  "SouthwestHalf",
  "SouthwestThreeQuarter",
  "Northeast",
  "NortheastQuarter",
  "NortheastHalf",
  "NortheastThreeQuarter",
  "Northwest",
  "NorthwestQuarter",
  "NorthwestHalf",
  "NorthwestThreeQuarter",
] as const;

/** Script drawn as glyph templates, facing its base corner. */
export const LETTER_SCRIPTS = {
  Arabic: { baseCorner: "Southwest" },
  Greek: { baseCorner: "Southeast" },
  Hangul: { baseCorner: "Southeast" },
  Hanzi: { baseCorner: "Southeast" },
  Hebrew: { baseCorner: "Southwest" },
  Katakana: { baseCorner: "Southeast" },
  Latin: { baseCorner: "Southeast" },
} as const;

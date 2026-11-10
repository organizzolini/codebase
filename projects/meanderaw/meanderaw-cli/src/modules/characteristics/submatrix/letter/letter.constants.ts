// ♟️ Constants

/**
 * The sixteen orientation names every letter is keyed by, each corner unturned
 * then turned a quarter, a half, and three quarters clockwise.
 */
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

/**
 * Every script drawn as glyph templates, with the corner its glyphs face before any flip.
 * Defines `LetterScript`.
 */
export const LETTER_SCRIPTS = {
  Arabic: { baseCorner: "Southwest" },
  Greek: { baseCorner: "Southeast" },
  Hangul: { baseCorner: "Southeast" },
  Hanzi: { baseCorner: "Southeast" },
  Hebrew: { baseCorner: "Southwest" },
  Katakana: { baseCorner: "Southeast" },
  Latin: { baseCorner: "Southeast" },
} as const;

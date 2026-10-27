import {
  DEFAULT_OPTIONS,
  STAR_GLOW_DEFINITION,
} from "./use-night-sky.constants";

// 🔖 Constants

// Three or six hexadecimal digits, with or without the leading `#`, which a
// link can only carry as `%23`.
const COLOR_DIGITS_PATTERN = /^#?(?:[\da-f]{3}|[\da-f]{6})$/iu;

// 🌎 Public Functions

/**
 * Builds the SVG definitions: the vertical gradient of the sky's background
 * and the glow of the brightest stars. The colors are read as hexadecimal
 * and written as `#rrggbb`, so nothing else can reach the markup.
 */
export function formatSkyDefinitions(
  topColor: string,
  bottomColor: string,
): string {
  return (
    '<defs><linearGradient id="sky-background" x1="0" y1="0" x2="0" y2="1">' +
    `<stop offset="0" stop-color="${normalizeHexColor(topColor, DEFAULT_OPTIONS.backgroundTopColor)}"/>` +
    `<stop offset="1" stop-color="${normalizeHexColor(bottomColor, DEFAULT_OPTIONS.backgroundBottomColor)}"/>` +
    `</linearGradient>${STAR_GLOW_DEFINITION}</defs>`
  );
}

/**
 * Reads a hexadecimal color of three or six digits, with or without the `#`,
 * as lowercase `#rrggbb`, or answers the fallback for anything else.
 */
export function normalizeHexColor(value: unknown, fallback: string): string {
  const text = typeof value === "number" ? String(value) : value;

  if (typeof text !== "string" || !COLOR_DIGITS_PATTERN.test(text)) {
    return fallback;
  }

  const digits = text.replace("#", "").toLowerCase();
  const full =
    digits.length === 3
      ? Array.from(digits, (digit) => `${digit}${digit}`).join("")
      : digits;

  return `#${full}`;
}

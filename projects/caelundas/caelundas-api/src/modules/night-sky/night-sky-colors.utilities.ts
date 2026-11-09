import {
  COLOR_DIGITS_PATTERN,
  DEFAULT_OPTIONS,
  STAR_GLOW_DEFINITION,
} from "./night-sky.constants";

// 🌎 Public Functions

/**
 * Builds the sky background gradient and bright-star glow definitions; colors
 * are normalized to `#rrggbb`, so nothing else reaches the markup.
 */
export function formatSkyDefinitions(
  topColor: string,
  bottomColor: string,
): string {
  return (
    '<defs><linearGradient id="sky-background" x1="0" y1="0" x2="0" y2="1">' +
    `<stop offset="0" stop-color="${normalizeHexadecimalColor(topColor, DEFAULT_OPTIONS.backgroundTopColor)}"/>` +
    `<stop offset="1" stop-color="${normalizeHexadecimalColor(bottomColor, DEFAULT_OPTIONS.backgroundBottomColor)}"/>` +
    `</linearGradient>${STAR_GLOW_DEFINITION}</defs>`
  );
}

/**
 * Reads a three- or six-digit hexadecimal color as lowercase `#rrggbb`, else the
 * fallback. Never a number: the router turns `1e5` into one.
 */
export function normalizeHexadecimalColor(
  value: unknown,
  fallback: string,
): string {
  if (typeof value !== "string" || !COLOR_DIGITS_PATTERN.test(value)) {
    return fallback;
  }

  const digits = value.replace("#", "").toLowerCase();
  const full =
    digits.length === 3
      ? Array.from(digits, (digit) => `${digit}${digit}`).join("")
      : digits;

  return `#${full}`;
}

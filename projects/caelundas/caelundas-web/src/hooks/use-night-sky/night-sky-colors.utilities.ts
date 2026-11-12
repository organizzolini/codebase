import { COLOR_DIGITS_PATTERN } from "./night-sky.constants";

// 🌎 Public Functions

/**
 * Reads a three or six digit hexadecimal color as lowercase `#rrggbb`, or the fallback; a number is never read.
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

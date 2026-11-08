import { COLOR_DIGITS_PATTERN } from "./night-sky.constants";

// 🌎 Public Functions

/**
 * Reads a hexadecimal color of three or six digits, with or without the `#`,
 * as lowercase `#rrggbb`, or answers the fallback for anything else. A number
 * is never read: the router turns `1e5` into one, and what it meant is gone.
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

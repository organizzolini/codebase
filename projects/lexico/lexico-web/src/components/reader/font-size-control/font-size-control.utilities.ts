import { FONT_SIZE_KEY, FONT_SIZES } from "./font-size-control.constants";

import type { FontSize } from "./font-size-control.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * The font size this browser chose, or undefined when none or storage fails.
 */
export function readFontSize(): FontSize | undefined {
  try {
    const stored = globalThis.localStorage.getItem(FONT_SIZE_KEY);

    return FONT_SIZES.find((size) => size === stored);
  } catch {
    return undefined;
  }
}

/**
 * The size one step up or down, staying at the end of the range.
 */
export function stepFontSize(size: FontSize, step: -1 | 1): FontSize {
  const next = FONT_SIZES.indexOf(size) + step;

  return FONT_SIZES[next] ?? size;
}

/**
 * Remembers the chosen size in this browser, if storage allows.
 */
export function writeFontSize(size: FontSize): void {
  try {
    globalThis.localStorage.setItem(FONT_SIZE_KEY, size);
  } catch {
    // Storage is unavailable or full: the size lasts until reload.
  }
}

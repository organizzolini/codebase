import { NAME_TINT_PERCENT } from "./table-name-cell.constants";

import type { CSSProperties } from "react";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * The tint of a colored event's name, as the calendar's chips draw it; none without a color.
 */
export function getNameTint(
  color: null | string,
  percent: number = NAME_TINT_PERCENT,
): CSSProperties | undefined {
  if (color === null) {
    return undefined;
  }

  return {
    background: `color-mix(in oklab, ${color} ${String(percent)}%, hsl(var(--background)))`,
  };
}

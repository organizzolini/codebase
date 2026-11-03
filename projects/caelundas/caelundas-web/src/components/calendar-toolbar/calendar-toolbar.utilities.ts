import type { ReactNode } from "react";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * Whether a slot the page handed the toolbar holds anything to draw.
 */
export function hasContent(node: ReactNode): boolean {
  return node !== undefined && node !== null;
}

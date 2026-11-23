import { isValidElement } from "react";

import type { ReactNode } from "react";

// 🔏 Private Functions

// 🌎 Public Functions

/** The key of a card, empty for text. */
export function keyOf(card: ReactNode): string {
  return isValidElement(card) ? String(card.key) : "";
}

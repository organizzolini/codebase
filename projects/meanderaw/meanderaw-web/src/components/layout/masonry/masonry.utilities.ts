import { isValidElement } from "react";

import type { ReactNode } from "react";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * Deals items round-robin into columns, so the first sit side by side.
 */
export function dealColumns<T>(items: readonly T[], count: number): T[][] {
  const columns: T[][] = Array.from({ length: Math.max(1, count) }, () => []);

  for (const [index, item] of items.entries()) {
    columns[index % columns.length]?.push(item);
  }

  return columns;
}

/**
 * The key of a card, empty for text.
 */
export function keyOf(card: ReactNode): string {
  return isValidElement(card) ? String(card.key) : "";
}

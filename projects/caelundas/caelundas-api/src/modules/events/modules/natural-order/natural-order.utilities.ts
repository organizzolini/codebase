import { NATURAL_COLLATOR } from "../../events.constants";

import type { OrderedName } from "./natural-order.types";

// 🌎 Public Functions

/**
 * Orders paths level by level, by `order` then name with digits as numbers, so "Harmonic 2" precedes "Harmonic 10".
 */
export function compareOrderedPaths(
  left: readonly OrderedName[],
  right: readonly OrderedName[],
): number {
  for (const [index, { name, order }] of left.entries()) {
    const other = right[index];

    if (other === undefined) {
      return 1;
    }

    const result =
      order - other.order || NATURAL_COLLATOR.compare(name, other.name);

    if (result !== 0) {
      return result;
    }
  }

  return left.length === right.length ? 0 : -1;
}

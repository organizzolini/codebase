import { NATURAL_COLLATOR } from "../../events.constants";

import type { RankedName } from "./natural-order.types";

// 🌎 Public Functions

/**
 * Orders paths level by level, by `rank` then name with digits as numbers, so "Harmonic 2" precedes "Harmonic 10".
 */
export function compareRankedPaths(
  left: readonly RankedName[],
  right: readonly RankedName[],
): number {
  for (const [index, { name, rank }] of left.entries()) {
    const other = right[index];

    if (other === undefined) {
      return 1;
    }

    const result =
      rank - other.rank || NATURAL_COLLATOR.compare(name, other.name);

    if (result !== 0) {
      return result;
    }
  }

  return left.length === right.length ? 0 : -1;
}

// 🏷️ Types

import type { RefObject as ReferenceObject } from "react";

/**
 * The reference to put on the element holding the tree.
 */
export interface UseScrollExpandedToTopResult {
  /** Goes on the element holding the tree and its search. */
  reference: ReferenceObject<HTMLDivElement | null>;
}

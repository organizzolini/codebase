// 🏷️ Types

import type { RefObject as ReferenceObject } from "react";

/**
 * Whether an item opens or closes a line of the strip.
 */
export interface StripLineFlags {
  isEnd: boolean;
  isStart: boolean;
}

/**
 * The reference to put on the strip's element.
 */
export interface UseStripLinesResult {
  reference: ReferenceObject<HTMLDivElement | null>;
}

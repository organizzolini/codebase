// 🏷️ Types

import type { PatternCharacteristicKey } from "../characteristics/characteristics.types";
import type { Meander, MeanderPatternShapeCount } from "@codebase/meanderaw-db";

/** One page's HTML, read lazily or already in hand. */
export type MeanderPageContent = AsyncIterable<string> | Iterable<string>;

/** Per-shape counts known up front; pattern rows in page order. */
export interface MeanderPageSource {
  readonly counts: readonly MeanderPatternShapeCount[];
  rows(key: PatternCharacteristicKey): MeanderRowBatches;
}

/** One pattern's rows in page order, read lazily. */
export type MeanderRowBatches =
  | AsyncIterable<readonly Meander[]>
  | Iterable<readonly Meander[]>;

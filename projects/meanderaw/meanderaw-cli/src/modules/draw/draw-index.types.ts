// 🏷️ Types

import type { PatternCharacteristicKey } from "../characteristics/characteristics.types";
import type { MeanderPatternShapeCount } from "../database/database.types";
import type { Meander } from "../database/entities/meander.entity";

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

// 🏷️ Types

import type { PatternCharacteristicKey } from "../characteristics/characteristics.types";
import type { MeanderPatternShapeCount } from "../database/database.types";
import type { Meander } from "../database/entities/meander.entity";

/**
 * One page's HTML, a piece at a time, read lazily from the database or already in hand.
 */
export type MeanderPageContent = AsyncIterable<string> | Iterable<string>;

/**
 * Where the pages' rows come from: per-shape counts known before any row is
 * read, and each pattern's rows in page order.
 */
export interface MeanderPageSource {
  readonly counts: readonly MeanderPatternShapeCount[];
  rows(key: PatternCharacteristicKey): MeanderRowBatches;
}

/** One pattern's rows in page order, a batch at a time, read lazily or already in hand. */
export type MeanderRowBatches =
  | AsyncIterable<readonly Meander[]>
  | Iterable<readonly Meander[]>;

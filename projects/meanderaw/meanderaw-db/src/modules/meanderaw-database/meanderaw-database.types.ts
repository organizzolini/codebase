// 🏷️ Types

import type { Characteristic } from "./entities/characteristic.entity";
import type { Meander } from "./entities/meander.entity";
import type { PostgresqlUpdatableEntity } from "@codebase/persistence";

/** A catalog row, minus the columns the database owns. */
export type CharacteristicRecord = Omit<Characteristic, "id" | "meanderCount">;

/** A meander row with the booleans it holds. */
export type MeanderHolding = Meander & {
  readonly characteristics: StoredCharacteristicValues;
};

/** How many rows one pattern characteristic holds for at one shape. */
export interface MeanderPatternShapeCount {
  readonly columns: number;
  readonly count: number;
  readonly key: string;
  readonly rows: number;
}

/** A meander row's own fields, plus its characteristics by key. */
export type MeanderRecord = Omit<Meander, keyof PostgresqlUpdatableEntity> & {
  readonly characteristics: StoredCharacteristicValues;
};

/** How wide and how deep one repeat is. */
export interface MeanderShape {
  readonly columns: number;
  readonly rows: number;
}

/** A stored value: a number above 0, or `true`. */
export type StoredCharacteristicValues = Readonly<
  Record<string, number | true>
>;

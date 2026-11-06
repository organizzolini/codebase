import moment from "moment-timezone";

import { COORDINATE_SCALE } from "./caelundas-database.constants";

import type { Moment } from "moment-timezone";
import type { ValueTransformer } from "typeorm";

// 🌎 Utilities

/**
 * Carries a `bigint` column as the `number` the code works in. Postgres
 * migrations here prefer `bigint` over `integer`, and the driver sends a
 * `bigint` as text, so this reads that text back as a number; every value
 * the schema holds, such as a Hipparcos number or a tag's depth, is far
 * below the largest safe integer. A null or an undefined passes through.
 */
export function createBigintTransformer(): ValueTransformer {
  return {
    from: (value?: null | string): null | number | undefined =>
      value === null || value === undefined ? value : Number(value),
    to: (value?: null | number): null | number | undefined => value,
  };
}

/**
 * Carries a `numeric` coordinate column as the string Postgres sends it as:
 * the driver returns `numeric` as text, to keep every digit, and this reads
 * that text back unchanged. A writer may give the coordinate as a number,
 * which is written fixed to {@link COORDINATE_SCALE} decimals, the
 * scale of the column, so the natural key compares the same value however it
 * was given. A null or an undefined passes through.
 */
export function createCoordinateTransformer(): ValueTransformer {
  return {
    from: (value?: null | string): null | string | undefined => value,
    to: (value?: null | number | string): null | string | undefined =>
      typeof value === "number" ? value.toFixed(COORDINATE_SCALE) : value,
  };
}

/**
 * Carries a `timestamptz` column as the `Moment` every detector and writer
 * works in: it writes the instant a moment, or a date inside a find operator,
 * names, and reads one back in UTC, so a stored event renders exactly as the
 * detected one did. A null or an undefined passes through.
 */
export function createMomentTransformer(): ValueTransformer {
  return {
    from: (value?: Date | null): Moment | null | undefined =>
      value === null || value === undefined ? value : moment.utc(value),
    to: (value?: Date | Moment | null): Date | null | undefined =>
      value === null || value === undefined
        ? value
        : moment.isMoment(value)
          ? value.toDate()
          : value,
  };
}

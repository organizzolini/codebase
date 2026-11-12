import moment from "moment-timezone";

import { COORDINATE_SCALE } from "./caelundas-database.constants";

import type { Moment } from "moment-timezone";
import type { ValueTransformer } from "typeorm";

// 🌎 Utilities

/**
 * Carries a `bigint` column as a number. Postgres sends it as text, and every stored value is far below the largest safe integer.
 */
export function createBigintTransformer(): ValueTransformer {
  return {
    from: (value?: null | string): null | number | undefined =>
      value === null || value === undefined ? value : Number(value),
    to: (value?: null | number): null | number | undefined => value,
  };
}

/**
 * Carries a `numeric` coordinate as the text Postgres sends, and writes a number fixed to {@link COORDINATE_SCALE} decimals so the key matches.
 */
export function createCoordinateTransformer(): ValueTransformer {
  return {
    from: (value?: null | string): null | string | undefined => value,
    to: (value?: null | number | string): null | string | undefined =>
      typeof value === "number" ? value.toFixed(COORDINATE_SCALE) : value,
  };
}

/**
 * Carries a `timestamptz` column as the `Moment` detectors and writers use, read back in UTC.
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

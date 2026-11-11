// ♟️ Constants

import type { ValueTransformer } from "typeorm";

/** Reads bigint columns as numbers; Postgres sends them as strings. */
export const BIGINT_NUMBER_TRANSFORMER = {
  from: (value: null | number | string): null | number =>
    value === null ? null : Number(value),
  to: (value: unknown): unknown => value,
} satisfies ValueTransformer;

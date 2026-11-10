// ♟️ Constants

import type { ValueTransformer } from "typeorm";

/**
 * Reads a `bigint` column as a number, since Postgres sends it as a string.
 * Writes, including find operators, pass through untouched.
 */
export const BIGINT_NUMBER_TRANSFORMER = {
  from: (value: null | number | string): null | number =>
    value === null ? null : Number(value),
  to: (value: unknown): unknown => value,
} satisfies ValueTransformer;

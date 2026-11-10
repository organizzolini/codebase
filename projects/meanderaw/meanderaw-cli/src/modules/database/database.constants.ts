import type { ValueTransformer } from "typeorm";

// ♟️ Constants

/**
 * How many rows `DatabaseService.saveAll` writes per statement.
 * Bounded so one statement stays under Postgres's 65,535 bind-parameter limit.
 */
export const MEANDER_INSERT_CHUNK_SIZE = 500;

/**
 * How many rows `DatabaseService.patternRows` reads at once.
 * Large enough to keep queries few, small enough to keep one batch's memory bounded.
 */
export const MEANDER_READ_BATCH_SIZE = 5000;

/**
 * Maps a Postgres `bigint` column to and from a `number`.
 * The `pg` driver returns it as a string; meander values never outgrow `number`.
 */
export const BIGINT_NUMBER_TRANSFORMER: ValueTransformer = {
  from: (value: null | string): null | number =>
    value === null ? null : Number(value),
  to: (value: null | number): null | number => value,
};

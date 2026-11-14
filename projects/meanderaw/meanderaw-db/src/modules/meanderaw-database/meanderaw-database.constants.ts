import type { ValueTransformer } from "typeorm";

// ♟️ Constants

/** The project whose `MEANDERAW_POSTGRES_*` variables, database, schema, and role every connection uses. */
export const MEANDERAW_PROJECT = "meanderaw";

/** Rows per `saveAll` statement, under Postgres's 65,535 bind-parameter limit. */
export const MEANDER_INSERT_CHUNK_SIZE = 500;

/** Rows `patternRows` reads at once: few queries, bounded memory. */
export const MEANDER_READ_BATCH_SIZE = 5000;

/** A Postgres `bigint` as `number`, which meanders never outgrow. */
export const BIGINT_NUMBER_TRANSFORMER: ValueTransformer = {
  from: (value: null | string): null | number =>
    value === null ? null : Number(value),
  to: (value: null | number): null | number => value,
};

import type { ValueTransformer } from "typeorm";

// ♟️ Constants

/** The project whose `MEANDERAW_POSTGRES_*` variables, database, schema, and role every connection uses. */
export const MEANDERAW_PROJECT = "meanderaw";

/** Rows per `saveAll` statement, under Postgres's 65,535 bind-parameter limit. */
export const MEANDER_INSERT_CHUNK_SIZE = 500;

/** Bridge rows per `INSERT`, carried as three arrays. */
export const CHARACTERISTIC_INSERT_CHUNK_SIZE = 50_000;

/** Rows `patternRows` reads at once: few queries, bounded memory. */
export const MEANDER_READ_BATCH_SIZE = 5000;

/** A Postgres `bigint` as `number`, which meanders never outgrow. */
export const BIGINT_NUMBER_TRANSFORMER: ValueTransformer = {
  from: (value: null | string): null | number =>
    value === null ? null : Number(value),
  to: (value: null | number): null | number => value,
};

/**
 * Thrown when a record holds a characteristic the catalog has no row for, so
 * its bridge row has no id to point at. The draw run syncs the catalog first.
 */
export class UnknownCharacteristicError extends Error {
  constructor(key: string) {
    super(
      `Characteristic "${key}" has no catalog row; sync the catalog before saving meanders that hold it`,
    );
    this.name = "UnknownCharacteristicError";
  }
}

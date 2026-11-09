// ♟️ Constants

import type { PartitionCounts } from "./literature.types";

/** A parent with no children counts nothing. */
export const EMPTY_PARTITION_COUNTS: PartitionCounts = {
  beforeCount: 0,
  totalCount: 0,
  windowCount: 0,
};

/**
 * Lowercase uuid an entity id cursor must carry, as Postgres returns uuids.
 * A malformed cursor is ignored rather than failing the query.
 */
export const ENTITY_ID_PATTERN =
  /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/u;

/**
 * The most ids one page load binds at once; Postgres rejects a statement with
 * more than 65,535 parameters.
 */
export const LOAD_CHUNK_SIZE = 1000;

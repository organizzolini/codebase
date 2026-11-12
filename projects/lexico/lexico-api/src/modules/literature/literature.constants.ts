// ♟️ Constants

import type { PartitionCounts } from "./literature.types";

/** A parent with no children counts nothing. */
export const EMPTY_PARTITION_COUNTS: PartitionCounts = {
  beforeCount: 0,
  totalCount: 0,
  windowCount: 0,
};

/** Lowercase uuid that id cursors carry; malformed ones are ignored. */
export const ENTITY_ID_PATTERN =
  /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/u;

/** Most ids one load binds, under Postgres's 65,535-parameter cap. */
export const LOAD_CHUNK_SIZE = 1000;

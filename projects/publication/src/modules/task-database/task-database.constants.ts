// ♟️ Constants

/**
 * What sits beside a database and belongs to it: the write-ahead log, the
 * shared-memory index, and the rollback journal. Every operation treats the
 * four files as one database.
 */
export const COMPANION_SUFFIXES: readonly string[] = [
  "-wal",
  "-shm",
  "-journal",
];

/** The `PRAGMA` whose answer is exactly `ok` for a sound database. */
export const INTEGRITY_QUERY = "PRAGMA integrity_check;";

/** Counts the task results a database holds. */
export const CACHED_RESULTS_QUERY = "SELECT count(*) FROM cache_outputs;";

/** Said of a count that could not be read. */
export const UNKNOWN_ROWS = "an unknown number of";

/** The marker every database name carries before its schema version. */
export const SCHEMA_MARKER = "-v";

export const NO_DATABASE_MESSAGE = "🪪 No Nx cache database was restored";

export const NO_MACHINE_ID_MESSAGE =
  "::warning::No machine id to adopt the Nx cache database under";

/** Reports a database that failed its integrity check, and its discard. */
export const corruptMessage = (database: string, result: string): string =>
  `::warning::Discarding corrupt cache (${database}): ${result}`;

/** Reports a restored database that cannot be renamed for want of a schema. */
export const noSchemaMessage = (name: string): string =>
  `::warning::Not adopting ${name}: no -v<schema> suffix to keep`;

/** Reports a database adopted under this machine's id. */
export const adoptedMessage = (
  restored: string,
  adopted: string,
  rows: string,
): string => `🪪 Adopted ${restored} as ${adopted} (${rows} cached results)`;

/** Reports that Nx wrote a database beside the adopted one. */
export const duplicateMessage = (
  kept: string,
  databases: readonly string[],
): string =>
  `::warning::Nx wrote a database beside the adopted one; keeping ${kept} of: ${databases.join(" ")}`;

/** Lists the tables a database holds. */
export const TABLES_QUERY =
  "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name;";

/** The tables a merge copies rows from, which a source must hold. */
export const MERGED_TABLES: readonly string[] = [
  "cache_outputs",
  "task_details",
];

/** Attaches the incoming database, its path bound as the one parameter. */
export const ATTACH_QUERY = "ATTACH DATABASE ? AS incoming;";

/** Inserts every incoming task and result this database lacks. */
export const MERGE_ROWS_QUERY = `
BEGIN;
INSERT OR IGNORE INTO task_details (hash, project, target, configuration)
  SELECT hash, project, target, configuration FROM incoming.task_details;
INSERT OR IGNORE INTO cache_outputs (hash, code, size, created_at, accessed_at)
  SELECT hash, code, size, created_at, accessed_at FROM incoming.cache_outputs;
COMMIT;
`;

export const NO_CACHE_DIRECTORY_REASON = "it has no cache directory";

export const NO_TASK_DATABASE_REASON = "it has no task database";

export const CORRUPT_REASON = "its task database is corrupt";

export const UNFAMILIAR_SCHEMA_REASON =
  "its task database has an unfamiliar schema";

/** Why two caches of different Nx schemas are not merged. */
export const schemaMismatchReason = (
  incoming: string,
  target: string,
): string => `its schema (${incoming}) differs from this cache's (${target})`;

/** Reports a merge skipped, and why. */
export const notMergingMessage = (source: string, reason: string): string =>
  `::warning::Not merging the Nx cache from ${source}: ${reason}`;

/** Reports a source taken whole, for want of a database to merge into. */
export const nothingToMergeIntoMessage = (source: string): string =>
  `🧩 Adopted the Nx cache from ${source}: nothing to merge into`;

/** Reports how many task results a merge added. */
export const mergedMessage = (added: number, before: number): string =>
  `🧩 Merged ${added} task results into the Nx cache (${before} before)`;

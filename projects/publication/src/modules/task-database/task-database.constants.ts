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

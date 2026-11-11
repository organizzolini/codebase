// ♟️ Constants

/**
 * The id every stand-in for a cluster starts with.
 */
export const CLUSTER_ID_PREFIX = "cluster:";

/**
 * Aspect kinds that merge; other kinds never do.
 */
export const CLUSTERED_KIND_PATHS: ReadonlySet<string> = new Set([
  "Type / Aspect / Compound Aspect",
  "Type / Aspect / Simple Aspect / Major Aspect",
  "Type / Aspect / Simple Aspect / Minor Aspect",
  "Type / Aspect / Simple Aspect / Specialty Aspect",
]);

/**
 * The least span a cluster of instants is drawn with.
 */
export const CLUSTER_MINIMUM_MILLISECONDS = 30 * 60_000;

export const MINUTE_MILLISECONDS = 60_000;

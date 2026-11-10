// ♟️ Constants

/**
 * The id every stand-in for a cluster starts with.
 */
export const CLUSTER_ID_PREFIX = "cluster:";

/**
 * Event kinds merged into one: the aspects, which differ only in the bodies they join. Others never merge.
 */
export const CLUSTERED_KIND_PATHS: ReadonlySet<string> = new Set([
  "Type / Aspect / Compound Aspect",
  "Type / Aspect / Simple Aspect / Major Aspect",
  "Type / Aspect / Simple Aspect / Minor Aspect",
  "Type / Aspect / Simple Aspect / Specialty Aspect",
]);

/**
 * The least span a cluster of instants is drawn with, so it has a body to
 * read.
 */
export const CLUSTER_MINIMUM_MILLISECONDS = 30 * 60_000;

export const MINUTE_MILLISECONDS = 60_000;

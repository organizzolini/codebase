// ♟️ Constants

/**
 * The id every stand-in for a cluster starts with.
 */
export const CLUSTER_ID_PREFIX = "cluster:";

/**
 * The kinds of event that are merged: the aspects, of which a busy day has
 * dozens that differ only in the bodies they join. Every other kind, such as
 * a twilight, a station or a cycle, is a different named event each time, and
 * is never merged.
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

// ♟️ Constants

/**
 * The id every stand-in for a cluster starts with.
 */
export const CLUSTER_ID_PREFIX = "cluster:";

/**
 * Kinds that merge, the aspects, the retrograde periods and the sign ingresses; other kinds never do.
 */
export const CLUSTERED_KIND_PATHS: ReadonlySet<string> = new Set([
  "Type / Aspect / Compound Aspect",
  "Type / Aspect / Simple Aspect / Major Aspect",
  "Type / Aspect / Simple Aspect / Minor Aspect",
  "Type / Aspect / Simple Aspect / Specialty Aspect",
  "Type / Ingress",
  "Type / Retrograde Period",
]);

/**
 * The least span a cluster of instants is drawn with.
 */
export const CLUSTER_MINIMUM_MILLISECONDS = 30 * 60_000;

export const MINUTE_MILLISECONDS = 60_000;

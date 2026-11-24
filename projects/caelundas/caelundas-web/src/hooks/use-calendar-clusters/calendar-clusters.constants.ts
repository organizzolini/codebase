// ♟️ Constants

/**
 * The id every stand-in for a cluster starts with.
 */
export const CLUSTER_ID_PREFIX = "cluster:";

/** Kinds that merge: aspects, retrograde periods, sign ingresses. */
export const CLUSTERED_KIND_PATHS: ReadonlySet<string> = new Set([
  "Aspect / Compound",
  "Aspect / Simple / Major",
  "Aspect / Simple / Minor",
  "Aspect / Simple / Specialty",
  "Planetary / Direction / Retrograde Period",
  "Zodiac / Ingress",
]);

/**
 * The least span a cluster of instants is drawn with.
 */
export const CLUSTER_MINIMUM_MILLISECONDS = 30 * 60_000;

export const MINUTE_MILLISECONDS = 60_000;

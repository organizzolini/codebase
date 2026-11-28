// ♟️ Constants

/**
 * The id every stand-in for a cluster starts with.
 */
export const CLUSTER_ID_PREFIX = "cluster:";

/**
 * The least span a cluster of instants is drawn with.
 */
export const CLUSTER_MINIMUM_MILLISECONDS = 30 * 60_000;

export const MINUTE_MILLISECONDS = 60_000;

/**
 * The group of an event no group is known for.
 */
export const NO_GROUP = { id: "none", key: null, label: "Other" } as const;

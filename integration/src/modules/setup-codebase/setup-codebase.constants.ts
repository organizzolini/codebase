// ♟️ Constants

/** The value of the on/off variables that switches a step on. */
export const ENABLED_VALUE = "true";

/** The `NX_BASE_SOURCE` that bases a push on its own previous tip. */
export const PUSH_BEFORE_SOURCE = "push-before";

/** The event of a push, whose base can be moved to the push's previous tip. */
export const PUSH_EVENT = "push";

/** The event of a merge group, which imports its pull request's Nx cache. */
export const MERGE_GROUP_EVENT = "merge_group";

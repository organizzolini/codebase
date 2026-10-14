// ♟️ Constants

/** How many registry calls `runInParallel` makes at once. */
export const PARALLEL_CALLS = 6;

/** The registry the release group is published to, unless overridden. */
export const DEFAULT_NPM_REGISTRY = "https://registry.npmjs.org";

/**
 * Lists each `<name>@<version>` the publish step put on npm in this run,
 * beneath `RUNNER_TEMP`, for the link step to attest.
 */
export const NEWLY_PUBLISHED_FILE = "newly-published.txt";

export const GROUP_UNREADABLE_MESSAGE =
  "❌ Could not read the Nx release group";

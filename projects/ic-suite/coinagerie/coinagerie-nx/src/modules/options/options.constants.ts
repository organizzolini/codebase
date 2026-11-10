// ♟️ Constants

/** Name this plugin is registered under in a workspace's `nx.json`. */
export const COINAGERIE_NX_PLUGIN_NAME = "@coinagerie/nx";

/**
 * Inferred check target name, when the registration names none. Prefixed like
 * other ic-suite targets, so Nx task lists group it.
 */
export const DEFAULT_CHECK_TARGET_NAME = "coinagerie-check";

/**
 * The command a check runs when the registration names none: the published
 * binary in `node_modules/.bin`. Workspaces running from source name their own.
 */
export const DEFAULT_COMMAND = "coinagerie";

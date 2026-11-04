// ♟️ Constants

/** Name this plugin is registered under in a workspace's `nx.json`. */
export const COINAGERIE_NX_PLUGIN_NAME = "@coinagerie/nx";

/**
 * Name of the inferred per-project check target, when the registration names
 * none.
 *
 * Prefixed, like every other ic-suite toolchain's inferred target, so that it
 * stays grouped and recognizable in Nx task lists and cannot collide with a
 * generic name in a workspace carrying several toolchains.
 */
export const DEFAULT_CHECK_TARGET_NAME = "coinagerie-check";

/**
 * The command a check runs, when the registration names none.
 *
 * The published binary, resolved from the workspace's `node_modules/.bin` the
 * way any package script's would be. A workspace that runs coinagerie from
 * source names its own command.
 */
export const DEFAULT_COMMAND = "coinagerie";

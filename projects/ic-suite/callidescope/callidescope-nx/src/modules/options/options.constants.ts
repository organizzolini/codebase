// ♟️ Constants

/** Name this plugin is registered under in a workspace's `nx.json`. */
export const CALLIDESCOPE_NX_PLUGIN_NAME = "@callidescope/nx";

/**
 * Names of the inferred per-project targets, when the registration names none.
 *
 * Prefixed defaults keep inferred tasks grouped and recognizable in Nx task
 * lists, and avoid collisions with generic names in workspaces carrying
 * several toolchains.
 *
 * Every one of them is overridable from the `nx.json` registration.
 */
export const DEFAULT_TRACE_TARGET_NAME = "callidescope-trace";

/** Name of the inferred per-project depth-lookup target. */
export const DEFAULT_DEPTH_TARGET_NAME = "callidescope-depth";

/** Name of the inferred per-project breadth-lookup target. */
export const DEFAULT_BREADTH_TARGET_NAME = "callidescope-breadth";

/**
 * Name of the inferred per-project gate target.
 *
 * Named after what it decides rather than after what it measures. `trace`,
 * `depth`, and `breadth` all print something a reader asked for; this one is
 * the target here a pipeline is meant to read an exit code from, so it says
 * `gate`.
 */
export const DEFAULT_GATE_TARGET_NAME = "callidescope-gate";

/** Names the plugin option in a refusal of a missing configuration path. */
export const PLUGIN_CONFIGURATION_SURFACE = `The "configurationPath" option in the nx.json registration of ${CALLIDESCOPE_NX_PLUGIN_NAME}`;

/** Names the executor option in a refusal of a missing configuration path. */
export const EXECUTOR_CONFIGURATION_SURFACE =
  'The "configuration" executor option';

/** Marks a project as one whose directory holds a TypeScript program. */
export const PROJECT_PROGRAM_FILENAME = "tsconfig.json";

/**
 * Root of the workspace-level project, which is skipped during inference.
 *
 * Every other project sits inside it, so a target there would trace the whole
 * workspace under one uncacheable task — which is what the workspace-wide
 * `callidescope` target already does.
 */
export const WORKSPACE_PROJECT_ROOT = ".";

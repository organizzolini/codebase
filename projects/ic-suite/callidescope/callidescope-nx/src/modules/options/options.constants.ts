// ♟️ Constants

/** Name this plugin is registered under in a workspace's `nx.json`. */
export const CALLIDESCOPE_NX_PLUGIN_NAME = "@callidescope/nx";

/** Default inferred target names; prefixed to group and avoid collisions. */
export const DEFAULT_TRACE_TARGET_NAME = "callidescope-trace";

/** Name of the inferred per-project depth-lookup target. */
export const DEFAULT_DEPTH_TARGET_NAME = "callidescope-depth";

/** Name of the inferred per-project breadth-lookup target. */
export const DEFAULT_BREADTH_TARGET_NAME = "callidescope-breadth";

/** Inferred gate target, named for its verdict, which pipelines read. */
export const DEFAULT_GATE_TARGET_NAME = "callidescope-restrict";

/** Names the plugin option in a refusal of a missing configuration path. */
export const PLUGIN_CONFIGURATION_SURFACE = `The "configurationPath" option in the nx.json registration of ${CALLIDESCOPE_NX_PLUGIN_NAME}`;

/** Names the executor option in a refusal of a missing configuration path. */
export const EXECUTOR_CONFIGURATION_SURFACE =
  'The "configuration" executor option';

/** Marks a project as one whose directory holds a TypeScript program. */
export const PROJECT_PROGRAM_FILENAME = "tsconfig.json";

/** Workspace-root project, skipped: a target there would trace everything. */
export const WORKSPACE_PROJECT_ROOT = ".";

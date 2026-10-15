// ♟️ Constants

/** The plugin's package name, used to find its entry in `nx.json`. */
export const CONFORMETRY_NX_PLUGIN_NAME = "@conformetry/nx";

/**
 * Refusal for a registration that names no configuration path.
 *
 * There is no default file and no filename search: the path is the one thing
 * the plugin cannot infer.
 */
export const MISSING_CONFIGURATION_PATH_MESSAGE =
  'The "configurationPath" option of the @conformetry/nx plugin is required. Set it in the plugin entry of nx.json, e.g. { "plugin": "@conformetry/nx", "options": { "configurationPath": "path/to/conformetry.config.ts" } }.';

/** Filename the workspace's Nx configuration is read from. */
export const NX_CONFIGURATION_FILENAME = "nx.json";

/** Name of the validation target inferred onto every in-scope project. */
export const DEFAULT_VALIDATE_TARGET_NAME = "conformetry-validate";

/**
 * Option names that configure this plugin rather than a generator.
 *
 * Everything else a consumer passes is treated as a template substitution.
 */
export const PLUGIN_OPTION_NAMES = ["configurationPath", "validateTargetName"];

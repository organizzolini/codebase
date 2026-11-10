// ♟️ Constants

/** The plugin's package name, used to find its entry in `nx.json`. */
export const CONFORMETRY_NX_PLUGIN_NAME = "@conformetry/nx";

/**
 * How a refusal names the plugin option in `nx.json`. The configuration layer owns
 * the requirement and its wording; this is only the name.
 */
export const PLUGIN_OPTION_SURFACE =
  'the "configurationPath" option of the @conformetry/nx plugin in nx.json';

/**
 * How a refusal names the executor and generator option.
 *
 * Those run with the registration as their fallback, so it is named too.
 */
export const EXECUTION_OPTION_SURFACE = `the "configuration" option, or ${PLUGIN_OPTION_SURFACE},`;

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

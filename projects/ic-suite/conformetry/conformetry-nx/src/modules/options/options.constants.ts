// ♟️ Constants

/** The plugin's package name, used to find its entry in `nx.json`. */
export const CONFORMETRY_NX_PLUGIN_NAME = "@conformetry/nx";

/** Plugin option name in refusals; configuration owns the wording. */
export const PLUGIN_OPTION_SURFACE =
  'the "configurationPath" option of the @conformetry/nx plugin in nx.json';

/** Option name for executors and generators, falling back to registration. */
export const EXECUTION_OPTION_SURFACE = `the "configuration" option, or ${PLUGIN_OPTION_SURFACE},`;

/** Filename the workspace's Nx configuration is read from. */
export const NX_CONFIGURATION_FILENAME = "nx.json";

/** Name of the validation target inferred onto every in-scope project. */
export const DEFAULT_VALIDATE_TARGET_NAME = "conformetry-validate";

/** Option names configuring this plugin; all others are template substitutions. */
export const PLUGIN_OPTION_NAMES = ["configurationPath", "validateTargetName"];

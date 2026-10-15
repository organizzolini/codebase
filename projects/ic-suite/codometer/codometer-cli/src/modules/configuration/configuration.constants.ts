// ♟️ Constants

/** Output formats the command renders. */
export const CONFIGURATION_FORMATS = ["json", "markdown"] as const;

/** Format used when the command line names none. */
export const DEFAULT_CONFIGURATION_FORMAT = "markdown";

/** Why a run with no `--config` is refused. */
export const MISSING_CONFIG_MESSAGE =
  "--config <path> is required: codometer never searches for or assumes a configuration file. Pass the path to a codometer configuration file, such as --config codometer.config.ts.";

// ♟️ Constants

/**
 * The codometer command line, relative to the workspace root, run from source under the swc hook.
 */
export const CODOMETER_CLI_MAIN =
  "projects/ic-suite/codometer/codometer-cli/src/codometer-cli.main.ts";

/** The tsconfig the swc hook reads, relative to the workspace root. */
export const CODOMETER_TSCONFIG = "configuration/tsconfig.json";

/** The pino level that logs nothing. */
export const SILENT_LOG_LEVEL = "silent";

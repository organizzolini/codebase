// ♟️ Constants

/** Dependency directory, never workspace code, so never widens a closure. */
export const DEPENDENCY_DIRECTORY_NAME = "node_modules";

/** Why a requested trace directory was unusable. */
export const MISSING_PROJECT_CONFIGURATION_MESSAGE =
  "the directory holds no tsconfig.json";

// 🚨 Errors

/**
 * Raised when a project's `tsconfig.json` is missing or cannot be read.
 *
 * Fatal to the whole run, not skipped, since a report is written before its
 * findings are weighed.
 *
 * Excluded projects are dropped instead.
 */
export class ProgramConfigurationError extends Error {
  constructor(args: { configurationPath: string; messages: string[] }) {
    super(
      `Could not read ${args.configurationPath}: ${args.messages.join("; ")}`,
    );
    this.name = "ProgramConfigurationError";
  }
}

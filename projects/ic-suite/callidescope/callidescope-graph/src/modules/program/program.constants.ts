// ♟️ Constants

/** Directory a dependency's sources sit under. Such paths are not workspace code, so they must never widen a closure. */
export const DEPENDENCY_DIRECTORY_NAME = "node_modules";

/** Says what was wrong with a directory a run was told to trace. */
export const MISSING_PROJECT_CONFIGURATION_MESSAGE =
  "the directory holds no tsconfig.json";

// 🚨 Errors

/**
 * Raised when a project's `tsconfig.json` is missing or cannot be read.
 *
 * Fatal to the whole run rather than skipped, since a report is written before its
 * findings are weighed. Stepping over a project would commit wrong numbers first.
 *
 * A project that should not be read at all is dropped by an exclusion instead.
 */
export class ProgramConfigurationError extends Error {
  constructor(args: { configurationPath: string; messages: string[] }) {
    super(
      `Could not read ${args.configurationPath}: ${args.messages.join("; ")}`,
    );
    this.name = "ProgramConfigurationError";
  }
}

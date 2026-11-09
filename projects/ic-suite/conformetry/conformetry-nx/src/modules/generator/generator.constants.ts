// ♟️ Constants

/**
 * Emitted plugin location. Gitignored: the plugin is derived, so committed edits
 * would be silently reverted by the next emit.
 */
export const DEFAULT_OUTPUT_PATH = ".conformetry/nx-generators";

/**
 * Header warning that a file is emitted and will be overwritten. Two commands
 * write it: the postinstall bootstrap and `nx sync`.
 */
export const GENERATED_FILE_NOTICE =
  "// Generated from the conformetry configuration. Do not edit.";

/** Message `nx sync:check` prints when the emitted plugin is stale. */
export const OUT_OF_SYNC_MESSAGE =
  "The conformetry generator plugin is out of sync with the conformetry configuration.";

/** Indent width for emitted JSON, matching the workspace formatter. */
export const JSON_INDENT = 2;

/**
 * Unscoped name typed on every invocation. Nx resolves it by package name, so it
 * cannot collide with the `conformetry` project.
 */
export const DEFAULT_PACKAGE_NAME = "conformetry";

/** The JSON schema editors validate an emitted `generators.json` against. */
export const GENERATORS_SCHEMA_PATH =
  "node_modules/@nx/devkit/src/generators/generators-schema.json";

/** The only parent environment variables a sandboxed command inherits. */
export const INHERITED_ENVIRONMENT_KEYS: readonly string[] = [
  "HOME",
  "LANG",
  "LC_ALL",
  "PATH",
  "TMPDIR",
  "USER",
];

/** How long a sandboxed command may run before it is stopped. */
export const DEFAULT_COMMAND_TIMEOUT_MS = 120_000;

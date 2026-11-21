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

/** Node's warning lines, with the hint that follows them. */
export const NODE_WARNING_PATTERN =
  /\(node:\d+\) (?:\[[A-Z]+\d+\] )?\w*Warning: [^\n]*\n?|\(Use `node --[\w-]+ \.\.\.` to show where the warning was created\)\n?/gu;

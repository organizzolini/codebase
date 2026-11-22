// 🛠️ Utilities

/**
 * Prefixes `measure` when no command is named, since Commander will not infer one.
 * Bare help flags are left alone.
 */
export function withDefaultCommand(argv: readonly string[]): string[] {
  const commandNames = new Set(["changes", "configuration", "help", "measure"]);
  const helpFlags = new Set(["--help", "-h"]);
  const [firstArgument] = argv;

  if (
    firstArgument !== undefined &&
    (commandNames.has(firstArgument) || helpFlags.has(firstArgument))
  ) {
    return [...argv];
  }

  return ["measure", ...argv];
}

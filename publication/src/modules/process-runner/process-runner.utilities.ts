import type { CapturedProcess } from "./process-runner.types";

/**
 * Says what went wrong, from anything a failed step threw.
 *
 * @param error - What was thrown.
 * @returns Its message, or the thing itself as text.
 */
export function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Returns what a finished process printed, or fails the way `set -e` failed
 * the shell scripts these commands replace: at once, naming the command.
 *
 * @param result - The finished process.
 * @param commandLine - The command line, as the error names it.
 * @returns Its standard output.
 */
export function requireSuccess(
  result: CapturedProcess,
  commandLine: string,
): string {
  if (result.status !== 0) {
    const detail = result.stderr.trim();

    throw new Error(
      `❌ ${commandLine} exited ${String(result.status)}${detail === "" ? "" : `: ${detail}`}`,
    );
  }

  return result.stdout;
}

/**
 * Fails, naming the variable, when a required input is unset or empty, as
 * the shell scripts' `${NAME:?}` did.
 *
 * @param name - The variable's name.
 * @param value - Its value, if any.
 * @returns The value.
 */
export function requireVariable(
  name: string,
  value: string | undefined,
): string {
  if (value === undefined || value === "") {
    throw new Error(`❌ ${name} is unset`);
  }

  return value;
}

import type { CapturedProcess } from "./process-runner.types";

/**
 * Says what went wrong, from anything a failed step threw.
 * @returns Its message, or the thrown value as text.
 */
export function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Returns a finished process's stdout, or throws naming the failed command,
 * as `set -e` did in the shell scripts these commands replace.
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
 * Returns a required variable's value, or fails naming it when unset or
 * empty, as the shell scripts' `${NAME:?}` did.
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

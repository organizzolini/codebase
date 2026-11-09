import type { CapturedProcess } from "./process-runner.types";

/** Says what went wrong, from anything a failed step threw. */
export function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Returns what a finished process printed, or throws naming the command, as
 * `set -e` did in the old shell scripts.
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
 * Returns a required input, failing with its name when it is unset or empty.
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

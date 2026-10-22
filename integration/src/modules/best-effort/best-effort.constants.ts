// ♟️ Constants

/** How many of a failed step's last lines the pull request quotes. */
export const TAIL_LINES = 20;

/** The most characters of them it quotes, so one runaway line cannot flood it. */
export const TAIL_CHARACTERS = 2000;

/** The directory a snapshot is copied into, before the system adds a suffix. */
export const SNAPSHOT_PREFIX = "best-effort-snapshot-";

/** The shell options a step's script runs under: stop at the first failure. */
export const SCRIPT_OPTIONS = ["-e", "-o", "pipefail", "-c"] as const;

/** Printed when the environment names no step to run. */
export const RUN_UNSET_MESSAGE =
  "BEST_EFFORT_RUN must hold the script this step runs.";

/** Printed when the environment gives the step no name. */
export const LABEL_UNSET_MESSAGE =
  "BEST_EFFORT_LABEL must name this step, so the pull request can list it when it is skipped.";

/** The workflow annotation that makes a skipped step show on the run page. */
export const skippedAnnotation = (label: string, exitCode: number): string =>
  `::warning title=${label} skipped::Exited ${String(exitCode)}; its files were restored and the run carried on.`;

/** Printed when a failed step's files could not be put back. */
export const unrestoredMessage = (label: string, reason: string): string =>
  `${label} failed and its files could not be restored (${reason}); stopping so a half-applied change is not committed.`;

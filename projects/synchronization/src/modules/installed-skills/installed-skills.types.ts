// 🏷️ Types

/** How the fake `skills` and `git` behave in one test. */
export interface FakeProcessBehavior {
  /** Whether a restore leaves a lockfile behind that does not parse. */
  readonly corruptsLockfile?: boolean;
  /** Whether `git` reports changes to the lockfile after a restore. */
  readonly dirtiesLockfile?: boolean;
  /** Whether `git` reports changes under `.agents/skills` after a restore. */
  readonly dirtiesSkillFolders?: boolean;
  /** Whether the lockfile already had uncommitted changes. */
  readonly lockfileDirtyBefore?: boolean;
  /** Whether the workspace is a git work tree at all. */
  readonly outsideWorkTree?: boolean;
  /** Whether a restore fails outright, as on a network outage. */
  readonly restoreFails?: boolean;
  /** Whether neither `skills` nor `pnpm` can be started. */
  readonly skillsUnavailable?: boolean;
}

/** A process runner that records what it was asked and fakes the outcome. */
export interface FakeProcessRunner {
  readonly commands: string[];
  readonly run: (command: ProcessCommand) => ProcessResult;
}

/**
 * Which locked skills are absent from disk, or why that could not be told.
 *
 * "Nothing is missing" and "nothing could be read" are different answers, so
 * they are different variants rather than one empty list.
 */
export type MissingSkillsResult =
  | { readonly kind: "no-lockfile" }
  | { readonly kind: "read"; readonly missing: readonly string[] }
  | { readonly kind: "unreadable"; readonly reason: string };

/** One process to run in the workspace root. */
export interface ProcessCommand {
  readonly args: readonly string[];
  readonly executable: string;
  /**
   * Whether the process prints straight to this one's terminal. A restore is
   * slow and its progress is worth seeing; a `git` query is not.
   */
  readonly streamOutput?: boolean;
}

/** How one process ended. */
export interface ProcessResult {
  /** False when the executable could not be started at all. */
  readonly available: boolean;
  readonly status: null | number;
}

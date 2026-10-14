// 🏷️ Types

/** Nothing can run: why, and the exit code to end with. */
export interface RunAffectedFailure {
  exitCode: number;
  kind: "failure";
  message: string;
}

/** What the environment asked for, once it is known to be complete. */
export interface RunAffectedInputs {
  base: string;
  /** Extra `nx affected` flags, already split. */
  extra: readonly string[];
  head: string;
  kind: "inputs";
  target: string;
}

/** Either the run to make or the reason there is none. */
export type RunAffectedOutcome = RunAffectedFailure | RunAffectedPlan;

/** `nx affected` can run: the arguments to give `pnpm`, and what to pipe in. */
export interface RunAffectedPlan {
  /** Arguments for `pnpm`, beginning `exec nx affected`. */
  arguments: readonly string[];
  /** The change set to pipe to `nx affected --stdin`, when it was narrowed. */
  input?: string;
  kind: "run";
  /** The changed files dropped from the change set as spelling files. */
  spellingFiles: readonly string[];
  target: string;
}

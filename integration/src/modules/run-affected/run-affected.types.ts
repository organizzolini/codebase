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

/** Either the runs to make or the reason there is none. */
export type RunAffectedOutcome = RunAffectedFailure | RunAffectedPlan;

/** `nx affected` can run: the arguments to give `pnpm` for each run, in order. */
export interface RunAffectedPlan {
  kind: "run";
  /** One argument list per run, each beginning `exec nx affected`. */
  runs: readonly (readonly string[])[];
  target: string;
  /** The changed templates that added a run over the conformetry config. */
  templateFiles: readonly string[];
}

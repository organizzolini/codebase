// 🏷️ Types

/** A step that failed and was undone, for the pull request to report. */
export interface SkippedStep {
  exitCode: number;
  label: string;
  /** The end of what the step printed, which names why it failed. */
  tail: string;
}

/** How one upgrade step ended. */
export type UpgradeOutcome =
  | UpgradeSkipped
  | UpgradeSucceeded
  | UpgradeUnrestored;

/** The step failed and was undone, so the job can carry on. */
export interface UpgradeSkipped {
  kind: "skipped";
  /** Everything the step printed, for the log. */
  output: string;
  skipped: SkippedStep;
}

/** One upgrade the weekly job makes, as a script and how to recover from it. */
export interface UpgradeStep {
  /** What the pull request calls the step when it is skipped. */
  label: string;
  /** A script that puts the environment right after the step is undone. */
  recover?: string;
  /** The script that makes the upgrade, run under `bash -e -o pipefail`. */
  script: string;
}

/** The step ran and finished. */
export interface UpgradeSucceeded {
  kind: "succeeded";
  /** Everything the step printed, for the log. */
  output: string;
}

/** The step failed and could not be undone: the job must stop. */
export interface UpgradeUnrestored {
  kind: "unrestored";
  message: string;
  /** Everything the step printed, for the log. */
  output: string;
}

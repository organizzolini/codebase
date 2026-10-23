// 🏷️ Types

/** A step that failed and was undone, with the label it is reported under. */
export type Failure = SkippedStep & { label: string };

/** A step that failed and was undone, for the pull request to report. */
export interface SkippedStep {
  exitCode: number;
  /** The end of what the step printed, which names why it failed. */
  tail: string;
}

/** What one step came to, for the pull request to report. */
export interface StepReport {
  /** What git counts the step to have changed; empty when it changed nothing. */
  changes: string;
  label: string;
  /** Set when the step failed and was undone. */
  skipped?: SkippedStep;
  /** The version the step landed on, from a `summary:` line it printed. */
  summary?: string | undefined;
  /** The `⚠` lines the step printed, which a succeeded run may still carry. */
  warnings: string[];
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
  report: StepReport;
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
  report: StepReport;
}

/** The step failed and could not be undone: the job must stop. */
export interface UpgradeUnrestored {
  kind: "unrestored";
  message: string;
  /** Everything the step printed, for the log. */
  output: string;
}

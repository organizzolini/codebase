import type {
  CapturedProcess,
  Command,
} from "../process-runner/process-runner.types";

// 🏷️ Types

/** A step made of commands run one after another, stopping at the first to fail. */
export interface CommandStep {
  commands: readonly Command[];
  /** What the pull request calls the step when it is skipped. */
  label: string;
  /** Commands that put the environment right after the step is undone. */
  recover?: readonly Command[];
}

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
  /** The version the step landed on, which a task reports. */
  summary?: string | undefined;
  /** The `⚠` lines the step printed, which a succeeded run may still carry. */
  warnings: string[];
}

/** A step made of one upgrade a service carries out. */
export interface TaskStep {
  /** What the pull request calls the step when it is skipped. */
  label: string;
  /** Commands that put the environment right after the step is undone. */
  recover?: readonly Command[];
  task: UpgradeTask;
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

/** One upgrade the weekly job makes. */
export type UpgradeStep = CommandStep | TaskStep;

/** The step ran and finished. */
export interface UpgradeSucceeded {
  kind: "succeeded";
  /** Everything the step printed, for the log. */
  output: string;
  report: StepReport;
}

/** An upgrade with logic of its own, which a service carries out. */
export type UpgradeTask = "node" | "pnpm" | "python";

/** What carries out a task. It throws to say the upgrade failed. */
export interface UpgradeTaskRunner {
  /** @returns The version now in use, as a summary line. */
  upgrade: () => Promise<string> | string;
}

/** The step failed and could not be undone: the job must stop. */
export interface UpgradeUnrestored {
  kind: "unrestored";
  message: string;
  /** Everything the step printed, for the log. */
  output: string;
}

/** What a step did, as a finished process would report it. */
export interface UpgradeWork extends CapturedProcess {
  /** The version the step landed on, when it is a task. */
  summary?: string;
}

// 🏷️ Types

/** Why the gate could not decide, and its exit code. */
export interface PublishablePackagesGateFailure {
  exitCode: number;
  kind: "failure";
  message: string;
}

/** Whether to run the check, skip it, or neither, and why. */
export type PublishablePackagesGateOutcome =
  | PublishablePackagesGateFailure
  | PublishablePackagesGateRun
  | PublishablePackagesGateSkip;

/** Something affects the check, so it runs, whole. */
export interface PublishablePackagesGateRun {
  /** The affected projects, as `nx show projects --json` printed them. */
  affected: string;
  kind: "run";
}

/** Nothing the check covers is affected, so it does not run. */
export interface PublishablePackagesGateSkip {
  kind: "skip";
}

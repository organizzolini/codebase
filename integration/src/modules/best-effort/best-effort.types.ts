// 🏷️ Types
import type { BestEffortFailure } from "../best-effort-ledger/best-effort-ledger.types";

/** What the environment asked for, once it is known to be complete. */
export interface BestEffortInputs {
  kind: "inputs";
  label: string;
  /** The files the step may change, already split. */
  paths: readonly string[];
  /** A script that puts the environment back after a failed step. */
  recover?: string;
  run: string;
}

/** A step that is not set up: why, as the one line the run ends with. */
export interface BestEffortMisconfigured {
  kind: "misconfigured";
  message: string;
}

/** How one best-effort step ended. */
export type BestEffortOutcome =
  | BestEffortMisconfigured
  | BestEffortSkipped
  | BestEffortSucceeded
  | BestEffortUnrestored;

/** The step failed, its files were restored, and the run may carry on. */
export interface BestEffortSkipped {
  failure: BestEffortFailure;
  kind: "skipped";
  /** Everything the step printed, for the log. */
  output: string;
}

/** A copy of the files a step may change, taken before it runs. */
export interface BestEffortSnapshot {
  /** Where the copies live. */
  directory: string;
  /** Each file or folder, and whether it existed to be copied. */
  entries: readonly BestEffortSnapshotEntry[];
}

/** One path a snapshot covers. */
export interface BestEffortSnapshotEntry {
  existed: boolean;
  path: string;
}

/** The step ran and finished. */
export interface BestEffortSucceeded {
  kind: "succeeded";
  /** Everything the step printed, for the log. */
  output: string;
}

/** The step failed and could not be undone: the run must stop. */
export interface BestEffortUnrestored {
  kind: "unrestored";
  message: string;
  /** Everything the step printed, for the log. */
  output: string;
}

// 🏷️ Types

import type { GateOptions } from "../gate/gate.types";

/** What a command line run left behind once it ended or failed to start. */
export interface CapturedRun {
  /** Why the process could not be started, when it could not. */
  readonly error?: string;
  readonly exitCode: null | number;
  readonly standardError: string;
  readonly standardOutput: string;
}

/**
 * What one task of a gate batch settled on.
 *
 * Nx's own type for a batch executor's result is not exported through
 * `@nx/devkit`, so this states the shape Nx reads back: whether the task
 * passed, and the output to show and to store with it in the cache.
 */
export interface GateBatchTaskResult {
  readonly success: boolean;
  readonly terminalOutput: string;
}

/** Tasks of a batch that one boundary check can judge together. */
export interface GateRunGroup {
  readonly configuration: string;
  readonly dependencies: boolean;
  readonly tasks: RunGateBatchTask[];
}

/** A task of a batch, with the command line that explains it should it fail. */
export interface JudgedTask {
  /** The command line that judges this project alone, for its own report. */
  readonly singleArguments: string[];
  readonly task: RunGateBatchTask;
}

/** Arguments for judging several tasks of this gate together. */
export interface RunGateBatchArguments {
  /**
   * How many command line runs the batch may start at once.
   *
   * Defaults to the cores available, up to `MAX_PARALLEL_RUNS`.
   */
  readonly concurrency?: number | undefined;
  readonly tasks: readonly RunGateBatchTask[];
  readonly workspaceRoot: string;
}

/** One task of a gate batch. */
export interface RunGateBatchTask {
  /** Whether Nx caches the target this task runs as. */
  readonly cached: boolean;
  /**
   * The workspace configuration this task is judged against, already resolved.
   *
   * Resolved by the executor rather than here: reading it back out of
   * `nx.json` is a long chain of calls, and a batch that made it from several
   * places deep inside itself would be too deep to read.
   */
  readonly configurationPath: string;
  /** Nx's id for the task, which the result is keyed by. */
  readonly id: string;
  readonly options: GateOptions;
  /** The project the task's target belongs to. */
  readonly project: string;
}

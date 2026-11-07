// 🏷️ Types

import type { ExecutorContext, TaskGraph } from "@nx/devkit";

/**
 * The four arguments Nx calls a batch executor with, in the order it passes them.
 *
 * A tuple rather than four parameters because Nx fixes that signature and the
 * workspace holds a function to three: the task graph, each task's resolved
 * options by task id, the overrides of the whole run, and the context.
 */
export type GateBatchExecutorArguments = [
  taskGraph: TaskGraph,
  options: Record<string, GateExecutorOptions>,
  overrides: GateExecutorOptions,
  context: ExecutorContext,
];

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

/** Options the gate executor accepts. */
export interface GateExecutorOptions {
  readonly configuration: string;
  /** Nx project names to gate, replacing the target's own project. */
  readonly projects?: string[] | undefined;
  /** Nx project tags to gate, selecting a project carrying any of them. */
  readonly tags?: string[] | undefined;
  /** Widen the selection along the Nx dependency graph. Defaults to true. */
  readonly withDependencies?: boolean | undefined;
}

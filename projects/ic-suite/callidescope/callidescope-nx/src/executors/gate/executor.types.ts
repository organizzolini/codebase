// 🏷️ Types

import type { ExecutorContext, TaskGraph } from "@nx/devkit";

/** Batch executor arguments: task graph, options, overrides, and context. */
export type GateBatchExecutorArguments = [
  taskGraph: TaskGraph,
  options: Record<string, GateExecutorOptions>,
  overrides: GateExecutorOptions,
  context: ExecutorContext,
];

/** One gate task's verdict and the output Nx caches. */
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

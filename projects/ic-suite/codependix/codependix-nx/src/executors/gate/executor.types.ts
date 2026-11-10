// 🏷️ Types

import type { GateOptions } from "../../modules/gate/gate.types";
import type { ExecutorContext, TaskGraph } from "@nx/devkit";

/**
 * The four arguments Nx passes a batch executor: task graph, each task's
 * options by id, the run's overrides, and the context.
 */
export type GateBatchExecutorArguments = [
  taskGraph: TaskGraph,
  options: Record<string, GateExecutorOptions>,
  overrides: GateExecutorOptions,
  context: ExecutorContext,
];

/** Options the gate executor accepts — see `schema.json` beside this. */
export type GateExecutorOptions = GateOptions;

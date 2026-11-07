// 🏷️ Types

import type { GateOptions } from "../../modules/gate/gate.types";
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

/** Options the gate executor accepts — see `schema.json` beside this. */
export type GateExecutorOptions = GateOptions;

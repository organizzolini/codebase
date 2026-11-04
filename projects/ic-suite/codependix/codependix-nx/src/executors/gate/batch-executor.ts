// 🛠️ Utilities

import {
  resolveBatchService,
  resolveGateService,
} from "../../modules/plugin/plugin-context.utilities";

import type {
  GateBatchTaskResult,
  RunGateBatchTask,
} from "../../modules/batch/batch.types";
import type { GateBatchExecutorArguments } from "./executor.types";

/**
 * Judges every gate task Nx batched for this executor from as few command line
 * runs as it can.
 *
 * Each task still passes, fails and is cached by itself — Nx hashes and
 * replays batched tasks one by one — but the command line is started once per
 * share of the batch instead of once per project, which is most of what a gate
 * costs.
 *
 * The configuration path of every task is resolved here, at the top of the
 * call, because reading it back out of `nx.json` is a long chain of calls that
 * only fits there. A task whose path cannot be resolved fails alone.
 */
export default async function gateBatchExecutor(
  ...[taskGraph, options, overrides, context]: GateBatchExecutorArguments
): Promise<Record<string, GateBatchTaskResult>> {
  const batchService = await resolveBatchService();
  const gateService = await resolveGateService();
  const results: Record<string, GateBatchTaskResult> = {};
  const tasks: RunGateBatchTask[] = [];

  for (const [id, task] of Object.entries(taskGraph.tasks)) {
    const taskOptions = options[id] ?? overrides;

    try {
      tasks.push({
        cached:
          context.projectGraph.nodes[task.target.project]?.data.targets?.[
            task.target.target
          ]?.cache === true,
        configurationPath: gateService.resolveConfigurationPath({
          configuration: taskOptions.configuration,
          workspaceRoot: context.root,
        }),
        id,
        options: taskOptions,
        project: task.target.project,
      });
    } catch (error) {
      results[id] = {
        success: false,
        terminalOutput: error instanceof Error ? error.message : String(error),
      };
    }
  }

  Object.assign(
    results,
    await batchService.runBatch({ tasks, workspaceRoot: context.root }),
  );
  printFailures(results);

  return results;
}

/**
 * Prints what each failed task found, under the task's id.
 *
 * Nx keeps a batch task's output for the cache but does not print it, where
 * the single executor lets the command line write to the task's own streams.
 * Without this a failed gate is a red task that never says which boundary
 * broke. Passing tasks print nothing.
 */
function printFailures(results: Record<string, GateBatchTaskResult>): void {
  for (const [taskId, result] of Object.entries(results)) {
    if (!result.success) {
      process.stdout.write(`\n> ${taskId}\n${result.terminalOutput}\n`);
    }
  }
}

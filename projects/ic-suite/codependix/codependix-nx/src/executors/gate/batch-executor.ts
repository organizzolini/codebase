// 🛠️ Utilities

import { describeError } from "../../modules/batch/batch.utilities";
import {
  resolveBatchService,
  resolveGateService,
} from "../../modules/plugin/plugin-context.utilities";

import type {
  GateBatchTaskResult,
  RunGateBatchTask,
} from "../../modules/batch/batch.types";
import type { GateService } from "../../modules/gate/gate.service";
import type {
  GateBatchExecutorArguments,
  GateExecutorOptions,
} from "./executor.types";

/** What resolving one task's configuration came to: a task, or its failure. */
type ResolvedTask =
  | { failure: GateBatchTaskResult }
  | { task: RunGateBatchTask };

/**
 * Judges every gate task Nx batched for this executor from as few command line
 * runs as it can.
 *
 * Each task still passes, fails and is cached by itself — Nx hashes and
 * replays batched tasks one by one — but the command line is started once per
 * share of the batch instead of once per project, which is most of what a gate
 * costs.
 */
export default async function gateBatchExecutor(
  ...[taskGraph, options, overrides, context]: GateBatchExecutorArguments
): Promise<Record<string, GateBatchTaskResult>> {
  const batchService = await resolveBatchService();
  const gateService = await resolveGateService();
  const results: Record<string, GateBatchTaskResult> = {};
  const tasks: RunGateBatchTask[] = [];

  for (const [id, task] of Object.entries(taskGraph.tasks)) {
    const resolved = resolveTask({
      cached:
        context.projectGraph.nodes[task.target.project]?.data.targets?.[
          task.target.target
        ]?.cache === true,
      gateService,
      id,
      options: options[id] ?? overrides,
      project: task.target.project,
      workspaceRoot: context.root,
    });

    if ("failure" in resolved) {
      results[id] = resolved.failure;
    } else {
      tasks.push(resolved.task);
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

/**
 * Resolves one task's configuration path, or the failure that earns it.
 *
 * Reading the path back out of `nx.json` is a long chain of calls, so it is
 * done here, near the top of the call, and never from inside a batch. A task
 * whose path cannot be resolved fails alone and costs its peers nothing.
 */
function resolveTask(args: {
  cached: boolean;
  gateService: GateService;
  id: string;
  options: GateExecutorOptions;
  project: string;
  workspaceRoot: string;
}): ResolvedTask {
  try {
    return {
      task: {
        cached: args.cached,
        configurationPath: args.gateService.resolveConfigurationPath({
          configuration: args.options.configuration,
          workspaceRoot: args.workspaceRoot,
        }),
        id: args.id,
        options: args.options,
        project: args.project,
      },
    };
  } catch (error) {
    return {
      failure: { success: false, terminalOutput: describeError(error) },
    };
  }
}

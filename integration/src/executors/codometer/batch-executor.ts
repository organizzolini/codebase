// 🛠️ Utilities

import { availableParallelism } from "node:os";

import { runCodometerBatch, runCodometerCli } from "./codometer.runner";
import { describeOptions } from "./codometer.utilities";

import type {
  BatchedTask,
  CodometerBatchExecutorArguments,
  CodometerExecutorOptions,
  CodometerTaskResult,
  MeasurementGroup,
} from "./codometer.types";

/**
 * Judges every codometer task Nx batched from one run per measurement.
 *
 * A process per project paid the swc hook and codometer's module load for
 * each, which is most of what a small project's measurement costs. Each task
 * still passes, fails and is cached by itself: the report and the badge block
 * are written under each project's root by the same code the command line
 * runs, and Nx hashes and replays batched tasks one by one. A task whose
 * project the graph does not know fails alone.
 */
export default async function codometerBatchExecutor(
  ...[taskGraph, options, overrides, context]: CodometerBatchExecutorArguments
): Promise<Record<string, CodometerTaskResult>> {
  const results: Record<string, CodometerTaskResult> = {};
  const groups = new Map<string, MeasurementGroup>();

  for (const [id, task] of Object.entries(taskGraph.tasks)) {
    const root = context.projectGraph.nodes[task.target.project]?.data.root;
    const taskOptions = options[id] ?? overrides;

    if (root === undefined) {
      results[id] = {
        success: false,
        terminalOutput: `The project graph has no project named ${task.target.project}.`,
      };
    } else {
      const key = describeOptions(taskOptions);
      const group = groups.get(key) ?? { options: taskOptions, tasks: [] };

      groups.set(key, {
        ...group,
        tasks: [...group.tasks, { id, root }],
      });
    }
  }

  for (const group of groups.values()) {
    Object.assign(
      results,
      await judgeGroup({ ...group, workspaceRoot: context.root }),
    );
  }

  printFailures(results);

  return results;
}

/**
 * Judges one task by running its project alone, exactly as it was run before
 * batching.
 *
 * What a task's verdict and printed report are made of, so a failure reads as
 * codometer's own. A project that passes alone passes, whatever the batch it
 * was in did.
 */
async function judgeAlone(args: {
  options: CodometerExecutorOptions;
  task: BatchedTask;
  workspaceRoot: string;
}): Promise<CodometerTaskResult> {
  const alone = await runCodometerCli({
    options: args.options,
    root: args.task.root,
    workspaceRoot: args.workspaceRoot,
  });

  return {
    success: alone.status === 0,
    terminalOutput:
      alone.status === 0 ? "" : `${alone.stdout}${alone.stderr}`.trim(),
  };
}

/**
 * Judges the tasks that ask for the same measurement from one codometer run.
 *
 * A clean exit passes every task. Otherwise the run said only that some
 * project failed, not which, so each task is judged alone, a few at a time:
 * that costs what a run per project always did, and only when something fails.
 */
async function judgeGroup(
  args: MeasurementGroup & { workspaceRoot: string },
): Promise<Record<string, CodometerTaskResult>> {
  const results: Record<string, CodometerTaskResult> = {};
  const batch = await runCodometerBatch({
    options: args.options,
    roots: args.tasks.map((task) => task.root),
    workspaceRoot: args.workspaceRoot,
  });

  if (batch.status === 0) {
    for (const task of args.tasks) {
      results[task.id] = { success: true, terminalOutput: "" };
    }

    return results;
  }

  const width = availableParallelism();

  for (let start = 0; start < args.tasks.length; start += width) {
    const chunk = args.tasks.slice(start, start + width);
    const settled = await Promise.all(
      chunk.map(async (task) => await judgeAlone({ ...args, task })),
    );

    for (const [index, task] of chunk.entries()) {
      results[task.id] = settled[index] ?? {
        success: false,
        terminalOutput: "",
      };
    }
  }

  return results;
}

/**
 * Prints what each failed task found, under the task's id.
 *
 * Nx keeps a batch task's output for the cache but does not print it, where a
 * single task's output reaches the terminal. Without this a failed task is red
 * and silent. Passing tasks print nothing.
 */
function printFailures(results: Record<string, CodometerTaskResult>): void {
  for (const [taskId, result] of Object.entries(results)) {
    if (!result.success) {
      process.stdout.write(`\n> ${taskId}\n${result.terminalOutput}\n`);
    }
  }
}

// 🛠️ Utilities

import { runKnip } from "./knip.runner";
import { attributeIssues } from "./knip.utilities";

import type {
  KnipBatchExecutorArguments,
  KnipExecutorOptions,
  KnipTaskResult,
} from "./knip.types";

/** A task of a batch whose workspace is known, ready to be judged. */
interface BatchedTask {
  readonly id: string;
  readonly root: string;
}

/**
 * Judges the knip tasks Nx batched, with one knip run per configuration.
 * Each task passes, fails and caches by itself; fixes run alone.
 */
export default async function knipBatchExecutor(
  ...[taskGraph, options, overrides, context]: KnipBatchExecutorArguments
): Promise<Record<string, KnipTaskResult>> {
  const results: Record<string, KnipTaskResult> = {};
  const groups = new Map<string, BatchedTask[]>();

  for (const [id, task] of Object.entries(taskGraph.tasks)) {
    const taskOptions = options[id] ?? overrides;
    const root = context.projectGraph.nodes[task.target.project]?.data.root;

    if (root === undefined) {
      results[id] = {
        success: false,
        terminalOutput: `The project graph has no project named ${task.target.project}.`,
      };
    } else if (taskOptions.fix === true) {
      results[id] = await runAlone({
        options: taskOptions,
        task: { id, root },
        workspaceRoot: context.root,
      });
    } else {
      groups.set(taskOptions.configuration, [
        ...(groups.get(taskOptions.configuration) ?? []),
        { id, root },
      ]);
    }
  }

  for (const [configuration, tasks] of groups) {
    Object.assign(
      results,
      await judgeGroup({ configuration, tasks, workspaceRoot: context.root }),
    );
  }

  printFailures(results);

  return results;
}

/**
 * Reruns a failed workspace alone for knip's own printed report.
 * A batch that found an issue stays failed even if the rerun passes.
 */
async function explain(args: {
  configuration: string;
  task: BatchedTask;
  workspaceRoot: string;
}): Promise<KnipTaskResult> {
  const alone = await runKnip({
    configuration: args.configuration,
    fix: false,
    format: "native",
    roots: [args.task.root],
    workspaceRoot: args.workspaceRoot,
  });
  const printed = `${alone.stdout}${alone.stderr}`.trim();

  return {
    success: false,
    terminalOutput:
      alone.status === 0
        ? `${args.task.id}: knip found an issue in this workspace in a batch that a run of its own did not reproduce.\n${printed}`.trim()
        : printed,
  };
}

/** A failed result for every task, for a run that gave no verdict at all. */
function failAll(
  tasks: readonly BatchedTask[],
  terminalOutput: string,
): Record<string, KnipTaskResult> {
  return Object.fromEntries(
    tasks.map((task) => [task.id, { success: false, terminalOutput }]),
  );
}

/**
 * Judges one configuration's tasks from one knip run. A task fails only
 * for an issue in its own workspace; unreadable output fails all.
 */
async function judgeGroup(args: {
  configuration: string;
  tasks: readonly BatchedTask[];
  workspaceRoot: string;
}): Promise<Record<string, KnipTaskResult>> {
  const roots = args.tasks.map((task) => task.root);
  const captured = await runKnip({
    configuration: args.configuration,
    fix: false,
    format: "json",
    roots,
    workspaceRoot: args.workspaceRoot,
  });
  const issues = attributeIssues(captured.stdout, roots);

  if (issues === undefined) {
    return failAll(
      args.tasks,
      `knip did not print a report.\n${captured.stdout}${captured.stderr}`.trim(),
    );
  }

  const failing = args.tasks.filter((task) => issues.byRoot.has(task.root));

  if (captured.status !== 0 && failing.length === 0) {
    return failAll(
      args.tasks,
      `knip exited ${String(captured.status)} but charged no issue to a workspace judged here.\n${captured.stderr}`.trim(),
    );
  }

  const results: Record<string, KnipTaskResult> = {};

  for (const task of args.tasks) {
    results[task.id] = issues.byRoot.has(task.root)
      ? await explain({ ...args, task })
      : { success: true, terminalOutput: "" };
  }

  return results;
}

/**
 * Prints each failed task's output under its id. Nx stores batch output
 * but never prints it, so a failure would otherwise be silent.
 */
function printFailures(results: Record<string, KnipTaskResult>): void {
  for (const [taskId, result] of Object.entries(results)) {
    if (!result.success) {
      process.stdout.write(`\n> ${taskId}\n${result.terminalOutput}\n`);
    }
  }
}

/**
 * Runs one task outside any batch, keeping knip's output. A fix rewrites
 * files, so it never joins a verdict run.
 */
async function runAlone(args: {
  options: KnipExecutorOptions;
  task: BatchedTask;
  workspaceRoot: string;
}): Promise<KnipTaskResult> {
  const alone = await runKnip({
    configuration: args.options.configuration,
    fix: args.options.fix === true,
    format: "native",
    roots: [args.task.root],
    workspaceRoot: args.workspaceRoot,
  });

  return {
    success: alone.status === 0,
    terminalOutput: `${alone.stdout}${alone.stderr}`.trim(),
  };
}

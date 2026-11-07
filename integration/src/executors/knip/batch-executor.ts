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
 * Judges every knip task Nx batched from one run per configuration.
 *
 * One `knip --workspace` per project loaded the whole repository's module
 * graph each time, which is most of what a run costs: about 7 to 15 seconds
 * each against 28 for every workspace together. Each task still passes, fails
 * and is cached by itself — Nx hashes and replays batched tasks one by one.
 * A task asked to fix is run on its own, and one whose project the graph does
 * not know fails alone.
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
 * Gets a failed task's own report by running its workspace alone.
 *
 * A batch knows which workspace an issue is in but reads JSON, so the failing
 * workspace is run again by itself to get exactly what knip prints on the
 * command line. A second run that passes does not clear the task: the batch
 * found an issue there, so the disagreement is stated beside what was printed.
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
 * Judges one configuration's tasks from a single knip run over all of their
 * workspaces.
 *
 * A task fails when an issue sits in its own workspace, and only then. Nothing
 * is read as a pass it did not earn: output that is not a report, or a failing
 * exit with no issue in any workspace asked about, fails every task, since
 * nothing says which of them the run was about.
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
 * Prints what each failed task found, under the task's id.
 *
 * Nx keeps a batch task's output for the cache but does not print it, where a
 * single task's output reaches the terminal. Without this a failed task is red
 * and silent. Passing tasks print nothing.
 */
function printFailures(results: Record<string, KnipTaskResult>): void {
  for (const [taskId, result] of Object.entries(results)) {
    if (!result.success) {
      process.stdout.write(`\n> ${taskId}\n${result.terminalOutput}\n`);
    }
  }
}

/**
 * Runs one task that cannot be batched, on its own, keeping what knip printed.
 *
 * A fix rewrites files, so each workspace is fixed by itself and never inside
 * a run that is also being read as a verdict.
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

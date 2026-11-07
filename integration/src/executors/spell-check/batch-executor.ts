// 🛠️ Utilities

import { runCspell } from "./spell-check.runner";
import { chargedRoots } from "./spell-check.utilities";

import type {
  BatchedTask,
  SpellCheckBatchExecutorArguments,
  SpellCheckTaskResult,
} from "./spell-check.types";

/**
 * Judges every spell-check task Nx batched from one run per configuration.
 *
 * One cspell per project paid its start-up and dictionary load each time,
 * which is most of what a small project's check costs. Each task still
 * passes, fails and is cached by itself — Nx hashes and replays batched tasks
 * one by one. A task whose project the graph does not know fails alone.
 */
export default async function spellCheckBatchExecutor(
  ...[taskGraph, options, overrides, context]: SpellCheckBatchExecutorArguments
): Promise<Record<string, SpellCheckTaskResult>> {
  const results: Record<string, SpellCheckTaskResult> = {};
  const groups = new Map<string, BatchedTask[]>();

  for (const [id, task] of Object.entries(taskGraph.tasks)) {
    const { configuration } = options[id] ?? overrides;
    const root = context.projectGraph.nodes[task.target.project]?.data.root;

    if (root === undefined) {
      results[id] = {
        success: false,
        terminalOutput: `The project graph has no project named ${task.target.project}.`,
      };
    } else {
      groups.set(configuration, [
        ...(groups.get(configuration) ?? []),
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
 * Gets a failed task's own report by running its project alone.
 *
 * The batch knows which project a misspelling is under but prints findings for
 * every project, so the failing project is run again by itself to get exactly
 * what cspell prints on the command line. A second run that passes does not
 * clear the task: the batch found a misspelling there, so the disagreement is
 * stated beside what was printed.
 */
async function explain(args: {
  configuration: string;
  task: BatchedTask;
  workspaceRoot: string;
}): Promise<SpellCheckTaskResult> {
  const alone = await runCspell({
    configuration: args.configuration,
    roots: [args.task.root],
    workspaceRoot: args.workspaceRoot,
  });
  const printed = `${alone.stdout}${alone.stderr}`.trim();

  return {
    success: false,
    terminalOutput:
      alone.status === 0
        ? `${args.task.id}: cspell found a misspelling under this project in a batch that a run of its own did not reproduce.\n${printed}`.trim()
        : printed,
  };
}

/**
 * Judges one configuration's tasks from a single cspell run over all of their
 * roots.
 *
 * A clean exit passes every task. Otherwise a task fails when a finding sits
 * under its own root, and only then; a failing exit with no finding under any
 * root asked about fails every task, since nothing says which of them the run
 * was about.
 */
async function judgeGroup(args: {
  configuration: string;
  tasks: readonly BatchedTask[];
  workspaceRoot: string;
}): Promise<Record<string, SpellCheckTaskResult>> {
  const captured = await runCspell({
    configuration: args.configuration,
    roots: args.tasks.map((task) => task.root),
    workspaceRoot: args.workspaceRoot,
  });
  const output = `${captured.stdout}${captured.stderr}`;
  const charged = chargedRoots(
    output,
    args.tasks.map((task) => task.root),
  );
  const results: Record<string, SpellCheckTaskResult> = {};

  for (const task of args.tasks) {
    if (captured.status === 0) {
      results[task.id] = { success: true, terminalOutput: "" };
    } else if (charged.size === 0) {
      results[task.id] = {
        success: false,
        terminalOutput:
          `cspell exited ${String(captured.status)} but charged no finding to a project judged here.\n${output}`.trim(),
      };
    } else {
      results[task.id] = charged.has(task.root)
        ? await explain({ ...args, task })
        : { success: true, terminalOutput: "" };
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
function printFailures(results: Record<string, SpellCheckTaskResult>): void {
  for (const [taskId, result] of Object.entries(results)) {
    if (!result.success) {
      process.stdout.write(`\n> ${taskId}\n${result.terminalOutput}\n`);
    }
  }
}

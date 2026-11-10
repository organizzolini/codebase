// 🛠️ Utilities

import { runCspell } from "./spell-check.runner";
import { chargedRoots } from "./spell-check.utilities";

import type {
  BatchedTask,
  SpellCheckBatchExecutorArguments,
  SpellCheckTaskResult,
} from "./spell-check.types";

/**
 * Judges the spell-check tasks Nx batched, with one cspell run per configuration.
 * Each task passes, fails and caches by itself.
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
 * Reruns a failed project alone for cspell's own printed report. A batch
 * that found a misspelling stays failed even if the rerun passes.
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
 * Judges one configuration's tasks from one cspell run. A clean exit passes
 * all; a task fails for a finding under its own root.
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
 * Prints each failed task's output under its id. Nx stores batch output
 * but never prints it, so a failure would otherwise be silent.
 */
function printFailures(results: Record<string, SpellCheckTaskResult>): void {
  for (const [taskId, result] of Object.entries(results)) {
    if (!result.success) {
      process.stdout.write(`\n> ${taskId}\n${result.terminalOutput}\n`);
    }
  }
}

// 🛠️ Utilities

import {
  resolveOptionsService,
  resolvePluginService,
} from "../../modules/plugin/plugin-context.utilities";
import { EMPTY_SCOPE_REPORT } from "../../modules/plugin/plugin.constants";
import { resolveExecutorScope } from "../../modules/plugin/plugin.utilities";

import type { RunGateBatchTask } from "../../modules/plugin/plugin.types";
import type {
  GateBatchExecutorArguments,
  GateBatchTaskResult,
  GateExecutorOptions,
} from "./executor.types";
import type { ExecutorContext } from "@nx/devkit";

/** What resolving one task's scope came to: a task to run, or its failure. */
type ResolvedTask =
  | { configurationPath: string; task: RunGateBatchTask; taskId: string }
  | { failure: GateBatchTaskResult; taskId: string };

/**
 * Gates every task Nx batched for this executor from one trace.
 *
 * One `gate` task per project used to trace the whole workspace on its own, so
 * the cold run of a workspace of ~60 projects traced it ~60 times. A batch
 * traces the combined scope once and judges each task by its own project's
 * findings, so each still passes or fails alone and is still cached alone —
 * Nx hashes and replays batched tasks one by one. Tasks that name different
 * configuration files cannot share a trace, so they are batched per file.
 */
export default async function gateBatchExecutor(
  ...[taskGraph, options, overrides, context]: GateBatchExecutorArguments
): Promise<Record<string, GateBatchTaskResult>> {
  const resolved = await Promise.all(
    Object.entries(taskGraph.tasks).map(async ([taskId, task]) => {
      return await resolveTask({
        context,
        options: options[taskId] ?? overrides,
        projectName: task.target.project,
        taskId,
      });
    }),
  );
  const results: Record<string, GateBatchTaskResult> = {};
  const byConfiguration = new Map<string, RunGateBatchTask[]>();

  for (const entry of resolved) {
    if ("failure" in entry) {
      results[entry.taskId] = entry.failure;
      continue;
    }

    byConfiguration.set(entry.configurationPath, [
      ...(byConfiguration.get(entry.configurationPath) ?? []),
      entry.task,
    ]);
  }

  const pluginService = await resolvePluginService();

  for (const [configurationPath, tasks] of byConfiguration) {
    const verdicts = await pluginService.runGateBatch({
      configurationPath,
      tasks,
      workspaceRoot: context.root,
    });

    for (const [taskId, verdict] of Object.entries(verdicts)) {
      results[taskId] = { success: verdict.ok, terminalOutput: verdict.report };
    }
  }

  printFailures(results);

  return results;
}

/**
 * Prints what each failed task found, under the task's id.
 *
 * Nx keeps a batch task's output for the cache but does not print it, where
 * the single executor writes its report to stdout. Without this a failed gate
 * is a red task that never says which stack broke. Passing tasks print
 * nothing: their report is "none", repeated for every project in the batch.
 */
function printFailures(results: Record<string, GateBatchTaskResult>): void {
  for (const [taskId, result] of Object.entries(results)) {
    if (!result.success) {
      process.stdout.write(`\n> ${taskId}\n${result.terminalOutput}\n`);
    }
  }
}

/**
 * Resolves one task's scope, or the failed result that scope earns it.
 *
 * A task Nx batched is still its own project's gate, so what it traces and
 * what it judges are resolved exactly as the single executor resolves them. A
 * refusal fails that task alone: a bad selection on one project must not take
 * down the verdicts of the others it was batched with.
 */
async function resolveTask(args: {
  context: ExecutorContext;
  options: GateExecutorOptions;
  projectName: string;
  taskId: string;
}): Promise<ResolvedTask> {
  try {
    const optionsService = await resolveOptionsService();
    const scope = await resolveExecutorScope({
      context: { ...args.context, projectName: args.projectName },
      label: "gate",
      options: args.options,
    });

    // A gate with nothing to point a trace at has no verdict to record, so it
    // fails rather than passes, as the single executor does and for the same
    // reason.
    if (scope.directories.length === 0) {
      return {
        failure: { success: false, terminalOutput: EMPTY_SCOPE_REPORT },
        taskId: args.taskId,
      };
    }

    return {
      configurationPath: optionsService.readConfiguration(
        args.options.configuration,
      ),
      task: {
        directories: scope.directories,
        id: args.taskId,
        judgedProjectNames: scope.selectedDirectories,
      },
      taskId: args.taskId,
    };
  } catch (error) {
    return {
      failure: {
        success: false,
        terminalOutput: error instanceof Error ? error.message : String(error),
      },
      taskId: args.taskId,
    };
  }
}

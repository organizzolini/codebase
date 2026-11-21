// 🛠️ Utilities

import { spawn } from "node:child_process";
import { availableParallelism } from "node:os";
import path from "node:path";

import { SILENT_LOG_LEVEL } from "./executor.constants";

import type {
  BatchedTask,
  MeasureBatchExecutorArguments,
  MeasureBatchTaskResult,
  MeasureExecutorOptions,
  MeasurementGroup,
  ProcessOutput,
} from "./executor.types";

/**
 * The shell command of one measurement, ending in its directories.
 * `--only-inputs` precedes `--config`, which ends its list.
 */
export function buildCommand(args: {
  directories: readonly string[];
  options: MeasureExecutorOptions;
}): string {
  const { check, command, config, onlyInputs, outputJson, outputMarkdown } =
    args.options;

  return [
    command,
    "measure",
    ...(onlyInputs === undefined
      ? []
      : ["--only-inputs", ...onlyInputs.map((name) => quote(name))]),
    "--config",
    quote(config),
    ...(outputJson === undefined ? [] : ["--output-json", quote(outputJson)]),
    ...(check === true ? ["--check", "limits"] : []),
    ...(outputMarkdown === undefined
      ? []
      : ["--output-markdown", quote(outputMarkdown)]),
    ...args.directories.map((directory) => quote(directory)),
  ].join(" ");
}

/** Whether two tasks ask for the same measurement, so one run can serve both. */
export function describeOptions(options: MeasureExecutorOptions): string {
  return JSON.stringify([
    options.command,
    options.config,
    options.check === true,
    options.onlyInputs ?? null,
    options.outputJson ?? null,
    options.outputMarkdown ?? null,
  ]);
}

/**
 * Groups batch tasks that ask for the same measurement, so each group shares one
 * process. A task whose project is unknown fails alone.
 */
export function groupTasks(
  ...[taskGraph, options, overrides, context]: MeasureBatchExecutorArguments
): {
  failures: Record<string, MeasureBatchTaskResult>;
  groups: MeasurementGroup[];
} {
  const failures: Record<string, MeasureBatchTaskResult> = {};
  const groups = new Map<string, MeasurementGroup>();

  for (const [id, task] of Object.entries(taskGraph.tasks)) {
    const root = context.projectGraph.nodes[task.target.project]?.data.root;
    const taskOptions = options[id] ?? overrides;

    if (root === undefined) {
      failures[id] = {
        success: false,
        terminalOutput: `The project graph has no project named ${task.target.project}.`,
      };
      continue;
    }

    const key = describeOptions(taskOptions);
    const group = groups.get(key) ?? { options: taskOptions, tasks: [] };

    groups.set(key, { ...group, tasks: [...group.tasks, { id, root }] });
  }

  return { failures, groups: [...groups.values()] };
}

/**
 * Measures every task of a batch, one process per distinct measurement. Each
 * task still passes, fails and is cached by itself.
 */
export async function runBatch(
  ...args: MeasureBatchExecutorArguments
): Promise<Record<string, MeasureBatchTaskResult>> {
  const { failures, groups } = groupTasks(...args);
  const results = { ...failures };

  for (const group of groups) {
    Object.assign(
      results,
      await runGroup({ ...group, workspaceRoot: args[3].root }),
    );
  }

  return results;
}

/**
 * Measures one project from its own root, which is how a project's limits
 * address their paths, and returns what the command line printed.
 */
export async function runProject(args: {
  options: MeasureExecutorOptions;
  root: string;
  workspaceRoot: string;
}): Promise<ProcessOutput> {
  return await runProcess({
    command: buildCommand({ directories: [], options: args.options }),
    cwd: path.join(args.workspaceRoot, args.root),
    environment: {},
    workspaceRoot: args.workspaceRoot,
  });
}

/**
 * Judges one task by measuring its project alone, as before batching.
 */
async function judgeAlone(args: {
  options: MeasureExecutorOptions;
  task: BatchedTask;
  workspaceRoot: string;
}): Promise<MeasureBatchTaskResult> {
  const alone = await runProject({
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

/** Quotes one argument for the shell the command line is started through. */
function quote(argument: string): string {
  return `'${argument.replaceAll("'", String.raw`'\''`)}'`;
}

/**
 * Measures a group in one run; on failure, each task alone, so a breach is charged to its own project.
 */
async function runGroup(
  args: MeasurementGroup & { workspaceRoot: string },
): Promise<Record<string, MeasureBatchTaskResult>> {
  const results: Record<string, MeasureBatchTaskResult> = {};
  const batch = await runProcess({
    command: buildCommand({
      directories: args.tasks.map((task) =>
        path.join(args.workspaceRoot, task.root),
      ),
      options: args.options,
    }),
    cwd: args.workspaceRoot,
    environment: { LOG_LEVEL: SILENT_LOG_LEVEL },
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
 * Starts the command line once. The command is a shell string, since a
 * source-run workspace names a loader.
 */
async function runProcess(args: {
  command: string;
  cwd: string;
  environment: Record<string, string>;
  workspaceRoot: string;
}): Promise<ProcessOutput> {
  const child = spawn(args.command, {
    cwd: args.cwd,
    env: {
      ...process.env,
      ...args.environment,
      NX_WORKSPACE_ROOT: args.workspaceRoot,
    },
    shell: true,
  });
  let stdout = "";
  let stderr = "";

  child.stdout.on("data", (chunk: Buffer) => {
    stdout += chunk.toString();
  });
  child.stderr.on("data", (chunk: Buffer) => {
    stderr += chunk.toString();
  });

  const status = await new Promise<null | number>((resolve, reject) => {
    child.on("error", reject);
    child.on("close", resolve);
  });

  return { status, stderr, stdout };
}

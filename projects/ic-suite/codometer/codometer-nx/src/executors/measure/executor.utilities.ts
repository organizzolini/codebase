// 🛠️ Utilities

import { spawn } from "node:child_process";
import path from "node:path";

import { SILENT_LOG_LEVEL } from "./executor.constants";

import type {
  MeasureBatchExecutorArguments,
  MeasureBatchTaskResult,
  MeasureExecutorOptions,
  MeasurementGroup,
  MeasureVerdict,
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
    "batch",
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
 * Measures a group in one run, judging each project by its verdict and report;
 * one given none fails with what the run printed.
 */
export async function runGroup(
  args: MeasurementGroup & { workspaceRoot: string },
): Promise<Record<string, MeasureBatchTaskResult>> {
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
  const verdicts = parseVerdicts(batch) ?? [];

  return Object.fromEntries(
    args.tasks.map((task): [string, MeasureBatchTaskResult] => {
      const verdict = verdicts.find(
        ({ directory }) =>
          directory === path.resolve(args.workspaceRoot, task.root),
      );

      return [
        task.id,
        verdict === undefined
          ? {
              success: false,
              terminalOutput:
                `No verdict for ${task.root}.\n${batch.stderr}${batch.stdout}`.trim(),
            }
          : { success: verdict.ok, terminalOutput: verdict.report },
      ];
    }),
  );
}

/** Whether a parsed value is one verdict as the command line prints it. */
function isVerdict(value: unknown): value is MeasureVerdict {
  return (
    typeof value === "object" &&
    value !== null &&
    "directory" in value &&
    typeof value.directory === "string" &&
    "ok" in value &&
    typeof value.ok === "boolean" &&
    "report" in value &&
    typeof value.report === "string"
  );
}

/** Whether a parsed value is a list of verdicts. */
function isVerdictList(value: unknown): value is MeasureVerdict[] {
  return (
    Array.isArray(value) &&
    (value as unknown[]).every((entry) => isVerdict(entry))
  );
}

/**
 * Reads the verdicts `codometer batch` printed as its last line, or nothing when
 * the run crashed before printing them.
 */
function parseVerdicts(output: ProcessOutput): MeasureVerdict[] | undefined {
  const lines = output.stdout.split("\n").filter((line) => line.trim() !== "");

  try {
    const parsed = JSON.parse(lines.at(-1) ?? "") as unknown;

    return isVerdictList(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

/** Quotes one argument for the shell the command line is started through. */
function quote(argument: string): string {
  return `'${argument.replaceAll("'", String.raw`'\''`)}'`;
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

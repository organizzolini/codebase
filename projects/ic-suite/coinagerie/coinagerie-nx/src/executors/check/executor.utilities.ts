// 🛠️ Utilities

import { spawn } from "node:child_process";

import type {
  CheckBatchExecutorArguments,
  CheckBatchTaskResult,
  CheckExecutorOptions,
  CheckTaskGroup,
  CheckVerdictRecord,
  ProcessOutput,
} from "./executor.types";

/**
 * Groups batch tasks that share a command and mode, so each group shares one
 * process. A task whose project is unknown fails alone.
 */
export function groupTasks(
  ...[taskGraph, options, overrides, context]: CheckBatchExecutorArguments
): {
  failures: Record<string, CheckBatchTaskResult>;
  groups: CheckTaskGroup[];
} {
  const failures: Record<string, CheckBatchTaskResult> = {};
  const groups = new Map<string, CheckTaskGroup>();

  for (const [id, task] of Object.entries(taskGraph.tasks)) {
    const root = context.projectGraph.nodes[task.target.project]?.data.root;
    const { command, write }: CheckExecutorOptions = options[id] ?? overrides;

    if (root === undefined) {
      failures[id] = {
        success: false,
        terminalOutput: `Unknown project: ${task.target.project}.`,
      };
      continue;
    }

    const mode = write === true ? "write" : "check";
    const key = `${mode}\0${command}`;
    const group = groups.get(key) ?? { command, mode, tasks: [] };

    group.tasks.push({ directory: root, id });
    groups.set(key, group);
  }

  return { failures, groups: [...groups.values()] };
}

/**
 * Judges every task of a batch, one process per group, each task by its own
 * verdict.
 */
export async function runBatch(
  ...args: CheckBatchExecutorArguments
): Promise<Record<string, CheckBatchTaskResult>> {
  const { failures, groups } = groupTasks(...args);
  const results = { ...failures };

  for (const group of groups) {
    Object.assign(results, await runGroup({ group, root: args[3].root }));
  }

  return results;
}

/**
 * Judges each task of a group from one process. Failure, or a task with no
 * verdict, is never read as a pass.
 */
export async function runGroup(args: {
  group: CheckTaskGroup;
  root: string;
}): Promise<Record<string, CheckBatchTaskResult>> {
  const results: Record<string, CheckBatchTaskResult> = {};

  try {
    const verdicts = parseVerdicts(await runProcess(args));

    for (const { directory, id } of args.group.tasks) {
      const verdict = verdicts.find((entry) => entry.directory === directory);

      results[id] =
        verdict === undefined
          ? { success: false, terminalOutput: `No verdict for ${directory}.` }
          : { success: verdict.ok, terminalOutput: verdict.report };
    }
  } catch (error) {
    for (const { id } of args.group.tasks) {
      results[id] = {
        success: false,
        terminalOutput: error instanceof Error ? error.message : String(error),
      };
    }
  }

  return results;
}

/** The shell command that judges every directory of a group in one process. */
function buildCommand(group: CheckTaskGroup): string {
  const flags = group.mode === "write" ? " --write" : "";
  let directories = "";

  for (const { directory } of group.tasks) {
    directories += ` ${quote(directory)}`;
  }

  return `${group.command} batch${flags}${directories}`;
}

/** Whether a parsed value is a list of verdicts, as the `batch` command prints them. */
function isVerdictList(value: unknown): value is CheckVerdictRecord[] {
  if (!Array.isArray(value)) {
    return false;
  }

  for (const entry of value as unknown[]) {
    if (!isVerdictRecord(entry)) {
      return false;
    }
  }

  return true;
}

/** Whether a parsed value is one verdict as the `batch` command prints it. */
function isVerdictRecord(value: unknown): value is CheckVerdictRecord {
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

/**
 * Reads the verdicts a process printed. A run that printed none is an error, never a pass.
 */
function parseVerdicts(output: ProcessOutput): CheckVerdictRecord[] {
  try {
    const parsed = JSON.parse(output.stdout) as unknown;

    if (isVerdictList(parsed)) {
      return parsed;
    }
  } catch {
    // Not JSON: reported below with what the process did print.
  }

  throw new Error(
    `The coinagerie command line exited ${String(output.status)} without a verdict.\n${output.stderr}${output.stdout}`,
  );
}

/** Quotes one argument for the shell the command line is started through. */
function quote(argument: string): string {
  return `'${argument.replaceAll("'", String.raw`'\''`)}'`;
}

/**
 * Starts the command line once for a group. The command is a shell string,
 * since a source-run workspace names a loader.
 */
async function runProcess(args: {
  group: CheckTaskGroup;
  root: string;
}): Promise<ProcessOutput> {
  const child = spawn(buildCommand(args.group), {
    cwd: args.root,
    env: { ...process.env, NX_WORKSPACE_ROOT: args.root },
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

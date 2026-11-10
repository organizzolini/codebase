// 🛠️ Utilities

import path from "node:path";

import { CODOMETER_CLI_MAIN, CODOMETER_TSCONFIG } from "./codometer.constants";

import type { CaptureLocation } from "../../modules/process-runner/process-runner.types";
import type { CodometerExecutorOptions } from "./codometer.types";

/**
 * Where codometer's command line runs: the directory it is started in and the
 * environment it sees.
 *
 * The swc hook is pointed at the shared tsconfig because it would otherwise
 * read `<cwd>/tsconfig.json`, which a Python project does not have.
 */
export function buildCaptureLocation(args: {
  environment?: Record<string, string>;
  workingDirectory: string;
  workspaceRoot: string;
}): CaptureLocation {
  return {
    cwd: args.workingDirectory,
    env: {
      ...process.env,
      ...args.environment,
      SWC_NODE_PROJECT: path.join(args.workspaceRoot, CODOMETER_TSCONFIG),
    },
  };
}

/**
 * The command-line arguments of a measurement, after `node`, ending in the
 * directories to measure.
 *
 * What the `nx:run-commands` target passed: the report is always written,
 * `--check limits` only for a task that gates, and the badge block only when
 * the task names a file for it. No directory means the working directory.
 */
export function buildCliArguments(args: {
  directories: readonly string[];
  options: CodometerExecutorOptions;
  workspaceRoot: string;
}): string[] {
  return [
    "--import",
    "@swc-node/register/esm-register",
    path.join(args.workspaceRoot, CODOMETER_CLI_MAIN),
    "measure",
    "--config",
    args.options.config,
    "--output-json",
    ...(args.options.check === true ? ["--check", "limits"] : []),
    ...(args.options.outputMarkdown === undefined
      ? []
      : ["--output-markdown", args.options.outputMarkdown]),
    ...args.directories,
  ];
}

/** Whether two tasks ask for the same measurement, so one run can serve both. */
export function describeOptions(options: CodometerExecutorOptions): string {
  return JSON.stringify([
    options.config,
    options.check === true,
    options.outputMarkdown ?? null,
  ]);
}

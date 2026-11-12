// 🛠️ Utilities

import path from "node:path";

import { ProcessRunnerService } from "../../modules/process-runner/process-runner.service";

import { SILENT_LOG_LEVEL } from "./codometer.constants";
import { buildCaptureLocation, buildCliArguments } from "./codometer.utilities";

import type { CapturedProcess } from "../../modules/process-runner/process-runner.types";
import type {
  RunCodometerArguments,
  RunCodometerBatchArguments,
} from "./codometer.types";

/**
 * Runs the command line once, silently, over every named project's root, made absolute.
 */
export async function runCodometerBatch(
  args: RunCodometerBatchArguments,
): Promise<CapturedProcess> {
  return await new ProcessRunnerService().captureAsync(
    process.execPath,
    buildCliArguments({
      directories: args.roots.map((root) =>
        path.join(args.workspaceRoot, root),
      ),
      options: args.options,
      workspaceRoot: args.workspaceRoot,
    }),
    buildCaptureLocation({
      environment: { LOG_LEVEL: SILENT_LOG_LEVEL },
      workingDirectory: args.workspaceRoot,
      workspaceRoot: args.workspaceRoot,
    }),
  );
}

/**
 * Runs the command line from one project's own root and returns what it printed.
 */
export async function runCodometerCli(
  args: RunCodometerArguments,
): Promise<CapturedProcess> {
  return await new ProcessRunnerService().captureAsync(
    process.execPath,
    buildCliArguments({
      directories: [],
      options: args.options,
      workspaceRoot: args.workspaceRoot,
    }),
    buildCaptureLocation({
      workingDirectory: path.join(args.workspaceRoot, args.root),
      workspaceRoot: args.workspaceRoot,
    }),
  );
}

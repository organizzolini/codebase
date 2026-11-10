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
 * Runs the command line once over every named project's root.
 *
 * Silent, since it measures them all through this one process and a failed
 * project is explained by running it alone. The roots are made absolute
 * because the command resolves a named directory, and the configuration inside
 * it, against the directory it runs from.
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
 * Runs the command line on one project and returns what it printed.
 *
 * From the project's own root, because without a directory named the command
 * measures the one it runs in — which is what a project's `limits[]` are
 * written against.
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

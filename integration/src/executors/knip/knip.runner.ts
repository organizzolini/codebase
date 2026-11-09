// 🛠️ Utilities

import path from "node:path";

import { ProcessRunnerService } from "../../modules/process-runner/process-runner.service";

import { KNIP_BINARY } from "./knip.constants";
import { buildKnipArguments } from "./knip.utilities";

import type { CapturedProcess } from "../../modules/process-runner/process-runner.types";
import type { BuildKnipArguments } from "./knip.types";

/**
 * Runs knip over the given workspaces and returns what it printed.
 * The one place knip starts, so single and batch runs match.
 */
export async function runKnip(
  args: Omit<BuildKnipArguments, "directory"> & { workspaceRoot: string },
): Promise<CapturedProcess> {
  return await new ProcessRunnerService().captureAsync(
    path.join(args.workspaceRoot, KNIP_BINARY),
    buildKnipArguments({ ...args, directory: args.workspaceRoot }),
  );
}

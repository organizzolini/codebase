// 🛠️ Utilities

import path from "node:path";

import { ProcessRunnerService } from "../../modules/process-runner/process-runner.service";

import { CSPELL_BINARY } from "./spell-check.constants";
import { buildCspellArguments } from "./spell-check.utilities";

import type { CapturedProcess } from "../../modules/process-runner/process-runner.types";
import type { BuildCspellArguments } from "./spell-check.types";

/**
 * Runs cspell over the given project roots and returns what it printed.
 *
 * The one place cspell is started, so a single run and a batch run it the same
 * way: from the workspace root, through that workspace's own binary.
 */
export async function runCspell(
  args: BuildCspellArguments & { workspaceRoot: string },
): Promise<CapturedProcess> {
  return await new ProcessRunnerService().captureAsync(
    path.join(args.workspaceRoot, CSPELL_BINARY),
    buildCspellArguments(args),
  );
}

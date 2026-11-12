// 🛠️ Utilities

import path from "node:path";

import { ProcessRunnerService } from "../../modules/process-runner/process-runner.service";

import { CSPELL_BINARY } from "./spell-check.constants";
import { buildCspellArguments } from "./spell-check.utilities";

import type { CapturedProcess } from "../../modules/process-runner/process-runner.types";
import type { BuildCspellArguments } from "./spell-check.types";

/**
 * Runs cspell over the given roots and returns what it printed.
 * The one place cspell starts, so single and batch runs match.
 */
export async function runCspell(
  args: BuildCspellArguments & { workspaceRoot: string },
): Promise<CapturedProcess> {
  return await new ProcessRunnerService().captureAsync(
    path.join(args.workspaceRoot, CSPELL_BINARY),
    buildCspellArguments(args),
  );
}

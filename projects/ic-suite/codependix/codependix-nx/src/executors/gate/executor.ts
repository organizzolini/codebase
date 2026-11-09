// 🛠️ Utilities

import { resolveGateService } from "../../modules/plugin/plugin-context.utilities";

import type { GateExecutorOptions } from "./executor.types";
import type { ExecutorContext } from "@nx/devkit";

/**
 * Fails a project's task when a boundary finding is charged to that project. A broken
 * boundary in a dependency is only a note here.
 */
export default async function gateExecutor(
  options: GateExecutorOptions,
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  const gateService = await resolveGateService();
  const targetConfiguration =
    context.projectName === undefined || context.targetName === undefined
      ? undefined
      : context.projectGraph.nodes[context.projectName]?.data.targets?.[
          context.targetName
        ];
  const success = await gateService.run({
    cached: targetConfiguration?.cache === true,
    options,
    projectName: context.projectName,
    workspaceRoot: context.root,
  });

  return { success };
}

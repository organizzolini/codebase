// 🛠️ Utilities

import { resolveGateService } from "../../modules/plugin/plugin-context.utilities";

import type { GateExecutorOptions } from "./executor.types";
import type { ExecutorContext } from "@nx/devkit";

/**
 * Fails one project's task when a codependix boundary finding is charged to it.
 *
 * Inferred onto every project but the workspace root, so
 * `nx affected -t codependix-gate` checks a branch's boundaries by the
 * projects it changed, and the task that fails is named after the project
 * whose boundary broke — which one workspace-wide check never could.
 *
 * The graphs are built over the project and everything it depends on, and
 * only a finding charged to the project fails it: a broken boundary in a
 * dependency is that dependency's gate's business, and is printed here as a
 * note rather than a failure.
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

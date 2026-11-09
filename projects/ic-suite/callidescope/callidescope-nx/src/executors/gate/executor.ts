// 🛠️ Utilities

import {
  resolveOptionsService,
  resolvePluginService,
} from "../../modules/plugin/plugin-context.utilities";
import { EMPTY_SCOPE_REPORT } from "../../modules/plugin/plugin.constants";
import { resolveExecutorScope } from "../../modules/plugin/plugin.utilities";

import type { GateExecutorOptions } from "./executor.types";
import type { ExecutorContext } from "@nx/devkit";

/**
 * Fails one project's task when its call stacks break their limits. Prints only the deciding stacks.
 */
export default async function gateExecutor(
  options: GateExecutorOptions,
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  const scope = await resolveExecutorScope({
    context,
    label: "gate",
    options,
  });

  // With nothing to trace there is no verdict, so this records a failure rather than a pass.
  // A green task here would call the project clean without having read it.
  if (scope.directories.length === 0) {
    process.stdout.write(`${EMPTY_SCOPE_REPORT}\n`);

    return { success: false };
  }

  const optionsService = await resolveOptionsService();
  const pluginService = await resolvePluginService();
  const result = await pluginService.runGate({
    configurationPath: optionsService.readConfiguration(options.configuration),
    directories: scope.directories,
    judgedProjectNames: scope.selectedDirectories,
    workspaceRoot: context.root,
  });

  // The findings are the executor's product rather than a log line, so they go
  // to stdout verbatim — and they go there whether or not the gate passed,
  // because a report saying nothing was found is how a reader tells a green
  // gate from one that never ran.
  process.stdout.write(`${result.report}\n`);

  return { success: result.ok };
}

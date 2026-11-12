// 🛠️ Utilities

import {
  resolveOptionsService,
  resolvePluginService,
} from "../../modules/plugin/plugin-context.utilities";
import { resolveExecutorScope } from "../../modules/plugin/plugin.utilities";

import type { TraceExecutorOptions } from "./executor.types";
import type { ExecutorContext } from "@nx/devkit";

/**
 * Traces one selection of Nx projects, defaulting to the target's own project when none are named.
 */
export default async function traceExecutor(
  options: TraceExecutorOptions,
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  const scope = await resolveExecutorScope({
    context,
    label: "trace",
    options,
  });

  if (scope.directories.length === 0) {
    return { success: true };
  }

  const optionsService = await resolveOptionsService();
  const pluginService = await resolvePluginService();
  const result = await pluginService.runTrace({
    configurationPath: optionsService.readConfiguration(options.configuration),
    directories: scope.directories,
    format: optionsService.readFormat(options.format),
    judgedProjectNames: scope.selectedDirectories,
    workspaceRoot: context.root,
  });

  // The report is the executor's product rather than a log line, so it goes
  // to stdout verbatim.
  process.stdout.write(`${result.report}\n`);

  return { success: result.ok };
}

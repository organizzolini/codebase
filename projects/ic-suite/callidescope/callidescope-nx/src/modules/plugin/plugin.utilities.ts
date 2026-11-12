// 🛠️ Utilities

import {
  resolveOptionsService,
  resolvePluginService,
} from "./plugin-context.utilities";

import type { ExecutorScopeOptions, ResolvedTraceScope } from "./plugin.types";
import type { ExecutorContext } from "@nx/devkit";

/**
 * Resolves what one executor invocation covers, throwing on anything the workspace does not have,
 * so Nx fails the task.
 */
export async function resolveExecutorScope(args: {
  context: ExecutorContext;
  /** Names the target in a refusal, so the message says which one refused. */
  label: string;
  options: ExecutorScopeOptions;
}): Promise<ResolvedTraceScope> {
  const optionsService = await resolveOptionsService();
  const projectNames = optionsService.readStringList(args.options.projects);
  const tags = optionsService.readStringList(args.options.tags);

  if (projectNames.length === 0 && tags.length === 0) {
    if (args.context.projectName === undefined) {
      throw new Error(
        `The callidescope ${args.label} executor must be run against a project, or given \`projects\` or \`tags\`.`,
      );
    }

    projectNames.push(args.context.projectName);
  }

  const pluginService = await resolvePluginService();
  const scope = await pluginService.resolveTraceScope({
    projectNames,
    tags,
    withDependencies: args.options.withDependencies !== false,
  });

  // A name or tag that resolved to nothing fails the task rather than
  // narrowing it: a report of what a run did cover cannot show what it did
  // not, so a silently smaller run would pass while measuring less.
  if (scope.unknownNames.length > 0 || scope.unmatchedTags.length > 0) {
    throw new Error(pluginService.describeRefusedScope(scope));
  }

  return scope;
}

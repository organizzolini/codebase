// 🛠️ Utilities

import { runGroup } from "./executor.utilities";

import type {
  MeasureExecutorContext,
  MeasureExecutorOptions,
} from "./executor.types";

/**
 * Measures one project and fails the task when codometer says the run failed.
 * Runs when batching is off.
 */
export default async function measureExecutor(
  options: MeasureExecutorOptions,
  context: MeasureExecutorContext,
): Promise<{ success: boolean }> {
  const projectName = context.projectName;

  if (projectName === undefined) {
    throw new Error(
      "The codometer measure executor must be run against a project.",
    );
  }

  const projectConfiguration =
    context.projectsConfigurations.projects[projectName];

  if (projectConfiguration === undefined) {
    throw new Error(`Unknown project: ${projectName}.`);
  }

  const results = await runGroup({
    options,
    tasks: [{ id: projectName, root: projectConfiguration.root }],
    workspaceRoot: context.root,
  });
  const result = results[projectName] ?? { success: false, terminalOutput: "" };

  process.stdout.write(`${result.terminalOutput}\n`);

  return { success: result.success };
}

// 🛠️ Utilities

import { runProject } from "./executor.utilities";

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

  const result = await runProject({
    options,
    root: projectConfiguration.root,
    workspaceRoot: context.root,
  });

  process.stdout.write(`${result.stdout}${result.stderr}`);

  return { success: result.status === 0 };
}

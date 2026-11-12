// 🛠️ Utilities

import { runCodometerCli } from "./codometer.runner";

import type {
  CodometerExecutorContext,
  CodometerExecutorOptions,
} from "./codometer.types";

/**
 * Measures one project from its root and fails the task when codometer says the run failed. Runs when batching is off.
 */
export default async function codometerExecutor(
  options: CodometerExecutorOptions,
  context: CodometerExecutorContext,
): Promise<{ success: boolean }> {
  if (context.projectName === undefined) {
    throw new Error("The codometer executor must be run against a project.");
  }

  const root = context.projectGraph.nodes[context.projectName]?.data.root;

  if (root === undefined) {
    throw new Error(
      `The project graph has no project named ${context.projectName}.`,
    );
  }

  const result = await runCodometerCli({
    options,
    root,
    workspaceRoot: context.root,
  });

  process.stdout.write(`${result.stdout}${result.stderr}`);

  return { success: result.status === 0 };
}

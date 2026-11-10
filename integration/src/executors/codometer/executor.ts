// 🛠️ Utilities

import { runCodometerCli } from "./codometer.runner";

import type {
  CodometerExecutorContext,
  CodometerExecutorOptions,
} from "./codometer.types";

/**
 * Measures one project and fails its task when codometer says the run failed.
 *
 * What `node codometer-cli.main.ts measure` does from the project's root, run
 * through an executor so Nx can batch it: `nx affected -t codometer` hands the
 * batch executor beside this one every project it must measure, and this runs
 * when batching is off or a task stands alone. The command's own output is
 * printed as it would be on the command line.
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

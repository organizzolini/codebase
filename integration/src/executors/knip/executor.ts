// 🛠️ Utilities

import { runKnip } from "./knip.runner";

import type { KnipExecutorContext, KnipExecutorOptions } from "./knip.types";

/**
 * Fails one project's task when knip reports an issue in its workspace.
 * Runs when batching is off or a task stands alone.
 */
export default async function knipExecutor(
  options: KnipExecutorOptions,
  context: KnipExecutorContext,
): Promise<{ success: boolean }> {
  if (context.projectName === undefined) {
    throw new Error("The knip executor must be run against a project.");
  }

  const root = context.projectGraph.nodes[context.projectName]?.data.root;

  if (root === undefined) {
    throw new Error(
      `The project graph has no project named ${context.projectName}.`,
    );
  }

  const result = await runKnip({
    configuration: options.configuration,
    fix: options.fix === true,
    format: "native",
    roots: [root],
    workspaceRoot: context.root,
  });

  process.stdout.write(`${result.stdout}${result.stderr}`);

  return { success: result.status === 0 };
}

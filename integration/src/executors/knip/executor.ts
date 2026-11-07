// 🛠️ Utilities

import { runKnip } from "./knip.runner";

import type { KnipExecutorContext, KnipExecutorOptions } from "./knip.types";

/**
 * Fails one project's task when knip reports an issue in that project's
 * workspace.
 *
 * What `knip --workspace <root>` does, run through an executor so Nx can batch
 * it: `nx affected -t knip` hands the batch executor beside this one every
 * workspace it must check, and this runs when batching is off or a task stands
 * alone. Knip's own report is printed as it would be on the command line.
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

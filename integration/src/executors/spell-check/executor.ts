// 🛠️ Utilities

import { runCspell } from "./spell-check.runner";

import type {
  SpellCheckExecutorContext,
  SpellCheckExecutorOptions,
} from "./spell-check.types";

/**
 * Fails one project's task when cspell finds a misspelling under its root.
 * Runs when batching is off or a task stands alone.
 */
export default async function spellCheckExecutor(
  options: SpellCheckExecutorOptions,
  context: SpellCheckExecutorContext,
): Promise<{ success: boolean }> {
  if (context.projectName === undefined) {
    throw new Error("The spell-check executor must be run against a project.");
  }

  const root = context.projectGraph.nodes[context.projectName]?.data.root;

  if (root === undefined) {
    throw new Error(
      `The project graph has no project named ${context.projectName}.`,
    );
  }

  const result = await runCspell({
    configuration: options.configuration,
    roots: [root],
    workspaceRoot: context.root,
  });

  process.stdout.write(`${result.stdout}${result.stderr}`);

  return { success: result.status === 0 };
}

import { createTreeWithEmptyWorkspace } from "@nx/devkit/testing";

import type { Tree } from "@nx/devkit";

/**
 * Builds an in-memory Nx workspace, with its `nx.json` and root
 * `package.json`, holding each file given at its workspace path, for testing
 * a generator, an executor, or a plugin.
 */
export function createWorkspaceTree(
  files: Readonly<Record<string, string>> = {},
): Tree {
  const tree = createTreeWithEmptyWorkspace();

  for (const [filePath, contents] of Object.entries(files)) {
    tree.write(filePath, contents);
  }

  return tree;
}

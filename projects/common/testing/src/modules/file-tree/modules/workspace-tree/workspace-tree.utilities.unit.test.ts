import { describe, expect, it } from "vitest";

import { createWorkspaceTree } from "./workspace-tree.utilities";

// 🧪 Tests

describe(createWorkspaceTree, () => {
  it("builds an empty Nx workspace in memory", () => {
    const tree = createWorkspaceTree();

    expect(tree.exists("nx.json")).toBe(true);
    expect(tree.exists("package.json")).toBe(true);
  });

  it("writes each file it is given at its workspace path", () => {
    const tree = createWorkspaceTree({
      "projects/sample/project.json": '{ "name": "sample" }',
      "projects/sample/src/index.ts": "export {};\n",
    });

    expect(tree.read("projects/sample/project.json", "utf8")).toBe(
      '{ "name": "sample" }',
    );
    expect(tree.children("projects/sample/src")).toStrictEqual(["index.ts"]);
  });
});

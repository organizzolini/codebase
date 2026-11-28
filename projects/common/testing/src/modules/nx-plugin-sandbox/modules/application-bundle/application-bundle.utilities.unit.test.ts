import path from "node:path";

import { describe, expect, it } from "vitest";

import { writeFileTree } from "../../../file-tree/file-tree.utilities";
import { makeDirectory } from "../../../temporary-directory/temporary-directory.utilities";

import { SHARED_PACKAGES } from "./application-bundle.constants";
import { describeApplicationBundle } from "./application-bundle.utilities";

const workspaceRoot = makeDirectory("application-bundle-workspace");
const directory = path.join(workspaceRoot, "dist/sample");

// A bundle with just enough in it for every check of the helper to pass.
describeApplicationBundle({
  bundle: async () => {
    await Promise.resolve();
    writeFileTree(workspaceRoot, {
      // One package without dependencies, one with shipped, unshipped and workspace ones, one whose dependency only the store holds.
      [`${SHARED_PACKAGES[0]}/package.json`]: "{}",
      [`${SHARED_PACKAGES[1]}/package.json`]: JSON.stringify({
        dependencies: {
          "@codebase/other": "workspace:*",
          pg: "1",
          vitest: "1",
        },
      }),
      [`${SHARED_PACKAGES[2]}/package.json`]: JSON.stringify({
        dependencies: { "@scope/package": "1" },
      }),
      "dist/sample/node_modules/.pnpm/@scope+package@1.0.0/node_modules/@scope/package/package.json":
        "{}",
      "dist/sample/node_modules/.pnpm/pg@1.0.0/node_modules/pg/package.json":
        "{}",
      "dist/sample/node_modules/pg/package.json": "{}",
      "dist/sample/projects/caelundas/caelundas-db/migrations/1-migration.js":
        "",
      "dist/sample/projects/common/observability/src/modules/logger/logger.service.js":
        'export const metadata = "design:paramtypes";',
      "dist/sample/sample.js":
        'console.error("Invalid input"); process.exit(1);',
    });
  },
  directory,
  entry: ["sample.js"],
  invalid: { environment: {}, files: {}, message: "Invalid input" },
  maximumFileBytes: 1000,
  packages: ["pg"],
  workspaceRoot,
});

describe(describeApplicationBundle, () => {
  it("registers its checks against a bundle that meets them", () => {
    expect.hasAssertions();
    expect(directory).toContain("dist/sample");
  });
});

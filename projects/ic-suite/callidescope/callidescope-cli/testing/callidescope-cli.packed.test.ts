import path from "node:path";

import { describe, expect, it } from "vitest";

import { createFileTree } from "@codebase/testing";
import { usePackedSandbox } from "@codebase/testing/end-to-end";

import type { CommandResult } from "@codebase/testing/end-to-end";

const WORKSPACE_ROOT = path.resolve(import.meta.dirname, "../../../../..");

/** A complete project configuration, in JavaScript because JSON cannot spell `undefined`. */
const PROJECT_CONFIGURATION = `export default {
  entryPoints: {
    addresses: [],
    decorators: [],
    includeExportedFunctions: true,
    includeOrphans: true,
    includeTests: false,
  },
  exclude: [],
  limits: { maximumBreadth: undefined, maximumDepth: 6 },
  write: { markdown: undefined, mermaid: undefined },
};
`;

describe("the packed callidescope command", () => {
  const packed = usePackedSandbox({
    binary: "callidescope",
    packages: [
      "@callidescope/cli",
      "@callidescope/configuration",
      "@callidescope/core",
      "@callidescope/graph",
      "@callidescope/output",
    ],
    workspaceRoot: WORKSPACE_ROOT,
  });

  /** Writes a workspace of one traceable project; returns the workspace directory. */
  function writeWorkspace(): string {
    return createFileTree(
      {
        "callidescope.config.json": JSON.stringify({
          limits: { maximumDepth: 6 },
        }),
        "packages/readable/callidescope.config.js": PROJECT_CONFIGURATION,
        "packages/readable/src/index.ts":
          "export function entry(): void {\n  helper();\n}\n\nfunction helper(): void {}\n",
        "packages/readable/tsconfig.json": JSON.stringify({
          compilerOptions: { noLib: true, target: "es2022" },
          include: ["src/**/*.ts"],
        }),
      },
      { label: "callidescope-packed-project" },
    );
  }

  /** Runs the installed binary from `directory`, which is outside the sandbox. */
  async function callidescope(
    directory: string,
    args: readonly string[],
  ): Promise<CommandResult> {
    return packed.run(directory, [
      ...args,
      "--config",
      path.join(directory, "callidescope.config.json"),
    ]);
  }

  it("lists its commands under --help", async () => {
    expect.hasAssertions();

    const result = await packed.command("callidescope", ["--help"]).run();

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("depth");
    expect(result.stdout).toContain("limits");
  });

  it("traces the call stacks of a project", async () => {
    expect.hasAssertions();

    const result = await callidescope(writeWorkspace(), [
      "depth",
      "--addresses",
      "packages/readable/src/index.ts#entry",
    ]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("helper");
  });

  it("lists the limits each project resolved", async () => {
    expect.hasAssertions();

    const result = await callidescope(writeWorkspace(), ["limits"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("packages/readable");
  });
});

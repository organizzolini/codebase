import fs from "node:fs";
import path from "node:path";

import { beforeAll, describe, expect, it } from "vitest";

import {
  installedVersion,
  usePackedRegistry,
} from "@codebase/testing/end-to-end";

import type {
  CommandResult,
  ConsumerWorkspace,
} from "@codebase/testing/end-to-end";

const WORKSPACE_ROOT = path.resolve(import.meta.dirname, "../../../../..");

/** A project's own configuration, in JavaScript because JSON cannot spell `undefined`. */
const projectConfiguration = (maximumDepth: number): string => `export default {
  entryPoints: {
    addresses: [],
    decorators: [],
    includeExportedFunctions: true,
    includeOrphans: true,
    includeTests: false,
  },
  exclude: [],
  limits: { maximumBreadth: undefined, maximumDepth: ${maximumDepth} },
  write: { markdown: undefined, mermaid: undefined },
};
`;

/** Three functions deep: `first` calls `second`, which calls `third`. */
const CHAIN = [
  "export function first(): void {",
  "  second();",
  "}",
  "",
  "function second(): void {",
  "  third();",
  "}",
  "",
  "function third(): void {}",
  "",
].join("\n");

describe("the callidescope plugin installed from a registry", () => {
  const registry = usePackedRegistry({
    localScopes: ["@callidescope"],
    packages: [
      "@callidescope/cli",
      "@callidescope/configuration",
      "@callidescope/core",
      "@callidescope/graph",
      "@callidescope/nx",
      "@callidescope/output",
    ],
    workspaceRoot: WORKSPACE_ROOT,
  });
  let workspace: ConsumerWorkspace;

  /** Writes a project holding `CHAIN` and the depth limit it is held to. */
  function writeProject(name: string, maximumDepth: number): void {
    const project = path.join(workspace.directory, "packages", name);

    fs.mkdirSync(path.join(project, "src"), { recursive: true });
    fs.writeFileSync(
      path.join(project, "project.json"),
      JSON.stringify({ name, projectType: "library" }),
    );
    fs.writeFileSync(
      path.join(project, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: { noLib: true, target: "es2022" },
        include: ["src/**/*.ts"],
      }),
    );
    fs.writeFileSync(path.join(project, "src/index.ts"), CHAIN);
    fs.writeFileSync(
      path.join(project, "callidescope.config.js"),
      projectConfiguration(maximumDepth),
    );
  }

  /** Runs `nx run <target>` with the daemon off and room for a cold start. */
  async function runTarget(target: string): Promise<CommandResult> {
    return workspace
      .command("nx", ["run", target, "--skipNxCache"])
      .withEnvironment({ NX_DAEMON: "false" })
      .withTimeout(240_000)
      .run();
  }

  beforeAll(async () => {
    workspace = await registry.runner.createWorkspace({
      dependencies: {
        nx: installedVersion(WORKSPACE_ROOT, "nx"),
        typescript: installedVersion(WORKSPACE_ROOT, "typescript"),
      },
      packages: ["@callidescope/nx"],
    });
    workspace.registerPlugin("@callidescope/nx", {
      configurationPath: "callidescope.config.json",
    });
    fs.writeFileSync(
      path.join(workspace.directory, "callidescope.config.json"),
      JSON.stringify({ limits: { maximumDepth: 6 } }),
    );
    writeProject("healthy", 6);
    writeProject("broken", 1);
  });

  it("passes the gate of a project within its depth limit", async () => {
    expect.hasAssertions();

    const result = await runTarget("healthy:callidescope-restrict");

    expect(result.exitCode).toBe(0);
  });

  it("fails the gate of a project over its depth limit", async () => {
    expect.hasAssertions();

    const result = await runTarget("broken:callidescope-restrict");

    expect(result.exitCode).not.toBe(0);
    expect(result.stdout + result.stderr).toContain(
      "Call stacks over the depth limit (1)",
    );
  });
});

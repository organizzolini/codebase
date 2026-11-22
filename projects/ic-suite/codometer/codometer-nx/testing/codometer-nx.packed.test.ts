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

describe("the codometer plugin installed from a registry", () => {
  const registry = usePackedRegistry({
    localScopes: ["@codometer"],
    packages: [
      "@codometer/cli",
      "@codometer/configuration",
      "@codometer/core",
      "@codometer/languages",
      "@codometer/measurement",
      "@codometer/nx",
      "@codometer/output",
    ],
    workspaceRoot: WORKSPACE_ROOT,
  });
  let workspace: ConsumerWorkspace;

  /** Writes a project of one source file, held to a limit of `lines` lines of code. */
  function writeProject(name: string, lines: number): void {
    const project = path.join(workspace.directory, "packages", name);

    fs.mkdirSync(path.join(project, "src"), { recursive: true });
    fs.writeFileSync(
      path.join(project, "project.json"),
      JSON.stringify({ name, projectType: "library" }),
    );
    fs.writeFileSync(
      path.join(project, "codometer.config.mjs"),
      `export default { defaultInput: "codebase", format: "json", limits: [{ metric: "codebase.linesOfCode", value: ${String(lines)} }] };\n`,
    );
    fs.writeFileSync(
      path.join(project, "src/index.ts"),
      "export const one = 1;\nexport const two = 2;\nexport const three = 3;\n",
    );
  }

  /** Runs `nx run <target>` with the daemon off and room for a cold start. */
  async function runTarget(
    target: string,
    args: readonly string[] = [],
  ): Promise<CommandResult> {
    return workspace
      .command("nx", ["run", target, "--skipNxCache", ...args])
      .withEnvironment({ NX_DAEMON: "false" })
      .withTimeout(240_000)
      .run();
  }

  beforeAll(async () => {
    workspace = await registry.runner.createWorkspace({
      dependencies: { nx: installedVersion(WORKSPACE_ROOT, "nx") },
      packages: ["@codometer/cli", "@codometer/nx"],
    });
    workspace.registerPlugin("@codometer/nx", {
      projectConfigurationPath: "codometer.config.mjs",
    });
    writeProject("roomy", 100);
    writeProject("cramped", 1);
  });

  it("passes the limit of a project within its limits", async () => {
    expect.hasAssertions();

    const result = await runTarget("roomy:codometer-limit");

    expect(result.exitCode).toBe(0);
  }, 900_000);

  it("fails the limit of a project that breaches one", async () => {
    expect.hasAssertions();

    const result = await runTarget("cramped:codometer-limit");

    expect(result.exitCode).not.toBe(0);
    expect(result.stdout + result.stderr).toContain("linesOfCode");
  });
});

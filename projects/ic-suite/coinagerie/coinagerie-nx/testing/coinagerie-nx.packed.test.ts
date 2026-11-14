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

describe("the coinagerie plugin installed from a registry", () => {
  const registry = usePackedRegistry({
    localScopes: ["@coinagerie"],
    packages: [
      "@coinagerie/cli",
      "@coinagerie/configuration",
      "@coinagerie/core",
      "@coinagerie/languages",
      "@coinagerie/nx",
      "@coinagerie/output",
      "@coinagerie/vocabulary",
    ],
    workspaceRoot: WORKSPACE_ROOT,
  });
  let workspace: ConsumerWorkspace;

  /** Writes a project whose source names `orbit` and `planner`, with a glossary destination. */
  function writeProject(name: string): void {
    const project = path.join(workspace.directory, "packages", name);

    fs.mkdirSync(path.join(project, "src"), { recursive: true });
    fs.writeFileSync(
      path.join(project, "project.json"),
      JSON.stringify({ name, projectType: "library" }),
    );
    fs.writeFileSync(
      path.join(project, "coinagerie.config.mjs"),
      'export default { outputs: [{ path: "GLOSSARY.md", type: "markdown" }] };\n',
    );
    fs.writeFileSync(
      path.join(project, "src/orbit-planner.ts"),
      "export const orbitPlanner = 1;\n",
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
      packages: ["@coinagerie/cli", "@coinagerie/nx"],
    });
    workspace.registerPlugin("@coinagerie/nx");
    writeProject("documented");
    writeProject("undocumented");
  });

  it("passes the check of a project whose glossary covers its words", async () => {
    expect.hasAssertions();

    const written = await runTarget("documented:coinagerie-check", ["--write"]);

    expect(written.exitCode).toBe(0);

    const result = await runTarget("documented:coinagerie-check");

    expect(result.exitCode).toBe(0);
  }, 900_000);

  it("fails the check of a project whose glossary lacks its words", async () => {
    expect.hasAssertions();

    const result = await runTarget("undocumented:coinagerie-check");

    expect(result.exitCode).not.toBe(0);
    expect(result.stdout + result.stderr).toContain("orbit");
  });
});

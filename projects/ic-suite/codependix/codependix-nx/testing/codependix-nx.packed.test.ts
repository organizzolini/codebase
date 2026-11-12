import fs from "node:fs";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { startVerdaccioPluginRunner } from "@codebase/testing/end-to-end";

import type {
  CommandResult,
  ConsumerWorkspace,
  VerdaccioPluginRunner,
} from "@codebase/testing/end-to-end";

const WORKSPACE_ROOT = path.resolve(import.meta.dirname, "../../../../..");

/** The version of `name` this workspace has installed, so a registry release cannot move the leg. */
function installedVersion(name: string): string {
  const manifest = JSON.parse(
    fs.readFileSync(
      path.join(WORKSPACE_ROOT, "node_modules", name, "package.json"),
      "utf8",
    ),
  ) as { version: string };

  return manifest.version;
}

describe("the codependix plugin installed from a registry", () => {
  let runner: VerdaccioPluginRunner;
  let workspace: ConsumerWorkspace;

  /** Writes the project `name`, which depends on each of `dependencies`. */
  function writeProject(name: string, dependencies: readonly string[]): void {
    const project = path.join(workspace.directory, "packages", name);

    fs.mkdirSync(project, { recursive: true });
    fs.writeFileSync(
      path.join(project, "project.json"),
      JSON.stringify({
        implicitDependencies: dependencies,
        name,
        projectType: "library",
      }),
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
    runner = await startVerdaccioPluginRunner({
      localScopes: ["@codependix"],
    });
    await runner.publish({
      packages: [
        "@codependix/boundaries",
        "@codependix/cli",
        "@codependix/configuration",
        "@codependix/core",
        "@codependix/file-imports",
        "@codependix/nestjs-modules",
        "@codependix/nx",
        "@codependix/nx-projects",
        "@codependix/output",
      ],
      workspaceRoot: WORKSPACE_ROOT,
    });
    workspace = await runner.createWorkspace({
      dependencies: {
        nx: installedVersion("nx"),
        typescript: installedVersion("typescript"),
      },
      packages: ["@codependix/cli", "@codependix/nx"],
    });
    workspace.registerPlugin("@codependix/nx", {
      configurationPath: "codependix.config.json",
    });
    // The gate boots NestJS containers from sources, which needs decorator metadata.
    fs.writeFileSync(
      path.join(workspace.directory, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: {
          emitDecoratorMetadata: true,
          experimentalDecorators: true,
          module: "esnext",
          target: "es2022",
        },
      }),
    );
    fs.writeFileSync(
      path.join(workspace.directory, "codependix.config.json"),
      JSON.stringify({
        boundaries: {
          nxProjects: [
            {
              from: { id: ["a"] },
              kind: "forbid",
              name: "a-is-a-leaf",
              to: { id: ["b"] },
            },
          ],
        },
      }),
    );
    writeProject("a", ["b"]);
    writeProject("b", []);
  });

  afterAll(async () => {
    await runner.stop();
  });

  it("passes the gate of a project that breaks no boundary", async () => {
    expect.hasAssertions();

    const result = await runTarget("b:codependix-bound");

    expect(result.exitCode).toBe(0);
  });

  it("fails the gate of a project that crosses a forbidden boundary", async () => {
    expect.hasAssertions();

    const result = await runTarget("a:codependix-bound");

    expect(result.exitCode).not.toBe(0);
    expect(result.stdout + result.stderr).toContain("a-is-a-leaf");
  });
});

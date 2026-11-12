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
  let runner: VerdaccioPluginRunner;
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
    runner = await startVerdaccioPluginRunner({
      localScopes: ["@callidescope"],
    });
    await runner.publish({
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
    workspace = await runner.createWorkspace({
      dependencies: {
        nx: installedVersion("nx"),
        typescript: installedVersion("typescript"),
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

  afterAll(async () => {
    await runner.stop();
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

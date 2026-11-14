import fs from "node:fs";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createTemporaryDirectory, writeFileTree } from "@codebase/testing";
import { createTarballSandboxRunner } from "@codebase/testing/end-to-end";

import type {
  CommandResult,
  TarballSandboxRunner,
} from "@codebase/testing/end-to-end";

const WORKSPACE_ROOT = path.resolve(import.meta.dirname, "../../../../..");

/** The projects `a` → `b` → `c`, as an Nx project graph. */
const PROJECT_GRAPH = {
  dependencies: {
    a: [{ source: "a", target: "b", type: "static" }],
    b: [{ source: "b", target: "c", type: "static" }],
    c: [],
  },
  nodes: Object.fromEntries(
    ["a", "b", "c"].map((name) => [
      name,
      { data: { root: `packages/${name}` }, name, type: "lib" },
    ]),
  ),
};

describe("the packed codependix command", () => {
  let sandbox: TarballSandboxRunner;

  /** Writes the project graph and a configuration over it; returns the configuration's path. */
  function writeWorkspace(directory: string): string {
    writeFileTree(directory, {
      "codependix-graph.json": JSON.stringify(PROJECT_GRAPH),
      "codependix.config.json": JSON.stringify({
        include: [],
        projectGraph: "codependix-graph.json",
        workspace: {
          nxProjects: {
            json: { path: "nx-projects.json" },
            target: "json",
          },
        },
      }),
    });

    return path.join(directory, "codependix.config.json");
  }

  /** Runs the installed binary from `directory`, which is outside the sandbox. */
  async function codependix(
    directory: string,
    args: readonly string[],
  ): Promise<CommandResult> {
    return sandbox
      .command(path.join(sandbox.directory, "node_modules/.bin/codependix"), [
        ...args,
      ])
      .inDirectory(directory)
      .run();
  }

  beforeAll(async () => {
    sandbox = await createTarballSandboxRunner({
      packages: [
        "@codependix/boundaries",
        "@codependix/cli",
        "@codependix/configuration",
        "@codependix/core",
        "@codependix/file-imports",
        "@codependix/nestjs-modules",
        "@codependix/nx-projects",
        "@codependix/output",
      ],
      workspaceRoot: WORKSPACE_ROOT,
    });
  });

  afterAll(() => {
    sandbox.dispose();
  });

  it("lists its commands under --help", async () => {
    expect.hasAssertions();

    const result = await sandbox.command("codependix", ["--help"]).run();

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("map");
    expect(result.stdout).toContain("path");
  });

  it("maps a project graph into the JSON file it configures", async () => {
    expect.hasAssertions();

    const directory = createTemporaryDirectory("codependix-packed-map");
    const configuration = writeWorkspace(directory);
    const result = await codependix(directory, [
      "map",
      "--config",
      configuration,
      "--write",
    ]);

    expect(result.exitCode).toBe(0);

    const written = JSON.parse(
      fs.readFileSync(path.join(directory, "nx-projects.json"), "utf8"),
    ) as Record<string, unknown>;

    expect(JSON.stringify(written)).toContain('"c"');
  });

  it("finds the path between two projects", async () => {
    expect.hasAssertions();

    const directory = createTemporaryDirectory("codependix-packed-path");
    const configuration = writeWorkspace(directory);
    const result = await codependix(directory, [
      "path",
      "a",
      "c",
      "--config",
      configuration,
      "--format",
      "markdown",
    ]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("`a` → `b` → `c`");
  });
});

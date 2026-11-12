import fs from "node:fs";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createTemporaryDirectory } from "@codebase/testing";
import { createTarballSandboxRunner } from "@codebase/testing/end-to-end";

import type {
  CommandResult,
  TarballSandboxRunner,
} from "@codebase/testing/end-to-end";

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
  let sandbox: TarballSandboxRunner;

  /** Writes a workspace of one traceable project; returns the workspace directory. */
  function writeWorkspace(): string {
    const directory = createTemporaryDirectory("callidescope-packed-project");
    const project = path.join(directory, "packages/readable");

    fs.mkdirSync(path.join(project, "src"), { recursive: true });
    fs.writeFileSync(
      path.join(directory, "callidescope.config.json"),
      JSON.stringify({ limits: { maximumDepth: 6 } }),
    );
    fs.writeFileSync(
      path.join(project, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: { noLib: true, target: "es2022" },
        include: ["src/**/*.ts"],
      }),
    );
    fs.writeFileSync(
      path.join(project, "src/index.ts"),
      "export function entry(): void {\n  helper();\n}\n\nfunction helper(): void {}\n",
    );
    fs.writeFileSync(
      path.join(project, "callidescope.config.js"),
      PROJECT_CONFIGURATION,
    );

    return directory;
  }

  /** Runs the installed binary from `directory`, which is outside the sandbox. */
  async function callidescope(
    directory: string,
    args: readonly string[],
  ): Promise<CommandResult> {
    return sandbox
      .command(path.join(sandbox.directory, "node_modules/.bin/callidescope"), [
        ...args,
        "--config",
        path.join(directory, "callidescope.config.json"),
      ])
      .inDirectory(directory)
      .run();
  }

  beforeAll(async () => {
    sandbox = await createTarballSandboxRunner({
      packages: [
        "@callidescope/cli",
        "@callidescope/configuration",
        "@callidescope/core",
        "@callidescope/graph",
        "@callidescope/output",
      ],
      workspaceRoot: WORKSPACE_ROOT,
    });
  });

  afterAll(() => {
    sandbox.dispose();
  });

  it("lists its commands under --help", async () => {
    expect.hasAssertions();

    const result = await sandbox.command("callidescope", ["--help"]).run();

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

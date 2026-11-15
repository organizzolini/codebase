import path from "node:path";

import { describe, expect, it } from "vitest";

import { createFileTree } from "@codebase/testing";
import { runSourceCommand } from "@codebase/testing/end-to-end";

import { environmentSchema } from "./callidescope-cli.constants";

/** This package's own `callidescope-cli.main.ts`, spawned the way the `start` target does. */
const ENTRY_POINT = path.resolve(
  import.meta.dirname,
  "callidescope-cli.main.ts",
);

/** Gitignored directory inside the package, where swc-node resolves its hook from a spawned run's cwd. */
const SPAWN_PARENT = path.resolve(import.meta.dirname, "..", "tmp");

/** Per-run timeout, past Vitest's five-second default. CI builds take 5.7s. */
const SPAWNED_RUN_TIMEOUT = 30_000;

/** Compiler options for spawned runs; NestJS injection needs decorator metadata. */
const LOADER_PROJECT = path.resolve(import.meta.dirname, "..", "tsconfig.json");

/**
 * One project's complete configuration file. JavaScript, not JSON, because JSON cannot
 * spell `undefined`, which the configuration uses to disable breadth and publishing.
 */
function projectConfigurationFile(projectRoot: string): Record<string, string> {
  return {
    [path.join(projectRoot, "callidescope.config.js")]: `export default {
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
    };\n`,
  };
}

/** A project holding one traceable source file. */
function readableProjectFiles(name: string): Record<string, string> {
  const root = path.join("packages", name);

  return {
    [path.join(root, "src", "index.ts")]: "export function entry(): void {}\n",
    [path.join(root, "tsconfig.json")]: JSON.stringify({
      compilerOptions: { noLib: true, target: "es2022" },
      include: ["src/**/*.ts"],
    }),
    ...projectConfigurationFile(root),
  };
}

/**
 * Spawns a real process: nest-commander writes a thrown error to stderr and leaves the
 * exit code at zero, which in-process tests cannot see.
 */
async function runCallidescope(
  workspaceRoot: string,
  commandArguments: readonly string[] = [
    "callidescope",
    "--config",
    path.join(workspaceRoot, "callidescope.config.json"),
    "--check",
    "depth",
  ],
): Promise<{
  output: string;
  status: number;
}> {
  const result = await runSourceCommand({
    args: commandArguments,
    directory: workspaceRoot,
    entry: ENTRY_POINT,
    timeout: SPAWNED_RUN_TIMEOUT,
    tsconfig: LOADER_PROJECT,
  });

  return {
    output: `${result.stdout}${result.stderr}`,
    status: result.exitCode,
  };
}

/**
 * A project whose tsconfig names a target TypeScript rejects, mirroring the
 * unreadable example in `codependix-examples`, which must stay unreadable.
 */
function unreadableProjectFiles(name: string): Record<string, string> {
  const root = path.join("packages", name);

  return {
    [path.join(root, "src", "index.ts")]: "export function broken(): void {}\n",
    [path.join(root, "tsconfig.json")]: JSON.stringify({
      compilerOptions: { target: "not-a-real-target" },
      include: ["src/**/*.ts"],
    }),
    ...projectConfigurationFile(root),
  };
}

/**
 * Workspace with the default config plus the given projects, rooted inside the package, so swc-node
 * resolves from the spawned cwd. Assert exit codes, not paths.
 */
function writeWorkspace(projects: Record<string, string>[] = []): string {
  return createFileTree(
    {
      "callidescope.config.json": JSON.stringify({
        limits: { maximumDepth: 6 },
      }),
      ...Object.fromEntries(projects.flatMap((files) => Object.entries(files))),
    },
    { label: "callidescope-exit", parent: SPAWN_PARENT },
  );
}

describe("main end-to-end suite", () => {
  describe("environment schema e2e", () => {
    it("allows an empty schema by default", () => {
      expect.hasAssertions();
      expect(environmentSchema.parse({})).toStrictEqual({});
    });
  });

  describe(
    "the exit code of a run that could not trace",
    () => {
      it("passes a workspace it traced without finding anything", async () => {
        expect.hasAssertions();

        const workspaceRoot = writeWorkspace([
          readableProjectFiles("readable"),
        ]);

        const { status } = await runCallidescope(workspaceRoot);

        expect(status).toBe(0);
      });

      // The configuration is never searched for: a workspace holding a
      // perfectly good `callidescope.config.json` beside the cwd is still
      // refused when the command line does not name it.
      it.each([["callidescope"], ["depth"], ["breadth"], ["limits"]])(
        "refuses `%s` with no --config, even beside a configuration file",
        async (command) => {
          expect.hasAssertions();

          const workspaceRoot = writeWorkspace([
            readableProjectFiles("readable"),
          ]);

          const { output, status } = await runCallidescope(workspaceRoot, [
            command,
          ]);

          expect(status).not.toBe(0);
          expect(output).toContain("--config");
        },
      );

      it("fails a workspace whose only project cannot be read", async () => {
        expect.hasAssertions();

        // The regression. This used to print the parsing failure and exit 0,
        // so the depth gate passed for having traced nothing at all.
        const workspaceRoot = writeWorkspace([
          unreadableProjectFiles("broken"),
        ]);

        const { status } = await runCallidescope(workspaceRoot);

        expect(status).toBe(1);
      });

      it("fails a workspace holding one unreadable project among readable ones", async () => {
        expect.hasAssertions();

        const workspaceRoot = writeWorkspace([
          readableProjectFiles("readable"),
          unreadableProjectFiles("broken"),
        ]);

        const { output, status } = await runCallidescope(workspaceRoot);

        // Fails on the project it could not read, rather than on anything it
        // measured through a workspace that was missing one.
        expect(status).toBe(1);
        expect(output).toContain("Rejected a project it could not read");
      });
    },
    SPAWNED_RUN_TIMEOUT,
  );
});

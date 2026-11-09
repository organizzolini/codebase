import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

import { createTemporaryDirectory } from "@codebase/testing";

import { environmentSchema } from "./callidescope-cli.constants";

/** This package's own `callidescope-cli.main.ts`, spawned the way the `start` target does. */
const ENTRY_POINT = path.resolve(
  import.meta.dirname,
  "callidescope-cli.main.ts",
);

/**
 * The TypeScript loader as an absolute URL. Resolved here, not through `esm-register`,
 * because runs execute in a workspace with no `node_modules`.
 */
const LOADER_HOOK = import.meta.resolve("@swc-node/register/esm");

/**
 * Per-run timeout. Spawned runs build real programs, and CI measured 5.4 and 5.7 seconds,
 * past Vitest's five-second default.
 */
const SPAWNED_RUN_TIMEOUT = 30_000;

/**
 * Compiler options the spawned run reads. Without them, NestJS constructor injection loses
 * the decorator metadata it needs.
 */
const LOADER_PROJECT = path.resolve(import.meta.dirname, "..", "tsconfig.json");

/**
 * Spawns a real process: nest-commander writes a thrown error to stderr and leaves the
 * exit code at zero, which in-process tests cannot see.
 */
function runCallidescope(
  workspaceRoot: string,
  commandArguments: readonly string[] = [
    "callidescope",
    "--config",
    path.join(workspaceRoot, "callidescope.config.json"),
    "--check",
    "depth",
  ],
): {
  output: string;
  status: null | number;
} {
  const result = spawnSync(
    process.execPath,
    [
      "--import",
      pathToFileURL(path.join(workspaceRoot, "register.mjs")).toString(),
      ENTRY_POINT,
      ...commandArguments,
    ],
    {
      cwd: workspaceRoot,
      encoding: "utf8",
      env: { ...process.env, SWC_NODE_PROJECT: LOADER_PROJECT },
    },
  );

  return {
    output: `${result.stdout}${result.stderr}`,
    status: result.status,
  };
}

/**
 * Writes one project's complete configuration file. JavaScript, not JSON, because JSON cannot
 * spell `undefined`, which the configuration uses to disable breadth and publishing.
 */
function writeProjectConfiguration(projectRoot: string): void {
  writeFileSync(
    path.join(projectRoot, "callidescope.config.js"),
    `export default {
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
    "utf8",
  );
}

/** Writes a project holding one traceable source file. */
function writeReadableProject(workspaceRoot: string, name: string): void {
  const root = path.join(workspaceRoot, "packages", name);

  mkdirSync(path.join(root, "src"), { recursive: true });
  writeFileSync(
    path.join(root, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: { noLib: true, target: "es2022" },
      include: ["src/**/*.ts"],
    }),
    "utf8",
  );
  writeFileSync(
    path.join(root, "src", "index.ts"),
    "export function entry(): void {}\n",
    "utf8",
  );
  writeProjectConfiguration(root);
}

/**
 * Writes a project whose tsconfig names a target TypeScript rejects, mirroring the
 * unreadable example in `codependix-examples`, which must stay unreadable.
 */
function writeUnreadableProject(workspaceRoot: string, name: string): void {
  const root = path.join(workspaceRoot, "packages", name);

  mkdirSync(path.join(root, "src"), { recursive: true });
  writeFileSync(
    path.join(root, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: { target: "not-a-real-target" },
      include: ["src/**/*.ts"],
    }),
    "utf8",
  );
  writeFileSync(
    path.join(root, "src", "index.ts"),
    "export function broken(): void {}\n",
    "utf8",
  );
  writeProjectConfiguration(root);
}

/**
 * Workspace with the default config, rooted at the resolved path since macOS temp directories
 * are symlinks that break ownership. Assert exit codes, not paths.
 */
function writeWorkspace(): string {
  const workspaceRoot = createTemporaryDirectory("callidescope-exit");

  writeFileSync(
    path.join(workspaceRoot, "callidescope.config.json"),
    JSON.stringify({ limits: { maximumDepth: 6 } }),
    "utf8",
  );
  writeFileSync(
    path.join(workspaceRoot, "register.mjs"),
    `import { register } from "node:module";\nregister(${JSON.stringify(LOADER_HOOK)});\n`,
    "utf8",
  );

  return workspaceRoot;
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
      it("passes a workspace it traced without finding anything", () => {
        expect.hasAssertions();

        const workspaceRoot = writeWorkspace();

        writeReadableProject(workspaceRoot, "readable");

        expect(runCallidescope(workspaceRoot).status).toBe(0);
      });

      // The configuration is never searched for: a workspace holding a
      // perfectly good `callidescope.config.json` beside the cwd is still
      // refused when the command line does not name it.
      it.each([["callidescope"], ["depth"], ["breadth"], ["limits"]])(
        "refuses `%s` with no --config, even beside a configuration file",
        (command) => {
          expect.hasAssertions();

          const workspaceRoot = writeWorkspace();

          writeReadableProject(workspaceRoot, "readable");

          const { output, status } = runCallidescope(workspaceRoot, [command]);

          expect(status).not.toBe(0);
          expect(output).toContain("--config");
        },
      );

      it("fails a workspace whose only project cannot be read", () => {
        expect.hasAssertions();

        // The regression. This used to print the parsing failure and exit 0,
        // so the depth gate passed for having traced nothing at all.
        const workspaceRoot = writeWorkspace();

        writeUnreadableProject(workspaceRoot, "broken");

        expect(runCallidescope(workspaceRoot).status).toBe(1);
      });

      it("fails a workspace holding one unreadable project among readable ones", () => {
        expect.hasAssertions();

        const workspaceRoot = writeWorkspace();

        writeReadableProject(workspaceRoot, "readable");
        writeUnreadableProject(workspaceRoot, "broken");

        const { output, status } = runCallidescope(workspaceRoot);

        // Fails on the project it could not read, rather than on anything it
        // measured through a workspace that was missing one.
        expect(status).toBe(1);
        expect(output).toContain("Rejected a project it could not read");
      });
    },
    SPAWNED_RUN_TIMEOUT,
  );
});

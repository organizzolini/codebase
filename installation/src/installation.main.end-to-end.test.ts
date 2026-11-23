import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { beforeEach, describe, expect, it } from "vitest";

import { createTemporaryDirectory } from "@codebase/testing";

import { environmentSchema } from "./installation.constants";

import type { SpawnSyncReturns } from "node:child_process";

/** The workspace root, which the Nx `start` target runs from. */
const WORKSPACE_ROOT = path.resolve(import.meta.dirname, "../..");

const COMMAND_PATH = path.resolve(import.meta.dirname, "installation.main.ts");

/** Fixtures live in gitignored `tmp`, since OS temp breaks alias resolution. */
const FIXTURE_ROOT = path.resolve(import.meta.dirname, "../tmp");

/** Every command this project registers. */
const COMMAND_NAMES = [
  "dependencies",
  "environment-files",
  "installed-skills",
  "setup",
  "shell-configuration",
  "software",
  "update-reui-skill",
  "vscode-settings",
];

// Each test boots a whole Node process through the SWC loader, which takes
// several seconds on a busy machine.
const BOOT_TIMEOUT_MILLISECONDS = 60_000;

describe("main end-to-end suite", () => {
  describe("environment schema e2e", () => {
    it("allows an empty schema by default", () => {
      expect.hasAssertions();
      expect(environmentSchema.parse({})).toStrictEqual({});
    });
  });

  // A dependency-injection gap fails when the container is built, which unit
  // tests over hand-assembled testing modules never do. Asking each command
  // for its help builds the real container through the real command factory
  // and runs none of the command's steps.
  describe.each(COMMAND_NAMES)("the %s command", (name) => {
    it(
      "boots through the command factory",
      () => {
        expect.hasAssertions();

        const result = spawnSync(
          process.execPath,
          [
            "--import",
            "@swc-node/register/esm-register",
            "installation/src/installation.main.ts",
            name,
            "--help",
          ],
          {
            cwd: WORKSPACE_ROOT,
            encoding: "utf8",
            env: { ...process.env, NODE_OPTIONS: "" },
          },
        );

        expect(result.stderr).not.toContain("Nest can't resolve dependencies");
        expect(result.status).toBe(0);
        expect(result.stdout).toContain(
          `Usage: installation.main ${name} [options]`,
        );
      },
      BOOT_TIMEOUT_MILLISECONDS,
    );
  });

  // Booted as a real process through the real command factory, because a
  // provider missing from a module only fails once Nest builds the whole
  // container, which neither the unit tests nor the lint gate ever do.
  describe("the installed-skills command", () => {
    let workspace: string;

    /** Runs the command in the fixture workspace with a known environment. */
    const runCommand = (
      args: string[],
      environment: Record<string, string> = {},
    ): SpawnSyncReturns<string> =>
      spawnSync(
        process.execPath,
        [
          "--import",
          "@swc-node/register/esm-register",
          COMMAND_PATH,
          "installed-skills",
          ...args,
        ],
        {
          cwd: workspace,
          encoding: "utf8",
          env: {
            ...process.env,
            CI: "",
            FORCE_COLOR: "0",
            GITHUB_ACTIONS: "",
            SKILLS_INSTALL_FORCE: "",
            SKIP_SKILLS_INSTALL: "",
            ...environment,
          },
          timeout: 120_000,
        },
      );

    /** Writes a lockfile declaring these skills, with only some installed. */
    const createWorkspace = (locked: string[], installed: string[]): void => {
      writeFileSync(
        path.join(workspace, "skills-lock.json"),
        JSON.stringify({
          skills: Object.fromEntries(locked.map((name) => [name, {}])),
          version: 1,
        }),
      );
      for (const name of installed) {
        const directory = path.join(workspace, ".agents", "skills", name);
        mkdirSync(directory, { recursive: true });
        writeFileSync(path.join(directory, "SKILL.md"), `# ${name}\n`);
      }
    };

    beforeEach(() => {
      workspace = createTemporaryDirectory("installed-skills", FIXTURE_ROOT);
      // `@swc-node/register` reads a `tsconfig.json` at `cwd` exactly, never
      // an ancestor's, so the fixture extends this project's real one.
      writeFileSync(
        path.join(workspace, "tsconfig.json"),
        JSON.stringify({
          extends: path.relative(
            workspace,
            path.resolve(import.meta.dirname, "../configuration/tsconfig.json"),
          ),
        }),
      );
    });

    it("prints only the missing-skills report and exits 1", () => {
      createWorkspace(["alpha", "beta"], ["beta"]);

      const result = runCommand(["check"]);

      expect(result.status).toBe(1);
      expect(result.stdout).toMatch(
        /^⚠️ {2}Skills declared in skills-lock\.json are not installed: alpha\n/u,
      );
      expect(result.stdout).toMatch(/to confirm\.$/u);
    }, 150_000);

    it("prints nothing and exits 0 when every skill is installed", () => {
      createWorkspace(["alpha"], ["alpha"]);

      const result = runCommand(["check"]);

      expect(result.status).toBe(0);
      expect(result.stdout).toBe("");
    }, 150_000);

    it("leaves skills alone in write mode under SKIP_SKILLS_INSTALL", () => {
      createWorkspace(["alpha"], []);

      const result = runCommand(["write"], { SKIP_SKILLS_INSTALL: "1" });

      expect(result.status).toBe(0);
      expect(result.stderr).toContain("SKIP_SKILLS_INSTALL is set");
    }, 150_000);
  });
});

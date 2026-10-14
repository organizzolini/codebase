import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { environmentSchema } from "./synchronization.constants";

import type { SpawnSyncReturns } from "node:child_process";

const COMMAND_PATH = path.resolve(
  import.meta.dirname,
  "synchronization.main.ts",
);

/**
 * Where a spawned run's fixture workspace is rooted: inside this project, in
 * its gitignored `tmp`, never the operating system's temporary directory.
 * `@swc-node/register` resolves itself and this project's path aliases from
 * `cwd` upward, which a directory outside the workspace never reaches.
 */
const FIXTURE_ROOT = path.resolve(import.meta.dirname, "../tmp");

describe("main end-to-end suite", () => {
  describe("environment schema e2e", () => {
    it("allows an empty schema by default", () => {
      expect.hasAssertions();
      expect(environmentSchema.parse({})).toStrictEqual({});
    });
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
      mkdirSync(FIXTURE_ROOT, { recursive: true });
      workspace = mkdtempSync(path.join(FIXTURE_ROOT, "installed-skills-"));
      // `@swc-node/register` reads a `tsconfig.json` at `cwd` exactly, never
      // an ancestor's, so the fixture extends this project's real one.
      writeFileSync(
        path.join(workspace, "tsconfig.json"),
        JSON.stringify({
          extends: path.relative(
            workspace,
            path.resolve(import.meta.dirname, "../tsconfig.json"),
          ),
        }),
      );
    });

    afterEach(() => {
      rmSync(workspace, { force: true, recursive: true });
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

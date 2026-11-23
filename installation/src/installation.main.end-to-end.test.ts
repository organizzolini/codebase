import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
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

/** Git configuration a fixture commit needs, whatever the machine's is. */
const FIXTURE_GIT_CONFIGURATION = [
  "-c",
  "commit.gpgsign=false",
  "-c",
  "user.email=fixture@example.com",
  "-c",
  "user.name=Fixture",
];

/** A branch-name configuration small enough to compare whole. */
const FIXTURE_BRANCH_CONFIGURATION = String.raw`module.exports = {
  pattern: "^(feat|fix)/validation-[a-z0-9-]+$",
  errorMsg: "\n❌ Invalid branch name\n\n🏷️ Valid types: feat, fix\n",
};
`;

/** Every command this project registers. */
const COMMAND_NAMES = [
  "dependencies",
  "environment-files",
  "installed-skills",
  "session-branch-name",
  "session-worktree-name",
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

  // Booted as a real process through the real command factory, because a
  // provider missing from a module only fails once Nest builds the whole
  // container, which neither the unit tests nor the lint gate ever do. `git`
  // is real here too, over a repository made for each test.
  describe("the session commands", () => {
    let fixture: string;

    /** Runs one session command from this directory. */
    const runCommand = (
      name: string,
      directory: string,
    ): SpawnSyncReturns<string> =>
      spawnSync(
        process.execPath,
        ["--import", "@swc-node/register/esm-register", COMMAND_PATH, name],
        {
          cwd: directory,
          encoding: "utf8",
          env: { ...process.env, FORCE_COLOR: "0" },
          timeout: 120_000,
        },
      );

    /** Runs `git` in this directory, failing the test if it fails. */
    const git = (directory: string, args: string[]): void => {
      const result = spawnSync("git", [...FIXTURE_GIT_CONFIGURATION, ...args], {
        cwd: directory,
        encoding: "utf8",
      });

      if (result.status !== 0) {
        throw new Error(`git ${args.join(" ")} failed: ${result.stderr}`);
      }
    };

    /** swc-node reads only the `tsconfig.json` at `cwd`, never an ancestor's. */
    const extendProjectTsconfig = (directory: string): void => {
      writeFileSync(
        path.join(directory, "tsconfig.json"),
        JSON.stringify({
          extends: path.relative(
            directory,
            path.resolve(import.meta.dirname, "../configuration/tsconfig.json"),
          ),
        }),
      );
    };

    /** A repository on this branch, holding the fixture branch rules. */
    const createRepository = (branch: string): string => {
      const repository = path.join(fixture, "repository");
      mkdirSync(repository);
      git(repository, ["init", "--quiet", "--initial-branch", branch]);
      extendProjectTsconfig(repository);
      writeFileSync(
        path.join(repository, "validate-branch-name.config.cjs"),
        FIXTURE_BRANCH_CONFIGURATION,
      );
      return repository;
    };

    beforeEach(() => {
      fixture = createTemporaryDirectory("session-commands", FIXTURE_ROOT);
    });

    it("prints nothing for a compliant branch and exits 0", () => {
      const repository = createRepository("feat/validation-session");

      const result = runCommand("session-branch-name", repository);

      expect(result.status).toBe(0);
      expect(result.stdout).toBe("");
    }, 150_000);

    it("prints only the branch report for a non-compliant branch and exits 1", () => {
      const repository = createRepository("Bad_Name");

      const result = runCommand("session-branch-name", repository);

      expect(result.status).toBe(1);
      expect(result.stdout).toBe(
        [
          "❌ Invalid branch name",
          "",
          "🏷️ Valid types: feat, fix",
          "",
          "🚨 Invoke the rename-branch skill to rename this branch before doing anything else.",
        ].join("\n"),
      );
    }, 150_000);

    it("prints nothing in a main checkout and exits 0", () => {
      const repository = createRepository("feat/validation-session");

      const result = runCommand("session-worktree-name", repository);

      expect(result.status).toBe(0);
      expect(result.stdout).toBe("");
    }, 150_000);

    it("prints only the worktree report for a non-kebab-case worktree that git does not ignore, and exits 1", () => {
      const repository = createRepository("feat/validation-session");
      git(repository, ["commit", "--quiet", "--allow-empty", "-m", "root"]);
      const worktree = path.join(repository, "Bad_Worktree");
      git(repository, [
        "worktree",
        "add",
        "--quiet",
        "-b",
        "feat/validation-linked",
        worktree,
      ]);
      extendProjectTsconfig(worktree);

      const result = runCommand("session-worktree-name", worktree);

      expect(result.status).toBe(1);
      expect(result.stdout).toMatch(
        /^❌ Invalid worktree directory name: "Bad_Worktree"\n/u,
      );
      expect(result.stdout).toContain(
        "❌ Worktree directory is not gitignored:",
      );
      expect(result.stdout).toMatch(
        /[^\n]\n🚨 Invoke the using-git-worktrees skill to configure a compliant isolated workspace\.$/u,
      );
    }, 150_000);

    it("keeps a failure's diagnostic off standard output", () => {
      const repository = createRepository("Bad_Name");
      rmSync(path.join(repository, "validate-branch-name.config.cjs"));

      const result = runCommand("session-branch-name", repository);

      expect(result.status).toBe(1);
      expect(result.stdout).toBe("");
      expect(result.stderr).toContain("validate-branch-name.config.cjs");
    }, 150_000);
  });
});

import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { environmentSchema } from "./validation.constants";

import type { SpawnSyncReturns } from "node:child_process";

const COMMAND_PATH = path.resolve(import.meta.dirname, "validation.main.ts");

/**
 * Where a spawned run's fixture workspace is rooted: inside this project, in
 * its gitignored `tmp`, never the operating system's temporary directory.
 * `@swc-node/register` resolves itself and this project's path aliases from
 * `cwd` upward, which a directory outside the workspace never reaches.
 */
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

describe("main end-to-end suite", () => {
  describe("environment schema e2e", () => {
    it("allows an empty schema by default", () => {
      expect.hasAssertions();
      expect(environmentSchema.parse({})).toStrictEqual({});
    });
  });

  // Booted as a real process through the real command factory, because a
  // provider missing from a module only fails once Nest builds the whole
  // container, which neither the unit tests nor the lint gate ever do. `git`
  // is real here too, over a repository made for each test.
  describe("the session commands", () => {
    let fixture: string;

    /** Runs one validation command from this directory. */
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

    /**
     * `@swc-node/register` reads a `tsconfig.json` at `cwd` exactly, never an
     * ancestor's, so every directory a command runs from extends this
     * project's real one.
     */
    const extendProjectTsconfig = (directory: string): void => {
      writeFileSync(
        path.join(directory, "tsconfig.json"),
        JSON.stringify({
          extends: path.relative(
            directory,
            path.resolve(import.meta.dirname, "../tsconfig.json"),
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
      mkdirSync(FIXTURE_ROOT, { recursive: true });
      fixture = mkdtempSync(path.join(FIXTURE_ROOT, "session-commands-"));
    });

    afterEach(() => {
      rmSync(fixture, { force: true, recursive: true });
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

    it("prints only the worktree report for a badly named, unignored worktree and exits 1", () => {
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
        /\n\n🚨 Invoke the using-git-worktrees skill to configure a compliant isolated workspace\.$/u,
      );
    }, 150_000);
  });
});

import { writeFileSync } from "node:fs";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  captureExitCode,
  captureOutput,
  createTemporaryDirectory,
} from "@codebase/testing";
import {
  buildTestingModule,
  expectLoggerContext,
} from "@codebase/testing/nestjs";

import { SessionBranchNameGitService } from "./session-branch-name-git.service";
import { SessionBranchNameCommand } from "./session-branch-name.command";
import { SessionBranchNameService } from "./session-branch-name.service";

import type { GitResult } from "./session-branch-name.types";

/** The repository this suite runs in, whose real branch rules are read too. */
const REPOSITORY_ROOT = path.resolve(import.meta.dirname, "../../../..");

const RENAME_DIRECTIVE =
  "🚨 Invoke the rename-branch skill to rename this branch before doing anything else.";

/** A branch-name configuration small enough to read in a failure message. */
const FIXTURE_CONFIGURATION = `module.exports = {
  pattern: String.raw\`^((feat|fix)\\/(lexico|validation)-[a-z0-9-]+|main)$\`,
  errorMsg: \`
❌ Invalid branch name

🏷️ Valid types: feat, fix
🔭 Valid scopes: lexico, validation
\`,
};
`;

/** The command's real service, over a mocked `git`. */
const moduleOptions = {
  mocks: [SessionBranchNameGitService],
  providers: [SessionBranchNameService],
};

describe(SessionBranchNameCommand, () => {
  let workspace: string;
  let gitCalls: string[][];
  let exitCode: ReturnType<typeof captureExitCode>;
  let printed: () => string;

  /** Builds the command over the real service and a fake `git`. */
  const createCommand = async (
    answer: (args: readonly string[]) => GitResult,
  ): Promise<SessionBranchNameCommand> => {
    const { instance, mock } = await buildTestingModule(
      SessionBranchNameCommand,
      moduleOptions,
    );

    mock(SessionBranchNameGitService).run.mockImplementation(
      (args: readonly string[]): GitResult => {
        gitCalls.push([...args]);
        return answer(args);
      },
    );

    return instance;
  };

  /** A `git` whose current branch is this one. */
  const onBranch = (branch: string) => (): GitResult => ({
    available: true,
    status: 0,
    stdout: `${branch}\n`,
  });

  beforeEach(() => {
    workspace = createTemporaryDirectory("session-branch-name");
    writeFileSync(
      path.join(workspace, "validate-branch-name.config.cjs"),
      FIXTURE_CONFIGURATION,
    );
    gitCalls = [];
    exitCode = captureExitCode();
    printed = captureOutput().stdout;
    vi.spyOn(process, "cwd").mockReturnValue(workspace);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      SessionBranchNameCommand,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(SessionBranchNameCommand);
  });

  it("sets logger context", async () => {
    expect.hasAssertions();

    await expectLoggerContext(SessionBranchNameCommand, moduleOptions);
  });

  it("asks git for the current branch", async () => {
    const session = await createCommand(onBranch("feat/lexico-search"));

    await session.run();

    expect(gitCalls).toStrictEqual([["branch", "--show-current"]]);
  });

  it("prints nothing and exits 0 for a branch that follows the convention", async () => {
    const session = await createCommand(onBranch("feat/lexico-search"));

    await session.run();

    expect(printed()).toBe("");
    expect(exitCode()).toBeUndefined();
  });

  it("prints the configured error and the rename directive, and exits 1, for one that does not", async () => {
    const session = await createCommand(onBranch("Bad_Name"));

    await session.run();

    expect(printed()).toBe(
      [
        "❌ Invalid branch name",
        "",
        "🏷️ Valid types: feat, fix",
        "🔭 Valid scopes: lexico, validation",
        "",
        RENAME_DIRECTIVE,
      ].join("\n"),
    );
    expect(exitCode()).toBe(1);
  });

  it("prints nothing on a detached HEAD, which has no branch to judge", async () => {
    const session = await createCommand(onBranch(""));

    await session.run();

    expect(printed()).toBe("");
    expect(exitCode()).toBeUndefined();
  });

  it("prints nothing outside a git repository", async () => {
    const session = await createCommand(() => ({
      available: true,
      status: 128,
      stdout: "",
    }));

    await session.run();

    expect(printed()).toBe("");
    expect(exitCode()).toBeUndefined();
  });

  it("prints nothing when git cannot be started", async () => {
    const session = await createCommand(() => ({
      available: false,
      status: null,
      stdout: "",
    }));

    await session.run();

    expect(printed()).toBe("");
    expect(exitCode()).toBeUndefined();
  });

  it("throws, printing nothing, when the configuration has no pattern", async () => {
    writeFileSync(
      path.join(workspace, "validate-branch-name.config.cjs"),
      'module.exports = { errorMsg: "❌" };\n',
    );
    const session = await createCommand(onBranch("Bad_Name"));

    await expect(session.run()).rejects.toThrow(/pattern/u);
    expect(printed()).toBe("");
  });

  it("names every valid type and scope from the repository's own configuration", async () => {
    vi.mocked(process.cwd).mockReturnValue(REPOSITORY_ROOT);
    const session = await createCommand(onBranch("Bad_Name"));

    await session.run();

    expect(printed()).toMatch(/^❌ Invalid branch name\n/u);
    expect(printed()).toMatch(/\n🏷️ Valid types: feat, fix, docs, /u);
    expect(printed()).toMatch(/\n🔭 Valid scopes: .*\bvalidation\b/u);
    expect(printed().endsWith(`\n\n${RENAME_DIRECTIVE}`)).toBe(true);
    expect(exitCode()).toBe(1);
  });

  it("accepts the repository's main branch under its own configuration", async () => {
    vi.mocked(process.cwd).mockReturnValue(REPOSITORY_ROOT);
    const session = await createCommand(onBranch("main"));

    await session.run();

    expect(printed()).toBe("");
    expect(exitCode()).toBeUndefined();
  });
});

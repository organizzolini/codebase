import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { LoggerService } from "@codebase/observability";

import { SessionBranchNameGitService } from "./session-branch-name-git.service";
import { SessionBranchNameCommand } from "./session-branch-name.command";
import { SessionBranchNameService } from "./session-branch-name.service";

import type { GitResult } from "./session-branch-name.types";
import type { MockInstance } from "vitest";

/**
 * Fixtures live inside the workspace, in its gitignored `tmp`, never in the
 * operating system's temporary directory.
 */
const FIXTURE_PARENT = path.resolve(import.meta.dirname, "../../../tmp");

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

describe(SessionBranchNameCommand, () => {
  let command: SessionBranchNameCommand;
  let workspace: string;
  let stdout: MockInstance<typeof process.stdout.write>;
  let gitCalls: string[][];

  /** Everything the command wrote to standard output. */
  const printed = (): string =>
    stdout.mock.calls.map(([chunk]) => String(chunk)).join("");

  /** Builds the command over the real service and a fake `git`. */
  const createCommand = async (
    answer: (args: readonly string[]) => GitResult,
  ): Promise<SessionBranchNameCommand> => {
    const module = await Test.createTestingModule({
      providers: [
        SessionBranchNameCommand,
        SessionBranchNameService,
        {
          provide: SessionBranchNameGitService,
          useValue: createMock<SessionBranchNameGitService>({
            run: (args: readonly string[]): GitResult => {
              gitCalls.push([...args]);
              return answer(args);
            },
          }),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    return module.resolve(SessionBranchNameCommand);
  };

  /** A `git` whose current branch is this one. */
  const onBranch = (branch: string) => (): GitResult => ({
    available: true,
    status: 0,
    stdout: `${branch}\n`,
  });

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SessionBranchNameCommand,
        SessionBranchNameService,
        {
          provide: SessionBranchNameGitService,
          useValue: createMock<SessionBranchNameGitService>(),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    command = await module.resolve(SessionBranchNameCommand);
  });

  beforeEach(() => {
    mkdirSync(FIXTURE_PARENT, { recursive: true });
    workspace = mkdtempSync(path.join(FIXTURE_PARENT, "session-branch-name-"));
    writeFileSync(
      path.join(workspace, "validate-branch-name.config.cjs"),
      FIXTURE_CONFIGURATION,
    );
    gitCalls = [];
    process.exitCode = undefined;
    vi.spyOn(process, "cwd").mockReturnValue(workspace);
    stdout = vi.spyOn(process.stdout, "write").mockReturnValue(true);
  });

  afterEach(() => {
    rmSync(workspace, { force: true, recursive: true });
    process.exitCode = undefined;
    vi.restoreAllMocks();
  });

  it("is defined", () => {
    expect(command).toBeDefined();
  });

  it("sets logger context", async () => {
    const module = await Test.createTestingModule({
      providers: [
        SessionBranchNameCommand,
        SessionBranchNameService,
        {
          provide: SessionBranchNameGitService,
          useValue: createMock<SessionBranchNameGitService>(),
        },
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
      ],
    }).compile();

    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("SessionBranchNameCommand");
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
    expect(process.exitCode).toBeUndefined();
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
    expect(process.exitCode).toBe(1);
  });

  it("prints nothing on a detached HEAD, which has no branch to judge", async () => {
    const session = await createCommand(onBranch(""));

    await session.run();

    expect(printed()).toBe("");
    expect(process.exitCode).toBeUndefined();
  });

  it("prints nothing outside a git repository", async () => {
    const session = await createCommand(() => ({
      available: true,
      status: 128,
      stdout: "",
    }));

    await session.run();

    expect(printed()).toBe("");
    expect(process.exitCode).toBeUndefined();
  });

  it("prints nothing when git cannot be started", async () => {
    const session = await createCommand(() => ({
      available: false,
      status: null,
      stdout: "",
    }));

    await session.run();

    expect(printed()).toBe("");
    expect(process.exitCode).toBeUndefined();
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
    expect(process.exitCode).toBe(1);
  });

  it("accepts the repository's main branch under its own configuration", async () => {
    vi.mocked(process.cwd).mockReturnValue(REPOSITORY_ROOT);
    const session = await createCommand(onBranch("main"));

    await session.run();

    expect(printed()).toBe("");
    expect(process.exitCode).toBeUndefined();
  });
});

import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
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

import { SessionWorktreeNameGitService } from "./session-worktree-name-git.service";
import { SessionWorktreeNameCommand } from "./session-worktree-name.command";
import { SessionWorktreeNameService } from "./session-worktree-name.service";

import type { GitResult } from "./session-worktree-name.types";
import type { MockInstance } from "vitest";

/**
 * Fixtures live inside the workspace, in its gitignored `tmp`, never in the
 * operating system's temporary directory.
 */
const FIXTURE_PARENT = path.resolve(import.meta.dirname, "../../../tmp");

const WORKTREE_DIRECTIVE =
  "🚨 Invoke the using-git-worktrees skill to configure a compliant isolated workspace.";

/** How the fake `git` describes the checkout it is asked about. */
interface FakeCheckout {
  /** The `--git-dir` and `--git-common-dir` answers, or none outside a repository. */
  readonly gitDirectories?: { readonly common: string; readonly own: string };
  /** Whether `git check-ignore` reports the worktree as ignored. */
  readonly ignored?: boolean;
  /** Whether `git` cannot be started at all. */
  readonly missing?: boolean;
  /** The superproject a submodule reports, if this is one. */
  readonly superproject?: string;
}

describe(SessionWorktreeNameCommand, () => {
  let command: SessionWorktreeNameCommand;
  let fixture: string;
  let mainCheckout: string;
  let stdout: MockInstance<typeof process.stdout.write>;
  let gitCalls: string[][];

  /** Everything the command wrote to standard output. */
  const printed = (): string =>
    stdout.mock.calls.map(([chunk]) => String(chunk)).join("");

  /** Answers one `git` invocation as this checkout would. */
  const answerGit = (
    checkout: FakeCheckout,
    args: readonly string[],
  ): GitResult => {
    if (checkout.missing === true) {
      return { available: false, status: null, stdout: "" };
    }
    if (args.includes("check-ignore")) {
      return {
        available: true,
        status: checkout.ignored === true ? 0 : 1,
        stdout: "",
      };
    }
    if (args.includes("--show-superproject-working-tree")) {
      return {
        available: true,
        status: 0,
        stdout: checkout.superproject ?? "",
      };
    }
    if (checkout.gitDirectories === undefined) {
      return { available: true, status: 128, stdout: "" };
    }
    const answer = args.includes("--git-common-dir")
      ? checkout.gitDirectories.common
      : checkout.gitDirectories.own;
    return { available: true, status: 0, stdout: `${answer}\n` };
  };

  /** Builds the command over the real service and a fake `git`. */
  const createCommand = async (
    checkout: FakeCheckout,
  ): Promise<SessionWorktreeNameCommand> => {
    const module = await Test.createTestingModule({
      providers: [
        SessionWorktreeNameCommand,
        SessionWorktreeNameService,
        {
          provide: SessionWorktreeNameGitService,
          useValue: createMock<SessionWorktreeNameGitService>({
            run: (args: readonly string[]): GitResult => {
              gitCalls.push([...args]);
              return answerGit(checkout, args);
            },
          }),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    return module.resolve(SessionWorktreeNameCommand);
  };

  /** Puts a linked worktree with this directory name on disk and runs from it. */
  const enterWorktree = (parent: string, name: string): string => {
    const worktree = path.join(parent, name);
    mkdirSync(worktree, { recursive: true });
    vi.mocked(process.cwd).mockReturnValue(worktree);
    return worktree;
  };

  /** What `git` says inside a linked worktree of the fixture's main checkout. */
  const linkedWorktree = (): NonNullable<FakeCheckout["gitDirectories"]> => ({
    common: path.join(mainCheckout, ".git"),
    own: path.join(mainCheckout, ".git", "worktrees", "linked"),
  });

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SessionWorktreeNameCommand,
        SessionWorktreeNameService,
        {
          provide: SessionWorktreeNameGitService,
          useValue: createMock<SessionWorktreeNameGitService>(),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    command = await module.resolve(SessionWorktreeNameCommand);
  });

  beforeEach(() => {
    mkdirSync(FIXTURE_PARENT, { recursive: true });
    fixture = mkdtempSync(path.join(FIXTURE_PARENT, "session-worktree-name-"));
    mainCheckout = path.join(fixture, "main");
    mkdirSync(path.join(mainCheckout, ".git"), { recursive: true });
    gitCalls = [];
    process.exitCode = undefined;
    vi.spyOn(process, "cwd").mockReturnValue(mainCheckout);
    stdout = vi.spyOn(process.stdout, "write").mockReturnValue(true);
  });

  afterEach(() => {
    rmSync(fixture, { force: true, recursive: true });
    process.exitCode = undefined;
    vi.restoreAllMocks();
  });

  it("is defined", () => {
    expect(command).toBeDefined();
  });

  it("sets logger context", async () => {
    const module = await Test.createTestingModule({
      providers: [
        SessionWorktreeNameCommand,
        SessionWorktreeNameService,
        {
          provide: SessionWorktreeNameGitService,
          useValue: createMock<SessionWorktreeNameGitService>(),
        },
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
      ],
    }).compile();

    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith(
      "SessionWorktreeNameCommand",
    );
  });

  it("prints nothing in the main checkout, whose git directory is its common one", async () => {
    const session = await createCommand({
      gitDirectories: { common: ".git", own: ".git" },
    });

    await session.run();

    expect(printed()).toBe("");
    expect(process.exitCode).toBeUndefined();
  });

  it("prints nothing for a compliant, ignored worktree inside the main checkout", async () => {
    const worktree = enterWorktree(
      path.join(mainCheckout, ".claude", "worktrees"),
      "refactor-validation-session-checks",
    );
    const session = await createCommand({
      gitDirectories: linkedWorktree(),
      ignored: true,
    });

    await session.run();

    expect(printed()).toBe("");
    expect(process.exitCode).toBeUndefined();
    expect(gitCalls).toContainEqual([
      "-C",
      mainCheckout,
      "check-ignore",
      "-q",
      worktree,
    ]);
  });

  it("reports a worktree whose directory name is not lowercase kebab-case", async () => {
    enterWorktree(
      path.join(mainCheckout, ".claude", "worktrees"),
      "My_Worktree",
    );
    const session = await createCommand({
      gitDirectories: linkedWorktree(),
      ignored: true,
    });

    await session.run();

    expect(printed()).toBe(
      [
        '❌ Invalid worktree directory name: "My_Worktree"',
        "   Worktree directory names must be lowercase kebab-case (letters, numbers, hyphens). Avoid spaces, uppercase characters, and special symbols.",
        WORKTREE_DIRECTIVE,
      ].join("\n"),
    );
    expect(process.exitCode).toBe(1);
  });

  it("reports a worktree inside the main checkout that is not gitignored", async () => {
    const worktree = enterWorktree(
      path.join(mainCheckout, "worktrees"),
      "linked",
    );
    const session = await createCommand({ gitDirectories: linkedWorktree() });

    await session.run();

    expect(printed()).toBe(
      [
        `❌ Worktree directory is not gitignored: "${worktree}"`,
        "   Project-local worktrees inside the repository root must be ignored by .gitignore to prevent committing worktree contents.",
        WORKTREE_DIRECTIVE,
      ].join("\n"),
    );
    expect(process.exitCode).toBe(1);
  });

  it("reports both problems at once, the name first", async () => {
    enterWorktree(path.join(mainCheckout, "worktrees"), "Linked");
    const session = await createCommand({ gitDirectories: linkedWorktree() });

    await session.run();

    expect(printed()).toMatch(
      /^❌ Invalid worktree directory name: "Linked"\n.*\n\n❌ Worktree directory is not gitignored: /u,
    );
    expect(printed().endsWith(`contents.\n${WORKTREE_DIRECTIVE}`)).toBe(true);
    expect(process.exitCode).toBe(1);
  });

  it("never asks whether a worktree outside the main checkout is ignored", async () => {
    enterWorktree(path.join(fixture, "elsewhere"), "linked");
    const session = await createCommand({ gitDirectories: linkedWorktree() });

    await session.run();

    expect(printed()).toBe("");
    expect(gitCalls.some((args) => args.includes("check-ignore"))).toBe(false);
  });

  it("prints nothing inside a submodule", async () => {
    enterWorktree(mainCheckout, "Vendored_Module");
    const session = await createCommand({
      gitDirectories: linkedWorktree(),
      superproject: `${mainCheckout}\n`,
    });

    await session.run();

    expect(printed()).toBe("");
    expect(process.exitCode).toBeUndefined();
  });

  it("prints nothing outside a git repository", async () => {
    enterWorktree(fixture, "Not_A_Repository");
    const session = await createCommand({});

    await session.run();

    expect(printed()).toBe("");
    expect(process.exitCode).toBeUndefined();
  });

  it("prints nothing when git cannot be started", async () => {
    enterWorktree(fixture, "No_Git");
    const session = await createCommand({ missing: true });

    await session.run();

    expect(printed()).toBe("");
    expect(process.exitCode).toBeUndefined();
  });
});

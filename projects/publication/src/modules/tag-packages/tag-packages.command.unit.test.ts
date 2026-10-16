import fs from "node:fs";
import path from "node:path";

import { createMock } from "@golevelup/ts-vitest";
import { ConfigService } from "@nestjs/config";
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

import { LoggerService } from "@codebase/logging";

import {
  failed,
  FakeProcessRunner,
  succeeded,
  useTemporaryDirectories,
  writeFile,
} from "../../../testing/mocks";
import { MainTipService } from "../main-tip/main-tip.service";
import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReleaseGroupService } from "../release-group/release-group.service";

import { TagPackagesCommand } from "./tag-packages.command";
import { TagPackagesService } from "./tag-packages.service";

import type { ScriptedAnswer } from "../../../testing/mocks";
import type { CapturedProcess } from "../process-runner/process-runner.types";

/** A package in the temporary workspace: its project, version, and tags. */
interface Fixture {
  project: string;
  tags?: string[];
  version: string;
}

const SHOW_PREFIX = "pnpm exec nx show projects --projects";

const PUSH_LEFTOVERS = "env HUSKY=0 git push origin HEAD:refs/heads/main";

describe(TagPackagesCommand, () => {
  const originalExitCode = process.exitCode;
  let command: TagPackagesCommand;
  const makeDirectory = useTemporaryDirectories();
  let environmentFile: string;
  let reportLines: string[];
  let workspace: string;

  /** Writes the packages and answers every git and Nx call about them. */
  const workspaceOf = (
    fixtures: readonly Fixture[],
  ): Record<string, ScriptedAnswer<CapturedProcess>> => {
    const script: Record<string, ScriptedAnswer<CapturedProcess>> = {
      [`${SHOW_PREFIX} *`]: succeeded(
        JSON.stringify(fixtures.map(({ project }) => project)),
      ),
      "git diff --cached --quiet": succeeded(),
      "git fetch --quiet origin main": succeeded(),
      "git rev-parse --short base": succeeded("base\n"),
      "git rev-parse --short FETCH_HEAD": succeeded("newer\n"),
      "git rev-parse FETCH_HEAD": succeeded("base\n"),
      "git rev-parse HEAD": succeeded("base\n"),
      "pnpm exec nx graph *": succeeded(),
    };
    const nodes: Record<string, unknown> = {};

    for (const { project, tags = [], version } of fixtures) {
      const root = `projects/ic-suite/tool/${project}`;
      nodes[project] = { data: { root } };
      writeFile(
        workspace,
        `${root}/package.json`,
        JSON.stringify({ name: `@tool/${project}`, version }),
      );
      script[`git tag --list ${project}@*`] = succeeded(
        tags.map((tag) => `${tag}\n`).join(""),
      );
      script[`git rev-parse --quiet --verify refs/tags/${project}@${version}`] =
        tags.includes(`${project}@${version}`) ? succeeded("tag\n") : failed();
      script[`git log --diff-filter=A --format=%H -- ${root}/package.json`] =
        succeeded(`later-${project}\nadded-${project}\n`);
      script[`git rev-parse --verify --quiet added-${project}^`] = succeeded(
        `parent-${project}\n`,
      );
    }

    writeFile(workspace, "graph.json", JSON.stringify({ graph: { nodes } }));

    return script;
  };

  /** Runs the command over the real services and a scripted process runner. */
  const runCommand = async (runner: FakeProcessRunner): Promise<void> => {
    runner.effects["pnpm exec nx graph *"] = (args): void => {
      fs.copyFileSync(
        path.join(workspace, "graph.json"),
        String(args.at(-1)).replace("--file=", ""),
      );
    };
    const module = await Test.createTestingModule({
      providers: [
        MainTipService,
        ReleaseGroupService,
        TagPackagesCommand,
        TagPackagesService,
        { provide: ConfigService, useValue: new ConfigService() },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
        { provide: ProcessRunnerService, useValue: runner },
      ],
    }).compile();

    const subject = await module.resolve(TagPackagesCommand);

    await subject.run();
  };

  /** The streamed command lines, without the leftover-commit `git add`. */
  const streamedLines = (runner: FakeProcessRunner): string[] =>
    runner.streamed
      .map(({ args, executable }) => [executable, ...args].join(" "))
      .filter((line) => !line.startsWith("git add"));

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TagPackagesCommand,
        {
          provide: TagPackagesService,
          useValue: createMock<TagPackagesService>(),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    command = await module.resolve(TagPackagesCommand);
  });

  beforeEach(() => {
    process.exitCode = undefined;
    reportLines = [];
    workspace = makeDirectory();
    vi.spyOn(process, "cwd").mockReturnValue(workspace);
    writeFile(
      workspace,
      "nx.json",
      JSON.stringify({ release: { projects: ["projects/ic-suite/*/*"] } }),
    );
    writeFile(workspace, "pnpm-lock.yaml", "lockfileVersion: '9.0'\n");
    environmentFile = path.join(workspace, "github-env");
    fs.writeFileSync(environmentFile, "");
    vi.stubEnv("GITHUB_ENV", environmentFile);
    vi.stubEnv("PUSH_RETRY_DELAY", "0");
    vi.spyOn(console, "info").mockImplementation((line: unknown): void => {
      reportLines.push(String(line));
    });
    vi.spyOn(console, "error").mockImplementation((line: unknown): void => {
      reportLines.push(String(line));
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    process.exitCode = originalExitCode;
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(command).toBeDefined();
  });

  it("sets logger context", async () => {
    expect.hasAssertions();

    const module = await Test.createTestingModule({
      providers: [
        TagPackagesCommand,
        {
          provide: TagPackagesService,
          useValue: createMock<TagPackagesService>(),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();
    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("TagPackagesCommand");
  });

  it("tags new versions and baselines, skipping what is already tagged", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner(
      workspaceOf([
        { project: "bumped", tags: ["bumped@1.0.0"], version: "1.1.0" },
        { project: "fresh", version: "0.0.0" },
        { project: "tagged", tags: ["tagged@2.0.0"], version: "2.0.0" },
        { project: "untagged", tags: ["untagged@0.0.0"], version: "0.0.0" },
      ]),
    );
    await runCommand(runner);

    expect(streamedLines(runner)).toStrictEqual([
      "git tag --annotate fresh@0.0.0 parent-fresh --message fresh@0.0.0",
      "git tag --annotate bumped@1.1.0 --message bumped@1.1.0",
      "git push origin refs/tags/fresh@0.0.0 refs/tags/bumped@1.1.0",
    ]);
    expect(reportLines).toStrictEqual([
      "🏷️ Pushing 2 package tags, 6 at a time",
    ]);
    expect(process.exitCode).toBe(0);
  });

  it("adds only the versioned files that exist", async () => {
    expect.hasAssertions();

    writeFile(workspace, "projects/ic-suite/tool/bumped/CHANGELOG.md", "# 1\n");
    const runner = new FakeProcessRunner(
      workspaceOf([{ project: "bumped", version: "1.0.0" }]),
    );
    await runCommand(runner);

    expect(runner.streamed[0]).toStrictEqual({
      args: [
        "add",
        "--",
        "projects/ic-suite/tool/bumped/CHANGELOG.md",
        "projects/ic-suite/tool/bumped/package.json",
        "pnpm-lock.yaml",
      ],
      executable: "git",
    });
  });

  it("commits and pushes versions no codebase release carried", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner({
      ...workspaceOf([{ project: "bumped", version: "1.0.0" }]),
      "git diff --cached --quiet": failed(),
    });
    await runCommand(runner);

    expect(streamedLines(runner).slice(0, 2)).toStrictEqual([
      "env HUSKY=0 git commit --message chore(release): 🔖 tag packages",
      PUSH_LEFTOVERS,
    ]);
    expect(reportLines[0]).toBe(
      "🏷️ No codebase release committed the package versions; committing them",
    );
    expect(process.exitCode).toBe(0);
  });

  it("steps aside, tagging nothing, when main moved before the leftover push", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner(
      {
        ...workspaceOf([{ project: "bumped", version: "1.0.0" }]),
        "git diff --cached --quiet": failed(),
        "git rev-parse FETCH_HEAD": succeeded("newer\n"),
      },
      0,
      { [PUSH_LEFTOVERS]: 1 },
    );
    await runCommand(runner);

    expect(streamedLines(runner)).toHaveLength(2);
    expect(fs.readFileSync(environmentFile, "utf8")).toBe(
      "RELEASE_SUPERSEDED=true\n",
    );
    expect(process.exitCode).toBe(0);
  });

  it("fails when the leftover push is rejected and main has not moved", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner(
      {
        ...workspaceOf([{ project: "bumped", version: "1.0.0" }]),
        "git diff --cached --quiet": failed(),
      },
      0,
      { [PUSH_LEFTOVERS]: 1 },
    );
    await runCommand(runner);

    expect(reportLines.at(-1)).toBe(
      "❌ git push origin HEAD:refs/heads/main was rejected",
    );
    expect(process.exitCode).toBe(1);
  });

  it("fails when the leftover commit fails", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner(
      {
        ...workspaceOf([{ project: "bumped", version: "1.0.0" }]),
        "git diff --cached --quiet": failed(),
      },
      0,
      {
        "env HUSKY=0 git commit --message chore(release): 🔖 tag packages": 1,
      },
    );
    await runCommand(runner);

    expect(reportLines.at(-1)).toBe(
      "❌ env HUSKY=0 git commit --message chore(release): 🔖 tag packages exited 1",
    );
    expect(process.exitCode).toBe(1);
  });

  it("pushes six tags at a time, retrying a rejected batch", async () => {
    expect.hasAssertions();

    const fixtures = Array.from({ length: 7 }, (_, index) => ({
      project: `package-${String(index)}`,
      version: "1.0.0",
    }));
    const firstBatch = fixtures
      .slice(0, 6)
      .map(({ project }) => `refs/tags/${project}@1.0.0`)
      .join(" ");
    const runner = new FakeProcessRunner(workspaceOf(fixtures), 0, {
      [`git push origin ${firstBatch}`]: [1, 0],
    });
    await runCommand(runner);

    expect(
      streamedLines(runner).filter((line) => line.startsWith("git push")),
    ).toStrictEqual([
      `git push origin ${firstBatch}`,
      `git push origin ${firstBatch}`,
      "git push origin refs/tags/package-6@1.0.0",
    ]);
    expect(reportLines).toStrictEqual([
      "🏷️ Pushing 7 package tags, 6 at a time",
      "🔁 Push rejected; trying again in 0s",
    ]);
    expect(process.exitCode).toBe(0);
  });

  it("fails with git's code after the fourth rejected push", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner(
      workspaceOf([{ project: "bumped", version: "1.0.0" }]),
      0,
      { "git push origin refs/tags/bumped@1.0.0": 128 },
    );
    await runCommand(runner);

    expect(
      streamedLines(runner).filter((line) => line.startsWith("git push")),
    ).toHaveLength(4);
    expect(process.exitCode).toBe(128);
  });

  it("waits twenty seconds between attempts unless told otherwise", async () => {
    expect.hasAssertions();

    vi.stubEnv("PUSH_RETRY_DELAY", "");
    vi.useFakeTimers();
    const runner = new FakeProcessRunner(
      workspaceOf([{ project: "bumped", version: "1.0.0" }]),
      0,
      { "git push origin refs/tags/bumped@1.0.0": [1, 0] },
    );
    const running = runCommand(runner);
    await vi.advanceTimersByTimeAsync(20_000);
    await running;
    vi.useRealTimers();

    expect(reportLines).toContain("🔁 Push rejected; trying again in 20s");
    expect(process.exitCode).toBe(0);
  });

  it("fails, pushing nothing, when a tag cannot be made", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner(
      workspaceOf([{ project: "bumped", version: "1.0.0" }]),
      0,
      { "git tag --annotate bumped@1.0.0 --message bumped@1.0.0": 128 },
    );
    await runCommand(runner);

    expect(reportLines).toStrictEqual([
      "❌ git tag --annotate bumped@1.0.0 --message bumped@1.0.0 exited 128",
    ]);
    expect(runner.lines.some((line) => line.startsWith("git push"))).toBe(
      false,
    );
    expect(process.exitCode).toBe(1);
  });

  it("fails when a new package has no commit before its first", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner({
      ...workspaceOf([{ project: "fresh", version: "0.0.0" }]),
      "git rev-parse --verify --quiet added-fresh^": failed(),
    });
    await runCommand(runner);

    expect(reportLines).toStrictEqual([
      "❌ Cannot find the commit before fresh was added",
    ]);
    expect(process.exitCode).toBe(1);
  });

  it("fails when git has no record of a new package being added", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner({
      ...workspaceOf([{ project: "fresh", version: "0.0.0" }]),
      "git log --diff-filter=A --format=%H -- projects/ic-suite/tool/fresh/package.json":
        succeeded(""),
    });
    await runCommand(runner);

    expect(reportLines).toStrictEqual([
      "❌ Cannot find the commit before fresh was added",
    ]);
    expect(process.exitCode).toBe(1);
  });
});

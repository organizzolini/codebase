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

import { LoggerService } from "@codebase/observability";

import {
  createTaskDatabaseWorkspace,
  failed,
  FakeProcessRunner,
  readCachedHashes,
  succeeded,
  writeFile,
  writeTaskDatabase,
} from "../../../testing/mocks";
import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { TaskDatabaseService } from "../task-database/task-database.service";

import { ImportPrTaskCacheCommand } from "./import-pr-task-cache.command";
import { ImportPrTaskCacheService } from "./import-pr-task-cache.service";

import type { TaskDatabaseWorkspace } from "../../../testing/mocks";
import type { CapturedProcess } from "../process-runner/process-runner.types";

const REPOSITORY = "owner/codebase";
const MERGE_GROUP_REF =
  "refs/heads/gh-readonly-queue/main/pr-42-0123456789abcdef0123456789abcdef01234567";
const PULL_REQUEST = `gh api repos/${REPOSITORY}/pulls/42 *`;
const REPOSITORY_ID = `gh api repos/${REPOSITORY} --jq .id`;
const ARTIFACT_NAME = "nx-cache-lint-sha1";
const ARTIFACTS = `gh api repos/${REPOSITORY}/actions/artifacts?name=${ARTIFACT_NAME}&per_page=10 *`;
const DOWNLOAD = `gh api repos/${REPOSITORY}/actions/artifacts/77/zip`;
const UNZIP = "unzip *";

/** The answers of a pull request from this repository whose artifact exists. */
const sameRepository = (): Record<string, CapturedProcess> => ({
  [ARTIFACTS]: succeeded("77\n"),
  [DOWNLOAD]: succeeded(),
  [PULL_REQUEST]: succeeded(`sha1 ${REPOSITORY} ${REPOSITORY}\n`),
  [REPOSITORY_ID]: succeeded("1234\n"),
  [UNZIP]: succeeded(),
});

describe(ImportPrTaskCacheCommand, () => {
  let workspace: TaskDatabaseWorkspace;
  let command: ImportPrTaskCacheCommand;
  let printed: string[];
  let runnerTemporary: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ImportPrTaskCacheCommand,
        {
          provide: ImportPrTaskCacheService,
          useValue: createMock<ImportPrTaskCacheService>(),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    command = await module.resolve(ImportPrTaskCacheCommand);
  });

  /** Runs the command over the real services and a scripted `gh`. */
  const runCommand = async (runner: FakeProcessRunner): Promise<void> => {
    const module = await Test.createTestingModule({
      providers: [
        ImportPrTaskCacheCommand,
        ImportPrTaskCacheService,
        TaskDatabaseService,
        { provide: ConfigService, useValue: new ConfigService() },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
        { provide: ProcessRunnerService, useValue: runner },
      ],
    }).compile();

    const subject = await module.resolve(ImportPrTaskCacheCommand);

    await subject.run();
  };

  /** Makes the scripted `unzip` lay out the pull request's cache. */
  const unzipping = (runner: FakeProcessRunner, hashes: string[]): void => {
    runner.effects[UNZIP] = (args): void => {
      const destination = args.at(-1) ?? "";

      writeTaskDatabase(
        path.join(destination, "workspace-data", "theirs-v3.db"),
        hashes,
      );
      for (const hash of hashes) {
        writeFile(destination, `cache/${hash}`, `output of ${hash}`);
      }
    };
  };

  beforeEach(() => {
    workspace = createTaskDatabaseWorkspace();
    const root = path.dirname(workspace.directory);

    runnerTemporary = path.join(root, "runner-temporary");
    fs.mkdirSync(runnerTemporary);
    vi.stubEnv("NX_WORKSPACE_DATA_DIRECTORY", workspace.directory);
    vi.stubEnv("NX_CACHE_DIRECTORY", path.join(root, "cache"));
    vi.stubEnv("RUNNER_TEMP", runnerTemporary);
    vi.stubEnv("GITHUB_REF", MERGE_GROUP_REF);
    vi.stubEnv("GITHUB_REPOSITORY", REPOSITORY);
    vi.stubEnv("NX_CACHE_SCOPE", "lint");
    printed = [];
    vi.spyOn(console, "info").mockImplementation((line: string) => {
      printed.push(line);
    });
  });

  afterEach(() => {
    workspace.cleanup();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(command).toBeDefined();
  });

  it("sets logger context", async () => {
    expect.hasAssertions();

    const module = await Test.createTestingModule({
      providers: [
        ImportPrTaskCacheCommand,
        {
          provide: ImportPrTaskCacheService,
          useValue: createMock<ImportPrTaskCacheService>(),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();
    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("ImportPrTaskCacheCommand");
  });

  it("downloads the pull request's artifact and merges it into this cache", async () => {
    expect.hasAssertions();

    writeTaskDatabase(path.join(workspace.directory, "runner1-v3.db"), [
      "ours",
    ]);
    const runner = new FakeProcessRunner(sameRepository());

    unzipping(runner, ["theirs"]);

    await runCommand(runner);

    expect(
      readCachedHashes(path.join(workspace.directory, "runner1-v3.db")),
    ).toStrictEqual(["ours", "theirs"]);
    expect(printed).toStrictEqual([
      "📥 Importing nx-cache-lint-sha1 from pull request #42",
      "🧩 Merged 1 task results into the Nx cache (1 before)",
    ]);
  });

  it("asks only for an unexpired artifact of this repository's run of the head commit", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner(sameRepository());

    unzipping(runner, []);

    await runCommand(runner);

    expect(runner.captured.map((call) => call.args)).toContainEqual([
      "api",
      `repos/${REPOSITORY}/actions/artifacts?name=${ARTIFACT_NAME}&per_page=10`,
      "--jq",
      '[.artifacts[] | select(.expired == false and .workflow_run.head_sha == "sha1" and .workflow_run.head_repository_id == 1234)] | .[0].id // empty',
    ]);
  });

  it("works in a directory under RUNNER_TEMP and removes it afterwards", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner(sameRepository());

    unzipping(runner, []);

    await runCommand(runner);

    const unzip = runner.captured.find((call) => call.executable === "unzip");

    expect(unzip?.args.at(-1)?.startsWith(runnerTemporary)).toBe(true);
    expect(fs.readdirSync(runnerTemporary)).toStrictEqual([]);
  });

  it("says so and asks nothing outside a merge group", async () => {
    expect.hasAssertions();

    vi.stubEnv("GITHUB_REF", "refs/heads/main");
    const runner = new FakeProcessRunner({});

    await runCommand(runner);

    expect(runner.lines).toStrictEqual([]);
    expect(printed).toStrictEqual(["📥 Not a merge group; nothing to import"]);
  });

  it("does not import a fork's artifact", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner({
      ...sameRepository(),
      [PULL_REQUEST]: succeeded(`sha1 stranger/codebase ${REPOSITORY}\n`),
    });

    await runCommand(runner);

    expect(runner.lines).toHaveLength(1);
    expect(printed).toStrictEqual([
      `📥 Pull request #42 comes from stranger/codebase, not ${REPOSITORY}; not importing`,
    ]);
  });

  it("does not import when the head repository was deleted", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner({
      ...sameRepository(),
      [PULL_REQUEST]: succeeded(`sha1 none ${REPOSITORY}\n`),
    });

    await runCommand(runner);

    expect(printed).toStrictEqual([
      `📥 Pull request #42 comes from none, not ${REPOSITORY}; not importing`,
    ]);
  });

  it("runs cold when no artifact matches", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner({
      ...sameRepository(),
      [ARTIFACTS]: succeeded("\n"),
    });

    await runCommand(runner);

    expect(runner.lines.some((line) => line.endsWith("/zip"))).toBe(false);
    expect(printed).toStrictEqual([
      "📥 No nx-cache-lint-sha1 artifact from this repository; running cold",
    ]);
  });

  it.each([
    ["reading the pull request", PULL_REQUEST],
    ["reading the repository id", REPOSITORY_ID],
    ["listing the artifacts", ARTIFACTS],
    ["downloading the artifact", DOWNLOAD],
    ["unzipping the artifact", UNZIP],
  ])("warns and runs cold when %s fails", async (_step, line) => {
    expect.hasAssertions();

    writeTaskDatabase(path.join(workspace.directory, "runner1-v3.db"), [
      "ours",
    ]);
    const runner = new FakeProcessRunner({
      ...sameRepository(),
      [line]: failed("HTTP 500"),
    });

    await runCommand(runner);

    expect(
      readCachedHashes(path.join(workspace.directory, "runner1-v3.db")),
    ).toStrictEqual(["ours"]);
    expect(printed.at(-1)).toBe(
      "::warning::Could not import the pull request's Nx cache (HTTP 500); running cold",
    );
    expect(fs.readdirSync(runnerTemporary)).toStrictEqual([]);
  });

  it.each(["GITHUB_REPOSITORY", "NX_CACHE_SCOPE"])(
    "warns and runs cold when %s is unset",
    async (name) => {
      expect.hasAssertions();

      vi.stubEnv(name, "");
      const runner = new FakeProcessRunner(sameRepository());

      await runCommand(runner);

      expect(printed.at(-1)).toBe(
        `::warning::Could not import the pull request's Nx cache (${name} is unset); running cold`,
      );
    },
  );

  it("puts a multi-line reason on the warning's one line", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner({
      ...sameRepository(),
      [PULL_REQUEST]: failed("gh: Not Found\n  (HTTP 404)\n"),
    });

    await runCommand(runner);

    expect(printed).toStrictEqual([
      "::warning::Could not import the pull request's Nx cache (gh: Not Found (HTTP 404)); running cold",
    ]);
  });

  it("passes on the merge's own warning when the artifact holds no cache", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner(sameRepository());

    await runCommand(runner);

    expect(printed).toHaveLength(2);
    expect(printed[1]).toMatch(
      /^::warning::Not merging the Nx cache from .*: it has no cache directory$/v,
    );
  });
});

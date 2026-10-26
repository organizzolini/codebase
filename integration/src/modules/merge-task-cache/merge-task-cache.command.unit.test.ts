import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

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
  readCachedHashes,
  writeFile,
  writeTaskDatabase,
} from "../../../testing/mocks";
import { TaskDatabaseService } from "../task-database/task-database.service";

import { MergeTaskCacheCommand } from "./merge-task-cache.command";

import type { TaskDatabaseWorkspace } from "../../../testing/mocks";

describe(MergeTaskCacheCommand, () => {
  let workspace: TaskDatabaseWorkspace;
  let command: MergeTaskCacheCommand;
  let printed: string[];
  let cache: string;
  let source: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MergeTaskCacheCommand,
        {
          provide: TaskDatabaseService,
          useValue: createMock<TaskDatabaseService>(),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    command = await module.resolve(MergeTaskCacheCommand);
  });

  /** Runs the command over the real service and a real directory. */
  const runCommand = async (...parameters: string[]): Promise<void> => {
    const module = await Test.createTestingModule({
      providers: [
        MergeTaskCacheCommand,
        TaskDatabaseService,
        { provide: ConfigService, useValue: new ConfigService() },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    const subject = await module.resolve(MergeTaskCacheCommand);

    await subject.run(parameters);
  };

  /** The source's task database path, under its `workspace-data`. */
  const sourceDatabase = (name: string): string =>
    path.join(source, "workspace-data", name);

  /** Every file under the target cache, relative and sorted. */
  const cacheFiles = (): string[] =>
    fs
      .readdirSync(cache, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) =>
        path.relative(cache, path.join(entry.parentPath, entry.name)),
      )
      .toSorted();

  beforeEach(() => {
    workspace = createTaskDatabaseWorkspace();
    const root = path.dirname(workspace.directory);

    cache = path.join(root, "cache");
    source = path.join(root, "source");
    vi.stubEnv("NX_WORKSPACE_DATA_DIRECTORY", workspace.directory);
    vi.stubEnv("NX_CACHE_DIRECTORY", cache);
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
        MergeTaskCacheCommand,
        {
          provide: TaskDatabaseService,
          useValue: createMock<TaskDatabaseService>(),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();
    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("MergeTaskCacheCommand");
  });

  it("copies the outputs this cache lacks and inserts the rows it lacks, keeping its own", async () => {
    expect.hasAssertions();

    writeTaskDatabase(path.join(workspace.directory, "runner1-v3.db"), [
      "shared",
      "ours",
    ]);
    writeFile(cache, "shared", "our shared output");
    writeFile(cache, "terminalOutputs/shared", "our log");
    writeTaskDatabase(sourceDatabase("other-v3.db"), ["shared", "theirs"]);
    writeFile(source, "cache/shared", "their shared output");
    writeFile(source, "cache/theirs/out.txt", "their output");
    writeFile(source, "cache/terminalOutputs/theirs", "their log");

    await runCommand(source);

    expect(
      readCachedHashes(path.join(workspace.directory, "runner1-v3.db")),
    ).toStrictEqual(["ours", "shared", "theirs"]);
    expect(cacheFiles()).toStrictEqual([
      "shared",
      "terminalOutputs/shared",
      "terminalOutputs/theirs",
      "theirs/out.txt",
    ]);
    expect(fs.readFileSync(path.join(cache, "shared"), "utf8")).toBe(
      "our shared output",
    );
    expect(printed).toStrictEqual([
      "🧩 Merged 1 task results into the Nx cache (2 before)",
    ]);
  });

  it("keeps the outputs' modification times", async () => {
    expect.hasAssertions();

    writeTaskDatabase(path.join(workspace.directory, "runner1-v3.db"), []);
    writeTaskDatabase(sourceDatabase("other-v3.db"), ["theirs"]);
    writeFile(source, "cache/theirs", "their output");
    const when = new Date("2025-01-02T03:04:05Z");

    fs.utimesSync(path.join(source, "cache/theirs"), when, when);

    await runCommand(source);

    expect(fs.statSync(path.join(cache, "theirs")).mtime).toStrictEqual(when);
  });

  it("merges from the newest of several source databases", async () => {
    expect.hasAssertions();

    writeTaskDatabase(path.join(workspace.directory, "runner1-v3.db"), []);
    writeTaskDatabase(sourceDatabase("older-v3.db"), ["stale"]);
    writeTaskDatabase(sourceDatabase("newer-v3.db"), ["fresh"]);
    const past = new Date(Date.now() - 60_000);

    fs.utimesSync(sourceDatabase("older-v3.db"), past, past);
    fs.mkdirSync(path.join(source, "cache"));

    await runCommand(source);

    expect(
      readCachedHashes(path.join(workspace.directory, "runner1-v3.db")),
    ).toStrictEqual(["fresh"]);
  });

  it("merges into the newest database of this cache", async () => {
    expect.hasAssertions();

    writeTaskDatabase(path.join(workspace.directory, "older-v3.db"), []);
    writeTaskDatabase(path.join(workspace.directory, "newer-v3.db"), []);
    const past = new Date(Date.now() - 60_000);

    fs.utimesSync(path.join(workspace.directory, "older-v3.db"), past, past);
    writeTaskDatabase(sourceDatabase("other-v3.db"), ["theirs"]);
    fs.mkdirSync(path.join(source, "cache"));

    await runCommand(source);

    expect(
      readCachedHashes(path.join(workspace.directory, "newer-v3.db")),
    ).toStrictEqual(["theirs"]);
    expect(
      readCachedHashes(path.join(workspace.directory, "older-v3.db")),
    ).toStrictEqual([]);
  });

  it("adopts the source whole when this cache has no database", async () => {
    expect.hasAssertions();

    writeTaskDatabase(sourceDatabase("other-v3.db"), ["theirs"]);
    writeFile(source, "cache/theirs", "their output");

    await runCommand(source);

    expect(workspace.names()).toStrictEqual(["other-v3.db"]);
    expect(
      readCachedHashes(path.join(workspace.directory, "other-v3.db")),
    ).toStrictEqual(["theirs"]);
    expect(cacheFiles()).toStrictEqual(["theirs"]);
    expect(printed).toStrictEqual([
      `🧩 Adopted the Nx cache from ${source}: nothing to merge into`,
    ]);
  });

  it("merges twice without failing or duplicating anything", async () => {
    expect.hasAssertions();

    writeTaskDatabase(path.join(workspace.directory, "runner1-v3.db"), []);
    writeTaskDatabase(sourceDatabase("other-v3.db"), ["theirs"]);
    writeFile(source, "cache/theirs", "their output");

    await runCommand(source);
    await runCommand(source);

    expect(
      readCachedHashes(path.join(workspace.directory, "runner1-v3.db")),
    ).toStrictEqual(["theirs"]);
    expect(printed.at(-1)).toBe(
      "🧩 Merged 0 task results into the Nx cache (1 before)",
    );
  });

  it.each([
    [
      "it has no cache directory",
      (): void => {
        writeTaskDatabase(sourceDatabase("other-v3.db"), ["theirs"]);
      },
    ],
    [
      "it has no task database",
      (): void => {
        writeFile(source, "cache/theirs", "their output");
      },
    ],
    [
      "its task database is corrupt",
      (): void => {
        writeFile(source, "cache/theirs", "their output");
        writeFile(source, "workspace-data/other-v3.db", "not a database");
      },
    ],
    [
      "its task database has an unfamiliar schema",
      (): void => {
        writeFile(source, "cache/theirs", "their output");
        fs.mkdirSync(path.join(source, "workspace-data"), { recursive: true });
        const connection = new DatabaseSync(sourceDatabase("other-v3.db"));

        connection.exec("CREATE TABLE cache_outputs (hash TEXT)");
        connection.close();
      },
    ],
    [
      "its schema (4.db) differs from this cache's (3.db)",
      (): void => {
        writeFile(source, "cache/theirs", "their output");
        writeTaskDatabase(sourceDatabase("other-v4.db"), ["theirs"]);
      },
    ],
  ])("skips without changing anything when %s", async (reason, arrange) => {
    expect.hasAssertions();

    writeTaskDatabase(path.join(workspace.directory, "runner1-v3.db"), [
      "ours",
    ]);
    arrange();

    await runCommand(source);

    expect(
      readCachedHashes(path.join(workspace.directory, "runner1-v3.db")),
    ).toStrictEqual(["ours"]);
    expect(fs.existsSync(path.join(cache, "theirs"))).toBe(false);
    expect(printed).toStrictEqual([
      `::warning::Not merging the Nx cache from ${source}: ${reason}`,
    ]);
  });

  it("inserts no row when an output could not be copied, so no hit lacks its files", async () => {
    expect.hasAssertions();

    writeTaskDatabase(path.join(workspace.directory, "runner1-v3.db"), []);
    writeTaskDatabase(sourceDatabase("other-v3.db"), ["theirs"]);
    writeFile(source, "cache/theirs/out.txt", "their output");
    // A file where the output's directory belongs stops the copy.
    writeFile(cache, "theirs", "in the way");

    await runCommand(source);

    expect(
      readCachedHashes(path.join(workspace.directory, "runner1-v3.db")),
    ).toStrictEqual([]);
    expect(printed[0]).toMatch(
      /^::warning::Not merging the Nx cache from .*: /v,
    );
  });

  it("rolls the rows back when an insert fails part way through", async () => {
    expect.hasAssertions();

    const target = path.join(workspace.directory, "runner1-v3.db");

    writeTaskDatabase(target, ["ours"]);
    writeFile(source, "cache/theirs", "their output");
    fs.mkdirSync(path.join(source, "workspace-data"), { recursive: true });
    const connection = new DatabaseSync(sourceDatabase("other-v3.db"));

    // Familiar table names, but no `configuration` column for the insert.
    connection.exec(`
      CREATE TABLE task_details (hash TEXT, project TEXT, target TEXT);
      CREATE TABLE cache_outputs (hash TEXT, code INTEGER, size INTEGER, created_at TEXT, accessed_at TEXT);
      INSERT INTO cache_outputs VALUES ('theirs', 0, 1, NULL, NULL);
    `);
    connection.close();

    await runCommand(source);

    expect(readCachedHashes(target)).toStrictEqual(["ours"]);

    const check = new DatabaseSync(target);

    expect(
      check
        .prepare("SELECT hash FROM task_details ORDER BY hash")
        .all()
        .map((row) => row["hash"]),
    ).toStrictEqual(["ours"]);

    check.close();

    expect(printed[0]).toMatch(
      /^::warning::Not merging the Nx cache from .*: /v,
    );
  });

  it("warns rather than fails when the merge itself breaks", async () => {
    expect.hasAssertions();

    writeTaskDatabase(path.join(workspace.directory, "runner1-v3.db"), []);
    writeTaskDatabase(sourceDatabase("other-v3.db"), ["theirs"]);
    fs.mkdirSync(path.join(source, "cache"));
    // A directory where the target database should be read breaks the insert.
    fs.rmSync(path.join(workspace.directory, "runner1-v3.db"));
    fs.mkdirSync(path.join(workspace.directory, "runner1-v3.db"));

    await runCommand(source);

    expect(printed).toHaveLength(1);
    expect(printed[0]).toMatch(
      /^::warning::Not merging the Nx cache from .*: /v,
    );
  });

  it("warns when no source directory is given", async () => {
    expect.hasAssertions();

    await runCommand();

    expect(printed).toStrictEqual([
      "::warning::Not merging the Nx cache: no source directory was given",
    ]);
  });
});

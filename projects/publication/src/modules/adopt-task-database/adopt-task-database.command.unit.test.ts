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

import { createTaskDatabaseWorkspace } from "../../../testing/mocks";
import { TaskDatabaseService } from "../task-database/task-database.service";

import { AdoptTaskDatabaseCommand } from "./adopt-task-database.command";

import type { TaskDatabaseWorkspace } from "../../../testing/mocks";

describe(AdoptTaskDatabaseCommand, () => {
  let workspace: TaskDatabaseWorkspace;
  let command: AdoptTaskDatabaseCommand;
  let printed: string[];

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AdoptTaskDatabaseCommand,
        {
          provide: TaskDatabaseService,
          useValue: createMock<TaskDatabaseService>(),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    command = await module.resolve(AdoptTaskDatabaseCommand);
  });

  /** Runs the command over the real service and a real directory. */
  const runCommand = async (): Promise<void> => {
    const module = await Test.createTestingModule({
      providers: [
        AdoptTaskDatabaseCommand,
        TaskDatabaseService,
        { provide: ConfigService, useValue: new ConfigService() },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    const subject = await module.resolve(AdoptTaskDatabaseCommand);

    await subject.run();
  };

  beforeEach(() => {
    workspace = createTaskDatabaseWorkspace();
    vi.stubEnv("NX_WORKSPACE_DATA_DIRECTORY", workspace.directory);
    vi.stubEnv("MACHINE_ID_FILES", "");
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
        AdoptTaskDatabaseCommand,
        {
          provide: TaskDatabaseService,
          useValue: createMock<TaskDatabaseService>(),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();
    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("AdoptTaskDatabaseCommand");
  });

  it("renames the newest database and its companions to the machine id and drops the rest", async () => {
    expect.hasAssertions();

    // SQLite deletes a stale -wal and -shm once it opens the file to count its
    // rows, so the companions are seen as they move, not after.
    const renamed = vi.spyOn(fs, "renameSync");

    workspace.add("old-v15.db", 300, ["-wal"]);
    workspace.add("new-v15.db", 10, ["-wal", "-shm"]);
    vi.stubEnv(
      "MACHINE_ID_FILES",
      workspace.writeBeside("machine-id", "runner1\n"),
    );

    await runCommand();

    expect(
      renamed.mock.calls.map(([from, to]) => [
        path.basename(String(from)),
        path.basename(String(to)),
      ]),
    ).toStrictEqual([
      ["new-v15.db", "runner1-v15.db"],
      ["new-v15.db-wal", "runner1-v15.db-wal"],
      ["new-v15.db-shm", "runner1-v15.db-shm"],
    ]);
    expect(workspace.names()).toContain("runner1-v15.db");
    expect(workspace.names()).not.toContain("old-v15.db");
    expect(workspace.names()).not.toContain("old-v15.db-wal");
  });

  it("reports how many task results the adopted database holds", async () => {
    expect.hasAssertions();

    workspace.addDatabase("new-v15.db", 10, 42);
    vi.stubEnv(
      "MACHINE_ID_FILES",
      workspace.writeBeside("machine-id", "runner1\n"),
    );

    await runCommand();

    expect(printed).toStrictEqual([
      "🪪 Adopted new-v15.db as runner1-v15.db (42 cached results)",
    ]);
  });

  it("says the count is unknown when the database cannot be read", async () => {
    expect.hasAssertions();

    workspace.add("new-v15.db", 10);
    vi.stubEnv(
      "MACHINE_ID_FILES",
      workspace.writeBeside("machine-id", "runner1"),
    );

    await runCommand();

    expect(printed).toStrictEqual([
      "🪪 Adopted new-v15.db as runner1-v15.db (an unknown number of cached results)",
    ]);
  });

  it("reads the id from the first file that is readable and not empty", async () => {
    expect.hasAssertions();

    workspace.add("new-v15.db", 10);
    const empty = workspace.writeBeside("empty-id", " \n");
    const real = workspace.writeBeside("real-id", " box7 \n");

    vi.stubEnv(
      "MACHINE_ID_FILES",
      `${workspace.directory}/missing ${empty} ${real}`,
    );
    await runCommand();

    expect(workspace.names()).toStrictEqual(["box7-v15.db"]);
  });

  it("leaves a database already under the machine id where it is", async () => {
    expect.hasAssertions();

    workspace.add("runner1-v15.db", 10);
    vi.stubEnv(
      "MACHINE_ID_FILES",
      workspace.writeBeside("machine-id", "runner1"),
    );

    await runCommand();

    expect(workspace.names()).toStrictEqual(["runner1-v15.db"]);
    expect(printed[0]).toContain("Adopted runner1-v15.db as runner1-v15.db");
  });

  it("reports when no database was restored", async () => {
    expect.hasAssertions();

    await runCommand();

    expect(printed).toStrictEqual(["🪪 No Nx cache database was restored"]);
  });

  it("warns and changes nothing when no id file yields an id", async () => {
    expect.hasAssertions();

    workspace.add("new-v15.db", 10);
    vi.stubEnv("MACHINE_ID_FILES", `${workspace.directory}/missing`);

    await runCommand();

    expect(workspace.names()).toStrictEqual(["new-v15.db"]);
    expect(printed).toStrictEqual([
      "::warning::No machine id to adopt the Nx cache database under",
    ]);
  });

  it("warns and changes nothing when the newest name has no schema suffix", async () => {
    expect.hasAssertions();

    workspace.add("unversioned1.db", 10);
    vi.stubEnv(
      "MACHINE_ID_FILES",
      workspace.writeBeside("machine-id", "runner1"),
    );

    await runCommand();

    expect(workspace.names()).toStrictEqual(["unversioned1.db"]);
    expect(printed).toStrictEqual([
      "::warning::Not adopting unversioned1.db: no -v<schema> suffix to keep",
    ]);
  });
});

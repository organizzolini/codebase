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
  createTaskDatabaseWorkspace,
  FakeProcessRunner,
} from "../../../testing/mocks";
import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { TaskDatabaseService } from "../task-database/task-database.service";

import { KeepTaskDatabaseCommand } from "./keep-task-database.command";

import type { TaskDatabaseWorkspace } from "../../../testing/mocks";

describe(KeepTaskDatabaseCommand, () => {
  let workspace: TaskDatabaseWorkspace;
  let command: KeepTaskDatabaseCommand;
  let printed: string[];

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        KeepTaskDatabaseCommand,
        {
          provide: TaskDatabaseService,
          useValue: createMock<TaskDatabaseService>(),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    command = await module.resolve(KeepTaskDatabaseCommand);
  });

  /** Runs the command over the real service and a real directory. */
  const runCommand = async (): Promise<void> => {
    const module = await Test.createTestingModule({
      providers: [
        KeepTaskDatabaseCommand,
        TaskDatabaseService,
        { provide: ConfigService, useValue: new ConfigService() },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
        { provide: ProcessRunnerService, useValue: new FakeProcessRunner({}) },
      ],
    }).compile();

    const subject = await module.resolve(KeepTaskDatabaseCommand);

    await subject.run();
  };

  beforeEach(() => {
    workspace = createTaskDatabaseWorkspace();
    vi.stubEnv("NX_WORKSPACE_DATA_DIRECTORY", workspace.directory);
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
        KeepTaskDatabaseCommand,
        {
          provide: TaskDatabaseService,
          useValue: createMock<TaskDatabaseService>(),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();
    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("KeepTaskDatabaseCommand");
  });

  it("says nothing and keeps the only database", async () => {
    expect.hasAssertions();

    workspace.add("runner1-v15.db", 10, ["-wal"]);

    await runCommand();

    expect(workspace.names()).toStrictEqual([
      "runner1-v15.db",
      "runner1-v15.db-wal",
    ]);
    expect(printed).toStrictEqual([]);
  });

  it("says nothing when there is no database or no directory", async () => {
    expect.hasAssertions();

    await runCommand();
    workspace.cleanup();
    await runCommand();

    expect(printed).toStrictEqual([]);
  });

  it("keeps the newest of several, drops the rest with companions, and warns", async () => {
    expect.hasAssertions();

    workspace.add("a-v15.db", 500, ["-wal"]);
    workspace.add("b-v15.db", 10, ["-shm"]);
    workspace.add("c-v15.db", 200, ["-journal"]);

    await runCommand();

    expect(workspace.names()).toStrictEqual(["b-v15.db", "b-v15.db-shm"]);
    expect(printed).toStrictEqual([
      "::warning::Nx wrote a database beside the adopted one; keeping b-v15.db of: a-v15.db b-v15.db c-v15.db",
    ]);
  });
});

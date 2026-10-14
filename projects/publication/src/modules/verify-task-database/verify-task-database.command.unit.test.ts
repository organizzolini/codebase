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

import { VerifyTaskDatabaseCommand } from "./verify-task-database.command";

import type { TaskDatabaseWorkspace } from "../../../testing/mocks";
import type { CapturedProcess } from "../process-runner/process-runner.types";

const answered = (stdout: string, status = 0): CapturedProcess => ({
  status,
  stderr: "",
  stdout,
});

describe(VerifyTaskDatabaseCommand, () => {
  let workspace: TaskDatabaseWorkspace;
  let command: VerifyTaskDatabaseCommand;
  let printed: string[];

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        VerifyTaskDatabaseCommand,
        {
          provide: TaskDatabaseService,
          useValue: createMock<TaskDatabaseService>(),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    command = await module.resolve(VerifyTaskDatabaseCommand);
  });

  /** Runs the command over the real service, a real directory, and a fake sqlite3. */
  const runCommand = async (
    integrity: Record<string, CapturedProcess>,
  ): Promise<FakeProcessRunner> => {
    const script = Object.fromEntries(
      Object.entries(integrity).map(([name, answer]) => [
        `sqlite3 ${workspace.directory}/${name} PRAGMA integrity_check;`,
        answer,
      ]),
    );
    const runner = new FakeProcessRunner(script);
    const module = await Test.createTestingModule({
      providers: [
        VerifyTaskDatabaseCommand,
        TaskDatabaseService,
        { provide: ConfigService, useValue: new ConfigService() },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
        { provide: ProcessRunnerService, useValue: runner },
      ],
    }).compile();

    const subject = await module.resolve(VerifyTaskDatabaseCommand);

    await subject.run();

    return runner;
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
        VerifyTaskDatabaseCommand,
        {
          provide: TaskDatabaseService,
          useValue: createMock<TaskDatabaseService>(),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();
    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("VerifyTaskDatabaseCommand");
  });

  it("keeps a database that passes its integrity check", async () => {
    expect.hasAssertions();

    workspace.add("abc-v15.db", 10, ["-wal"]);

    await runCommand({ "abc-v15.db": answered("ok\n") });

    expect(workspace.names()).toStrictEqual(["abc-v15.db", "abc-v15.db-wal"]);
    expect(printed).toStrictEqual([]);
  });

  it("discards a corrupt database with its companion files and says why", async () => {
    expect.hasAssertions();

    workspace.add("bad-v15.db", 10, ["-wal", "-shm", "-journal"]);
    workspace.add("good-v15.db", 20);

    await runCommand({
      "bad-v15.db": answered("*** in database main ***\n", 0),
      "good-v15.db": answered("ok\n"),
    });

    expect(workspace.names()).toStrictEqual(["good-v15.db"]);
    expect(printed).toStrictEqual([
      `::warning::Discarding corrupt cache (${workspace.directory}/bad-v15.db): *** in database main ***`,
    ]);
  });

  it("discards a database sqlite3 could not open", async () => {
    expect.hasAssertions();

    workspace.add("broken-v15.db", 10);

    await runCommand({
      "broken-v15.db": {
        status: 1,
        stderr: "Error: file is not a database\n",
        stdout: "",
      },
    });

    expect(workspace.names()).toStrictEqual([]);
    expect(printed[0]).toContain("file is not a database");
  });

  it("does nothing when there is no database or no directory", async () => {
    expect.hasAssertions();

    const runner = await runCommand({});

    expect(runner.captured).toStrictEqual([]);

    workspace.cleanup();
    await runCommand({});

    expect(printed).toStrictEqual([]);
  });
});

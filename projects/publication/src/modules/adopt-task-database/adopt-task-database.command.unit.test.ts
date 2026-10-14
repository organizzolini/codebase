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

import { AdoptTaskDatabaseCommand } from "./adopt-task-database.command";

import type { TaskDatabaseWorkspace } from "../../../testing/mocks";
import type { CapturedProcess } from "../process-runner/process-runner.types";

const counted: CapturedProcess = { status: 0, stderr: "", stdout: "42\n" };

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

  /** Runs the command over the real service, with the id files and row count given. */
  const runCommand = async (
    machineIdFiles: string,
    adopted: string,
    count: CapturedProcess,
  ): Promise<void> => {
    vi.stubEnv("MACHINE_ID_FILES", machineIdFiles);
    const runner = new FakeProcessRunner({
      [`sqlite3 ${workspace.directory}/${adopted} SELECT count(*) FROM cache_outputs;`]:
        count,
    });
    const module = await Test.createTestingModule({
      providers: [
        AdoptTaskDatabaseCommand,
        TaskDatabaseService,
        { provide: ConfigService, useValue: new ConfigService() },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
        { provide: ProcessRunnerService, useValue: runner },
      ],
    }).compile();

    const subject = await module.resolve(AdoptTaskDatabaseCommand);

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

    workspace.add("old-v15.db", 300, ["-wal"]);
    workspace.add("new-v15.db", 10, ["-wal", "-shm", "-journal"]);
    const idFile = workspace.writeBeside("machine-id", "runner1\n");

    await runCommand(idFile, "runner1-v15.db", counted);

    expect(workspace.names()).toStrictEqual([
      "runner1-v15.db",
      "runner1-v15.db-journal",
      "runner1-v15.db-shm",
      "runner1-v15.db-wal",
    ]);
    expect(workspace.read("runner1-v15.db")).toBe("new-v15.db");
    expect(printed).toStrictEqual([
      "🪪 Adopted new-v15.db as runner1-v15.db (42 cached results)",
    ]);
  });

  it("reads the id from the first file that is readable and not empty", async () => {
    expect.hasAssertions();

    workspace.add("new-v15.db", 10);
    const empty = workspace.writeBeside("empty-id", " \n");
    const real = workspace.writeBeside("real-id", " box7 \n");

    await runCommand(
      `${workspace.directory}/missing ${empty} ${real}`,
      "box7-v15.db",
      counted,
    );

    expect(workspace.names()).toStrictEqual(["box7-v15.db"]);
  });

  it("leaves a database already under the machine id where it is", async () => {
    expect.hasAssertions();

    workspace.add("runner1-v15.db", 10);
    const idFile = workspace.writeBeside("machine-id", "runner1");

    await runCommand(idFile, "runner1-v15.db", counted);

    expect(workspace.names()).toStrictEqual(["runner1-v15.db"]);
    expect(printed[0]).toContain("Adopted runner1-v15.db as runner1-v15.db");
  });

  it("says the count is unknown when sqlite3 cannot read it", async () => {
    expect.hasAssertions();

    workspace.add("new-v15.db", 10);
    const idFile = workspace.writeBeside("machine-id", "runner1");

    await runCommand(idFile, "runner1-v15.db", {
      status: 1,
      stderr: "no such table",
      stdout: "",
    });

    expect(printed).toStrictEqual([
      "🪪 Adopted new-v15.db as runner1-v15.db (an unknown number of cached results)",
    ]);
  });

  it("reports when no database was restored", async () => {
    expect.hasAssertions();

    await runCommand("", "none", counted);

    expect(printed).toStrictEqual(["🪪 No Nx cache database was restored"]);
  });

  it("warns and changes nothing when no id file yields an id", async () => {
    expect.hasAssertions();

    workspace.add("new-v15.db", 10);

    await runCommand(`${workspace.directory}/missing`, "none", counted);

    expect(workspace.names()).toStrictEqual(["new-v15.db"]);
    expect(printed).toStrictEqual([
      "::warning::No machine id to adopt the Nx cache database under",
    ]);
  });

  it("warns and changes nothing when the newest name has no schema suffix", async () => {
    expect.hasAssertions();

    workspace.add("unversioned1.db", 10);
    const idFile = workspace.writeBeside("machine-id", "runner1");

    await runCommand(idFile, "none", counted);

    expect(workspace.names()).toStrictEqual(["unversioned1.db"]);
    expect(printed).toStrictEqual([
      "::warning::Not adopting unversioned1.db: no -v<schema> suffix to keep",
    ]);
  });
});

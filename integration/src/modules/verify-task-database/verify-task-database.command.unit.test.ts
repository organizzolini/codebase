import { ConfigService } from "@nestjs/config";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildTestingModule,
  expectLoggerContext,
} from "@codebase/testing/nestjs";

import { createTaskDatabaseWorkspace } from "../../../testing/mocks";
import { TaskDatabaseService } from "../task-database/task-database.service";

import { VerifyTaskDatabaseCommand } from "./verify-task-database.command";

import type { TaskDatabaseWorkspace } from "../../../testing/mocks";

describe(VerifyTaskDatabaseCommand, () => {
  const moduleOptions = { mocks: [TaskDatabaseService] };
  let workspace: TaskDatabaseWorkspace;
  let printed: string[];

  /** Runs the command over the real service and a real directory. */
  const runCommand = async (): Promise<void> => {
    const { module } = await buildTestingModule(VerifyTaskDatabaseCommand, {
      providers: [
        TaskDatabaseService,
        { provide: ConfigService, useValue: new ConfigService() },
      ],
    });

    const subject = await module.resolve(VerifyTaskDatabaseCommand);

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

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      VerifyTaskDatabaseCommand,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(VerifyTaskDatabaseCommand);
  });

  it("sets logger context", async () => {
    expect.hasAssertions();

    await expectLoggerContext(VerifyTaskDatabaseCommand, moduleOptions);
  });

  it("keeps a database that passes its integrity check", async () => {
    expect.hasAssertions();

    workspace.addDatabase("abc-v15.db", 10, 5);

    await runCommand();

    expect(workspace.names()).toStrictEqual(["abc-v15.db"]);
    expect(printed).toStrictEqual([]);
  });

  it("discards a file that is not a database, with its companions, and says why", async () => {
    expect.hasAssertions();

    workspace.add("bad-v15.db", 10, ["-wal", "-shm", "-journal"]);
    workspace.addDatabase("good-v15.db", 20, 3);

    await runCommand();

    expect(workspace.names()).toStrictEqual(["good-v15.db"]);
    expect(printed).toStrictEqual([
      `::warning::Discarding corrupt cache (${workspace.directory}/bad-v15.db): Error: file is not a database`,
    ]);
  });

  it("discards a database whose pages are damaged though its header reads fine", async () => {
    expect.hasAssertions();

    workspace.addDatabase("torn-v15.db", 10, 200);
    workspace.damage("torn-v15.db");

    await runCommand();

    expect(workspace.names()).toStrictEqual([]);
    expect(printed).toHaveLength(1);
    expect(printed[0]).toContain("::warning::Discarding corrupt cache");
  });

  it("does nothing when there is no database or no directory", async () => {
    expect.hasAssertions();

    await runCommand();
    workspace.cleanup();
    await runCommand();

    expect(printed).toStrictEqual([]);
  });
});

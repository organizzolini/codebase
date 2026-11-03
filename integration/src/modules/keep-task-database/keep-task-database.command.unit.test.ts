import fs from "node:fs";
import path from "node:path";

import { ConfigService } from "@nestjs/config";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildTestingModule,
  expectLoggerContext,
} from "@codebase/testing/nestjs";

import { createTaskDatabaseWorkspace } from "../../../testing/mocks";
import { TaskDatabaseService } from "../task-database/task-database.service";

import { KeepTaskDatabaseCommand } from "./keep-task-database.command";

import type { TaskDatabaseWorkspace } from "../../../testing/mocks";

describe(KeepTaskDatabaseCommand, () => {
  const moduleOptions = { mocks: [TaskDatabaseService] };
  let workspace: TaskDatabaseWorkspace;
  let printed: string[];

  /** Runs the command over the real service and a real directory. */
  const runCommand = async (): Promise<void> => {
    const { module } = await buildTestingModule(KeepTaskDatabaseCommand, {
      providers: [
        TaskDatabaseService,
        { provide: ConfigService, useValue: new ConfigService() },
      ],
    });

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

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      KeepTaskDatabaseCommand,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(KeepTaskDatabaseCommand);
  });

  it("sets logger context", async () => {
    expect.hasAssertions();

    await expectLoggerContext(KeepTaskDatabaseCommand, moduleOptions);
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

  it("keeps the earlier name when two databases are equally new", async () => {
    expect.hasAssertions();

    workspace.add("a-v15.db", 10);
    workspace.add("b-v15.db", 10);
    const when = new Date("2026-01-01T00:00:00Z");

    for (const name of ["a-v15.db", "b-v15.db"]) {
      fs.utimesSync(path.join(workspace.directory, name), when, when);
    }

    await runCommand();

    expect(workspace.names()).toStrictEqual(["a-v15.db"]);
  });
});

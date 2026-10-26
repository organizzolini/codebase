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

import { BoundBaseToPushService } from "../bound-base-to-push/bound-base-to-push.service";
import { ImportPrTaskCacheService } from "../import-pr-task-cache/import-pr-task-cache.service";
import { TaskDatabaseService } from "../task-database/task-database.service";

import { SetupCodebaseCommand } from "./setup-codebase.command";

describe(SetupCodebaseCommand, () => {
  const originalExitCode = process.exitCode;
  const bound = vi.fn<BoundBaseToPushService["bound"]>();
  const importCache = vi.fn<ImportPrTaskCacheService["import"]>();
  const verify = vi.fn<TaskDatabaseService["verify"]>();
  const adopt = vi.fn<TaskDatabaseService["adopt"]>();
  let command: SetupCodebaseCommand;
  let order: string[];
  let informed: string[];
  let errored: string[];

  /** Runs the command with exactly these variables set. */
  const run = async (environment: Record<string, string>): Promise<void> => {
    vi.unstubAllEnvs();
    for (const name of [
      "GITHUB_EVENT_NAME",
      "NX_BASE_SOURCE",
      "NX_CACHE",
      "NX_SHAS",
    ]) {
      vi.stubEnv(name, undefined);
    }
    for (const [name, value] of Object.entries(environment)) {
      vi.stubEnv(name, value);
    }

    await command.run();
  };

  const push = {
    GITHUB_EVENT_NAME: "push",
    NX_BASE_SOURCE: "push-before",
    NX_CACHE: "true",
    NX_SHAS: "true",
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SetupCodebaseCommand,
        { provide: ConfigService, useValue: new ConfigService() },
        { provide: BoundBaseToPushService, useValue: { bound } },
        {
          provide: ImportPrTaskCacheService,
          useValue: { import: importCache },
        },
        { provide: TaskDatabaseService, useValue: { adopt, verify } },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    command = await module.resolve(SetupCodebaseCommand);
  });

  beforeEach(() => {
    order = [];
    informed = [];
    errored = [];
    process.exitCode = undefined;
    vi.spyOn(console, "info").mockImplementation((line: string) => {
      informed.push(line);
    });
    vi.spyOn(console, "error").mockImplementation((line: string) => {
      errored.push(line);
    });
    bound.mockImplementation(() => {
      order.push("bound");

      return { exitCode: 0, lines: ["bounded"] };
    });
    importCache.mockImplementation(() => {
      order.push("import");

      return { lines: ["imported"] };
    });
    verify.mockImplementation(() => {
      order.push("verify");

      return { lines: ["verified"] };
    });
    adopt.mockImplementation(() => {
      order.push("adopt");

      return { lines: ["adopted"] };
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
        SetupCodebaseCommand,
        { provide: ConfigService, useValue: new ConfigService() },
        { provide: BoundBaseToPushService, useValue: { bound } },
        {
          provide: ImportPrTaskCacheService,
          useValue: { import: importCache },
        },
        { provide: TaskDatabaseService, useValue: { adopt, verify } },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();
    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("SetupCodebaseCommand");
  });

  it("does nothing for a job that asked for nothing", async () => {
    expect.hasAssertions();

    await run({});

    expect(order).toStrictEqual([]);
    expect(informed).toStrictEqual([]);
  });

  it("bounds a push's base, then verifies and adopts the database", async () => {
    expect.hasAssertions();

    await run(push);

    expect(order).toStrictEqual(["bound", "verify", "adopt"]);
    expect(informed).toStrictEqual(["bounded", "verified", "adopted"]);
    expect(process.exitCode).toBeUndefined();
  });

  it.each([
    [{ NX_SHAS: "false" }],
    [{ NX_BASE_SOURCE: "last-successful" }],
    [{ GITHUB_EVENT_NAME: "pull_request" }],
  ])("keeps the base when %j", async (change) => {
    expect.hasAssertions();

    await run({ ...push, ...change });

    expect(order).not.toContain("bound");
  });

  it("imports the pull request's cache first in a merge group", async () => {
    expect.hasAssertions();

    await run({ GITHUB_EVENT_NAME: "merge_group", NX_CACHE: "true" });

    expect(order).toStrictEqual(["import", "verify", "adopt"]);
  });

  it("leaves the task database alone without NX_CACHE", async () => {
    expect.hasAssertions();

    await run({ ...push, NX_CACHE: "false" });

    expect(order).toStrictEqual(["bound"]);
  });

  it("stops with the code of a base that cannot be bounded", async () => {
    expect.hasAssertions();

    bound.mockReturnValue({ exitCode: 1, lines: ["❌ NX_BASE is unset"] });

    await run(push);

    expect(errored).toStrictEqual(["❌ NX_BASE is unset"]);
    expect(order).toStrictEqual([]);
    expect(process.exitCode).toBe(1);
  });
});

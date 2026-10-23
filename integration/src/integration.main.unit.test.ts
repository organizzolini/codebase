import { createMock } from "@golevelup/ts-vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { RunAffectedModule } from "./modules/run-affected/run-affected.module";
import type { LoggerService } from "@codebase/observability";

type CommandFactoryRun = (
  module: unknown,
  options: {
    bufferLogs: boolean;
    logger: unknown;
    serviceErrorHandler?: (error: Error) => void;
  },
) => Promise<void>;

const run = vi.fn<CommandFactoryRun>().mockResolvedValue(undefined);
const loggerServiceMock = createMock<LoggerService>();
const runAffectedModuleMock = createMock<RunAffectedModule>();

vi.mock("nest-commander", () => ({
  CommandFactory: {
    run,
  },
  CommandRunner: class CommandRunner {
    public async run(): Promise<void> {
      await Promise.resolve();
    }
  },
}));

vi.mock("@codebase/observability", () => ({
  // `integration.module` imports `LoggerModule` from the same specifier, so the mock
  // has to stand in for the whole package, not just the service.
  LoggerModule: function LoggerModule() {},
  LoggerService: function LoggerService() {
    return loggerServiceMock;
  },
}));

// Mocked so that bootstrapping never reaches the real commands, which extend a
// `nest-commander` class this suite has replaced.
vi.mock("./modules/run-affected/run-affected.module", () => ({
  RunAffectedModule: function RunAffectedModule() {
    return runAffectedModuleMock;
  },
}));

vi.mock("./modules/verify-task-database/verify-task-database.module", () => ({
  VerifyTaskDatabaseModule: function VerifyTaskDatabaseModule() {},
}));

vi.mock("./modules/adopt-task-database/adopt-task-database.module", () => ({
  AdoptTaskDatabaseModule: function AdoptTaskDatabaseModule() {},
}));

vi.mock("./modules/keep-task-database/keep-task-database.module", () => ({
  KeepTaskDatabaseModule: function KeepTaskDatabaseModule() {},
}));

vi.mock("./modules/upgrade-dependencies/upgrade-dependencies.module", () => ({
  UpgradeDependenciesModule: function UpgradeDependenciesModule() {},
}));

describe("main bootstrap", () => {
  const originalExitCode = process.exitCode;

  beforeEach(() => {
    run.mockClear();
    loggerServiceMock.setContext.mockClear();
    loggerServiceMock.error.mockClear();
    process.exitCode = undefined;
    vi.resetModules();
  });

  afterEach(() => {
    process.exitCode = originalExitCode;
  });

  it("runs the command factory with a configured logger", async () => {
    expect.hasAssertions();

    await import("./integration.main");

    expect(loggerServiceMock.setContext).toHaveBeenCalledWith("CommandFactory");
    expect(run).toHaveBeenCalledTimes(1);

    const firstCall = run.mock.calls[0];

    expect(firstCall).toBeDefined();
    expect(firstCall?.[1]).toStrictEqual(
      expect.objectContaining({ bufferLogs: true }),
    );
  });

  it("exits non-zero and logs when a command throws", async () => {
    expect.hasAssertions();

    await import("./integration.main");

    const serviceErrorHandler = run.mock.calls[0]?.[1].serviceErrorHandler;

    if (serviceErrorHandler === undefined) {
      throw new Error("serviceErrorHandler is undefined");
    }

    const error = new Error("💥 command exploded");
    serviceErrorHandler(error);

    expect(process.exitCode).toBe(1);
    expect(loggerServiceMock.error).toHaveBeenCalledWith(
      error.message,
      error.stack,
    );
  });
});

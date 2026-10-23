import { createMock } from "@golevelup/ts-vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { MainModule } from "./documentation.module";
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
const mainModuleMock = createMock<MainModule>();

vi.mock("nest-commander", () => ({
  CommandFactory: {
    run,
  },
}));

vi.mock("@codebase/observability", () => ({
  LoggerModule: function LoggerModule() {},
  LoggerService: class MockLoggerService {
    error(message: string, stack?: string): void {
      loggerServiceMock.error(message, stack);
    }

    setContext(context: string): void {
      loggerServiceMock.setContext(context);
    }
  },
}));

vi.mock("./documentation.module", () => ({
  MainModule: function MainModule() {
    return mainModuleMock;
  },
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
    await import("./documentation.main");

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

    await import("./documentation.main");

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

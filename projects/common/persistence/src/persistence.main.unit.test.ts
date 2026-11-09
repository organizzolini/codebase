import { CommandFactory } from "nest-commander";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { captureExitCode } from "@codebase/testing";

const setContextMock = vi.fn<(context: string) => void>();
const loggerConstructorMock = vi.fn<() => void>();
const errorMock =
  vi.fn<
    (message: string, trace?: string, data?: Record<string, unknown>) => void
  >();

vi.mock("./persistence.module", () => ({
  MainModule: function MainModule() {
    return undefined;
  },
}));

vi.mock("@codebase/observability", () => ({
  LoggerService: class MockLoggerService {
    constructor() {
      loggerConstructorMock();
    }

    error = errorMock;

    setContext = setContextMock;
  },
}));

describe("main bootstrap", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("boots the command factory on MainModule with buffered logs", async () => {
    const runSpy = vi.spyOn(CommandFactory, "run").mockResolvedValue(undefined);

    await import("./persistence.main");

    await vi.waitFor(() => {
      expect(runSpy).toHaveBeenCalledTimes(1);
    });

    expect(loggerConstructorMock).toHaveBeenCalledTimes(1);
    expect(setContextMock).toHaveBeenCalledWith("CommandFactory");

    expect(runSpy).toHaveBeenCalledWith(
      expect.any(Function),
      expect.anything(),
    );
  }, 15_000);

  it("fails the process when a command throws", async () => {
    const runSpy = vi.spyOn(CommandFactory, "run").mockResolvedValue(undefined);
    const exitCode = captureExitCode();

    await import("./persistence.main");

    await vi.waitFor(() => {
      expect(runSpy).toHaveBeenCalledTimes(1);
    });

    const options = runSpy.mock.calls[0]?.[1];
    const serviceErrorHandler =
      typeof options === "object" && "serviceErrorHandler" in options
        ? options.serviceErrorHandler
        : undefined;
    const error = new Error("--file is required");

    await serviceErrorHandler?.(error);

    expect(serviceErrorHandler).toBeTypeOf("function");
    expect(exitCode()).toBe(1);
    expect(errorMock).toHaveBeenCalledWith(
      "💥 Failed running command",
      error.stack,
      {
        message: error.message,
      },
    );
  }, 15_000);
});

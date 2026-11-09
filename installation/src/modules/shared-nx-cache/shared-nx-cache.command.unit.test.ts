import { createMock } from "@golevelup/ts-vitest";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { expectLoggerContext } from "@codebase/observability/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { ReporterService } from "../reporter/reporter.service";

import { SharedNxCacheServerService } from "./shared-nx-cache-server.service";
import { SharedNxCacheCommand } from "./shared-nx-cache.command";
import { DEFAULT_DIRECTORY, DEFAULT_PORT } from "./shared-nx-cache.constants";

describe(SharedNxCacheCommand, () => {
  let command: SharedNxCacheCommand;
  let server: SharedNxCacheServerService;
  let reporter: ReporterService;
  let close: ReturnType<typeof vi.fn<() => Promise<void>>>;

  /** Runs the command and delivers `signal` once the server is up. */
  const runUntil = async (
    signal: "SIGINT" | "SIGTERM",
    options?: { directory?: string; port?: number },
  ): Promise<void> => {
    const handlers = new Map<string, () => void>();

    vi.spyOn(process, "once").mockImplementation(((
      event: string,
      handler: () => void,
    ) => {
      handlers.set(event, handler);

      return process;
    }) as typeof process.once);

    const running = command.run([], options);

    await vi.waitFor(() => {
      expect(handlers.has(signal)).toBe(true);
    });
    handlers.get(signal)?.();
    await running;
  };

  beforeAll(async () => {
    close = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    server = createMock<SharedNxCacheServerService>({
      start: vi
        .fn<SharedNxCacheServerService["start"]>()
        .mockResolvedValue({ close, port: 4321 }),
    });
    reporter = createMock<ReporterService>();

    const { module } = await buildTestingModule(SharedNxCacheCommand, {
      providers: [
        { provide: SharedNxCacheServerService, useValue: server },
        { provide: ReporterService, useValue: reporter },
      ],
    });

    command = await module.resolve(SharedNxCacheCommand);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    close.mockClear();
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(SharedNxCacheCommand, {
      mocks: [SharedNxCacheServerService, ReporterService],
    });

    expect(instance).toBeInstanceOf(SharedNxCacheCommand);
  });

  it("sets logger context", async () => {
    await expectLoggerContext(SharedNxCacheCommand, {
      mocks: [SharedNxCacheServerService, ReporterService],
    });
  });

  it("parses a port", () => {
    expect.hasAssertions();
    expect(command.parsePort("8080")).toBe(8080);
    expect(command.parsePort("0")).toBe(0);
  });

  it.each(["abc", "-1", "65536", "1.5", ""])("refuses the port %j", (value) => {
    expect.hasAssertions();
    expect(() => command.parsePort(value)).toThrow("--port must be an integer");
  });

  it("passes a directory through", () => {
    expect.hasAssertions();
    expect(command.parseDirectory("/somewhere")).toBe("/somewhere");
  });

  it("serves the defaults until SIGTERM, then closes the server", async () => {
    expect.hasAssertions();

    await runUntil("SIGTERM");

    expect(server.start).toHaveBeenLastCalledWith({
      directory: DEFAULT_DIRECTORY,
      port: DEFAULT_PORT,
    });
    expect(reporter.print).toHaveBeenCalledWith(
      "🗄️ Nx shared cache listening on http://127.0.0.1:4321",
    );
    expect(close).toHaveBeenCalledTimes(1);
  });

  it("serves the requested options until SIGINT", async () => {
    expect.hasAssertions();

    await runUntil("SIGINT", { directory: "/cache", port: 9 });

    expect(server.start).toHaveBeenLastCalledWith({
      directory: "/cache",
      port: 9,
    });
    expect(close).toHaveBeenCalledTimes(1);
  });
});

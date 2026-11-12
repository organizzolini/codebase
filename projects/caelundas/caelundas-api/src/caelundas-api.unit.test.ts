import { createMock } from "@golevelup/ts-vitest";
import { NestFactory } from "@nestjs/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { overrideEnvironment } from "@codebase/testing";

import type { INestApplication } from "@nestjs/common";

const setContextMock = vi.fn<(context: string) => void>();
const logMock = vi.fn<(message: string) => void>();
const loggerConstructorMock = vi.fn<() => void>();

const signalReadyMock = vi.fn<() => void>();
const registerShutdownHandlerMock =
  vi.fn<(handler: () => Promise<void>) => void>();
const createLightshipMock = vi
  .fn<
    (configuration?: { port: number }) => Promise<{
      registerShutdownHandler: typeof registerShutdownHandlerMock;
      signalReady: typeof signalReadyMock;
    }>
  >()
  .mockResolvedValue({
    registerShutdownHandler: registerShutdownHandlerMock,
    signalReady: signalReadyMock,
  });

vi.mock("lightship", () => ({
  createLightship: async (configuration?: { port: number }) =>
    createLightshipMock(configuration),
}));

vi.mock("./caelundas-api.module", () => ({
  CaelundasApiModule: function CaelundasApiModule() {
    return undefined;
  },
}));

vi.mock("@codebase/observability", () => ({
  LoggerService: class MockLoggerService {
    public constructor() {
      loggerConstructorMock();
    }

    public log = logMock;
    public setContext = setContextMock;
  },
}));

describe("caelundas api bootstrap suite", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("bootstraps nest application with default port and signals lightship ready", async () => {
    expect.hasAssertions();

    const closeMock = vi.fn<() => Promise<void>>().mockResolvedValue();
    const listenMock = vi
      .fn<() => Promise<INestApplication>>()
      .mockResolvedValue(undefined as unknown as INestApplication);
    const enableCorsMock = vi.fn<(options: unknown) => void>();
    const mockApp = createMock<INestApplication>({
      close: closeMock,
      enableCors: enableCorsMock,
      listen: listenMock,
    });
    const createSpy = vi
      .spyOn(NestFactory, "create")
      .mockResolvedValue(mockApp);

    await import("./caelundas-api");

    await vi.waitFor(() => {
      expect(createSpy).toHaveBeenCalledTimes(1);
    });

    expect(createSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ bufferLogs: true }),
    );
    expect(createLightshipMock).toHaveBeenCalledWith({ port: 9001 });
    expect(loggerConstructorMock).toHaveBeenCalledTimes(1);
    expect(setContextMock).toHaveBeenCalledWith("NestApplication");
    expect(enableCorsMock).toHaveBeenCalledWith({ origin: "*" });
    expect(listenMock).toHaveBeenCalledWith(6173);
    expect(signalReadyMock).toHaveBeenCalledTimes(1);
    expect(registerShutdownHandlerMock).toHaveBeenCalledTimes(1);

    const shutdownHandler = registerShutdownHandlerMock.mock.calls[0]?.[0];

    expect(shutdownHandler).toBeDefined();

    await shutdownHandler?.();

    expect(closeMock).toHaveBeenCalledTimes(1);
  });

  it("bootstraps nest application with custom CAELUNDAS_API_PORT and CAELUNDAS_API_LIGHTSHIP_PORT", async () => {
    expect.hasAssertions();

    overrideEnvironment({
      CAELUNDAS_API_CORS_ORIGINS:
        "http://localhost:8967, http://127.0.0.1:8967",
      CAELUNDAS_API_LIGHTSHIP_PORT: "9005",
      CAELUNDAS_API_PORT: "9999",
    });
    const enableCorsMock = vi.fn<(options: unknown) => void>();
    const listenMock = vi
      .fn<() => Promise<INestApplication>>()
      .mockResolvedValue(undefined as unknown as INestApplication);
    const mockApp = createMock<INestApplication>({
      enableCors: enableCorsMock,
      listen: listenMock,
    });
    const createSpy = vi
      .spyOn(NestFactory, "create")
      .mockResolvedValue(mockApp);

    await import("./caelundas-api");

    await vi.waitFor(() => {
      expect(createSpy).toHaveBeenCalledTimes(1);
    });

    expect(createLightshipMock).toHaveBeenCalledWith({ port: 9005 });
    expect(listenMock).toHaveBeenCalledWith(9999);
    expect(enableCorsMock).toHaveBeenCalledWith({
      origin: ["http://localhost:8967", "http://127.0.0.1:8967"],
    });
  });
});

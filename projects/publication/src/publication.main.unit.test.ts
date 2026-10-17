import { createMock } from "@golevelup/ts-vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { LinkPackagesModule } from "./modules/link-packages/link-packages.module";
import type { PublishPackagesModule } from "./modules/publish-packages/publish-packages.module";
import type { PublishablePackagesGateModule } from "./modules/publishable-packages-gate/publishable-packages-gate.module";
import type { TagCodebaseModule } from "./modules/tag-codebase/tag-codebase.module";
import type { TagPackagesModule } from "./modules/tag-packages/tag-packages.module";
import type { VersionPackagesModule } from "./modules/version-packages/version-packages.module";
import type { LoggerService } from "@codebase/logging";

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
const publishablePackagesGateModuleMock =
  createMock<PublishablePackagesGateModule>();
const tagCodebaseModuleMock = createMock<TagCodebaseModule>();
const versionPackagesModuleMock = createMock<VersionPackagesModule>();
const tagPackagesModuleMock = createMock<TagPackagesModule>();
const publishPackagesModuleMock = createMock<PublishPackagesModule>();
const linkPackagesModuleMock = createMock<LinkPackagesModule>();

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

vi.mock("@codebase/logging", () => ({
  // `publication.module` imports `LoggerModule` from the same specifier, so the mock
  // has to stand in for the whole package, not just the service.
  LoggerModule: function LoggerModule() {},
  LoggerService: function LoggerService() {
    return loggerServiceMock;
  },
}));

// Mocked so that bootstrapping never reaches the real commands, which extend a
// `nest-commander` class this suite has replaced.
vi.mock(
  "./modules/publishable-packages-gate/publishable-packages-gate.module",
  () => ({
    PublishablePackagesGateModule: function PublishablePackagesGateModule() {
      return publishablePackagesGateModuleMock;
    },
  }),
);

vi.mock("./modules/tag-codebase/tag-codebase.module", () => ({
  TagCodebaseModule: function TagCodebaseModule() {
    return tagCodebaseModuleMock;
  },
}));

vi.mock("./modules/link-packages/link-packages.module", () => ({
  LinkPackagesModule: function LinkPackagesModule() {
    return linkPackagesModuleMock;
  },
}));

vi.mock("./modules/publish-packages/publish-packages.module", () => ({
  PublishPackagesModule: function PublishPackagesModule() {
    return publishPackagesModuleMock;
  },
}));

vi.mock("./modules/tag-packages/tag-packages.module", () => ({
  TagPackagesModule: function TagPackagesModule() {
    return tagPackagesModuleMock;
  },
}));

vi.mock("./modules/version-packages/version-packages.module", () => ({
  VersionPackagesModule: function VersionPackagesModule() {
    return versionPackagesModuleMock;
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
    expect.hasAssertions();

    await import("./publication.main");

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

    await import("./publication.main");

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

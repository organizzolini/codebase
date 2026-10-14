import { createMock } from "@golevelup/ts-vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AuditGovernanceModule } from "./modules/audit-governance/audit-governance.module";
import type { CatalogManifestsModule } from "./modules/catalog-manifests/catalog-manifests.module";
import type { IssueMetadataModule } from "./modules/issue-metadata/issue-metadata.module";
import type { LockfileModule } from "./modules/lockfile/lockfile.module";
import type { PublishablePackagesModule } from "./modules/publishable-packages/publishable-packages.module";
import type { PullRequestBodyModule } from "./modules/pull-request-body/pull-request-body.module";
import type { PullRequestMetadataModule } from "./modules/pull-request-metadata/pull-request-metadata.module";
import type { PullRequestReleaseSignificanceModule } from "./modules/pull-request-release-significance/pull-request-release-significance.module";
import type { ReadmeProjectsModule } from "./modules/readme-projects/readme-projects.module";
import type { SessionBranchNameModule } from "./modules/session-branch-name/session-branch-name.module";
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
const logToStandardError = vi.fn<() => void>();
const auditGovernanceModuleMock = createMock<AuditGovernanceModule>();
const catalogManifestsModuleMock = createMock<CatalogManifestsModule>();
const issueMetadataModuleMock = createMock<IssueMetadataModule>();
const lockfileModuleMock = createMock<LockfileModule>();
const pullRequestBodyModuleMock = createMock<PullRequestBodyModule>();
const pullRequestMetadataModuleMock = createMock<PullRequestMetadataModule>();
const pullRequestReleaseSignificanceModuleMock =
  createMock<PullRequestReleaseSignificanceModule>();
const publishablePackagesModuleMock = createMock<PublishablePackagesModule>();
const readmeProjectsModuleMock = createMock<ReadmeProjectsModule>();
const sessionBranchNameModuleMock = createMock<SessionBranchNameModule>();

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
  // `validation.module` imports `LoggerModule` from the same specifier, so the mock
  // has to stand in for the whole package, not just the service.
  LoggerModule: function LoggerModule() {},
  // A class rather than a function returning the mock: `main` both
  // constructs it and calls its static `logToStandardError`.
  LoggerService: class MockLoggerService {
    static logToStandardError(): void {
      logToStandardError();
    }

    error(message: string, stack?: string): void {
      loggerServiceMock.error(message, stack);
    }

    setContext(context: string): void {
      loggerServiceMock.setContext(context);
    }
  },
}));

// Mocked so that bootstrapping never reaches the real commands, which extend a
// `nest-commander` class this suite has replaced.
vi.mock("./modules/audit-governance/audit-governance.module", () => ({
  AuditGovernanceModule: function AuditGovernanceModule() {
    return auditGovernanceModuleMock;
  },
}));

vi.mock("./modules/catalog-manifests/catalog-manifests.module", () => ({
  CatalogManifestsModule: function CatalogManifestsModule() {
    return catalogManifestsModuleMock;
  },
}));

vi.mock("./modules/issue-metadata/issue-metadata.module", () => ({
  IssueMetadataModule: function IssueMetadataModule() {
    return issueMetadataModuleMock;
  },
}));

vi.mock("./modules/lockfile/lockfile.module", () => ({
  LockfileModule: function LockfileModule() {
    return lockfileModuleMock;
  },
}));

vi.mock("./modules/pull-request-body/pull-request-body.module", () => ({
  PullRequestBodyModule: function PullRequestBodyModule() {
    return pullRequestBodyModuleMock;
  },
}));

vi.mock("./modules/pull-request-metadata/pull-request-metadata.module", () => ({
  PullRequestMetadataModule: function PullRequestMetadataModule() {
    return pullRequestMetadataModuleMock;
  },
}));

vi.mock(
  "./modules/pull-request-release-significance/pull-request-release-significance.module",
  () => ({
    PullRequestReleaseSignificanceModule:
      function PullRequestReleaseSignificanceModule() {
        return pullRequestReleaseSignificanceModuleMock;
      },
  }),
);

vi.mock("./modules/publishable-packages/publishable-packages.module", () => ({
  PublishablePackagesModule: function PublishablePackagesModule() {
    return publishablePackagesModuleMock;
  },
}));

vi.mock("./modules/readme-projects/readme-projects.module", () => ({
  ReadmeProjectsModule: function ReadmeProjectsModule() {
    return readmeProjectsModuleMock;
  },
}));

vi.mock("./modules/session-branch-name/session-branch-name.module", () => ({
  SessionBranchNameModule: function SessionBranchNameModule() {
    return sessionBranchNameModuleMock;
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

    await import("./validation.main");

    expect(loggerServiceMock.setContext).toHaveBeenCalledWith("CommandFactory");
    expect(run).toHaveBeenCalledTimes(1);

    const firstCall = run.mock.calls[0];

    expect(firstCall).toBeDefined();
    expect(firstCall?.[1]).toStrictEqual(
      expect.objectContaining({ bufferLogs: true }),
    );
  });

  // The session commands print their hooks' context, so a log line on
  // standard output would become part of what an agent reads.
  it("sends every log line to standard error before anything logs", async () => {
    logToStandardError.mockClear();

    await import("./validation.main");

    expect(logToStandardError).toHaveBeenCalledTimes(1);
    expect(logToStandardError.mock.invocationCallOrder[0]).toBeLessThan(
      run.mock.invocationCallOrder[0] ?? 0,
    );
  });

  it("exits non-zero and logs when a command throws", async () => {
    expect.hasAssertions();

    await import("./validation.main");

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

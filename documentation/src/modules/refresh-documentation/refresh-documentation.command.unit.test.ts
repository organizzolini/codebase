import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { LoggerService } from "@codebase/observability";
import { expectLoggerContext } from "@codebase/observability/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { RefreshDocumentationCommand } from "./refresh-documentation.command";
import { RefreshDocumentationService } from "./refresh-documentation.service";

describe(RefreshDocumentationCommand, () => {
  const refresh = vi.fn<() => Promise<boolean>>();
  let command: RefreshDocumentationCommand;
  let logger: LoggerService;

  beforeAll(async () => {
    const { module } = await buildTestingModule(RefreshDocumentationCommand, {
      providers: [
        { provide: RefreshDocumentationService, useValue: { refresh } },
      ],
    });

    command = await module.resolve(RefreshDocumentationCommand);
    logger = await module.resolve(LoggerService);
  });

  afterEach(() => {
    process.exitCode = undefined;
    vi.clearAllMocks();
  });

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(RefreshDocumentationCommand, {
      providers: [
        { provide: RefreshDocumentationService, useValue: { refresh } },
      ],
    });

    expect(instance).toBeInstanceOf(RefreshDocumentationCommand);
  });

  it("sets logger context", async () => {
    expect.hasAssertions();

    await expectLoggerContext(RefreshDocumentationCommand, {
      providers: [
        { provide: RefreshDocumentationService, useValue: { refresh } },
      ],
    });
  });

  it("leaves the exit code alone when the refresh succeeds", async () => {
    refresh.mockResolvedValue(true);

    await command.run();

    expect(process.exitCode).toBeUndefined();
    expect(logger.error).not.toHaveBeenCalled();
  });

  it("fails the process when the refresh fails", async () => {
    refresh.mockResolvedValue(false);

    await command.run();

    expect(process.exitCode).toBe(1);
    expect(logger.error).toHaveBeenCalledWith(
      "❌ Failed refreshing the documentation with OpenWiki",
    );
  });
});

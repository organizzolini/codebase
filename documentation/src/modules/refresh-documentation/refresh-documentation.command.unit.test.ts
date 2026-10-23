import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { LoggerService } from "@codebase/observability";

import { RefreshDocumentationCommand } from "./refresh-documentation.command";
import { RefreshDocumentationService } from "./refresh-documentation.service";

describe(RefreshDocumentationCommand, () => {
  const refresh = vi.fn<() => boolean>();
  let command: RefreshDocumentationCommand;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RefreshDocumentationCommand,
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
        { provide: RefreshDocumentationService, useValue: { refresh } },
      ],
    }).compile();

    command = await module.resolve(RefreshDocumentationCommand);
  });

  afterEach(() => {
    process.exitCode = undefined;
  });

  it("is defined", () => {
    expect(command).toBeDefined();
  });

  it("sets logger context", async () => {
    const module = await Test.createTestingModule({
      providers: [
        RefreshDocumentationCommand,
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
        { provide: RefreshDocumentationService, useValue: { refresh } },
      ],
    }).compile();

    const logger = await module.resolve(LoggerService);

    await module.resolve(RefreshDocumentationCommand);

    expect(logger.setContext).toHaveBeenCalledWith(
      "RefreshDocumentationCommand",
    );
  });

  it("leaves the exit code alone when the refresh succeeds", async () => {
    refresh.mockReturnValue(true);

    await command.run();

    expect(process.exitCode).toBeUndefined();
  });

  it("fails the process when the refresh fails", async () => {
    refresh.mockReturnValue(false);

    await command.run();

    expect(process.exitCode).toBe(1);
  });
});

import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { LoggerService } from "@codebase/observability";

import { RemoteCacheCommand } from "./remote-cache.command";
import { RemoteCacheService } from "./remote-cache.service";

describe(RemoteCacheCommand, () => {
  let command: RemoteCacheCommand;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RemoteCacheCommand,
        {
          provide: RemoteCacheService,
          useValue: createMock<RemoteCacheService>(),
        },
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
      ],
    }).compile();

    command = await module.resolve(RemoteCacheCommand);
  });

  it("is defined", () => {
    expect(command).toBeDefined();
  });

  it("sets logger context", async () => {
    const module = await Test.createTestingModule({
      providers: [
        RemoteCacheCommand,
        {
          provide: RemoteCacheService,
          useValue: createMock<RemoteCacheService>(),
        },
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
      ],
    }).compile();

    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("RemoteCacheCommand");
  });

  it("sets up the remote cache when it runs", async () => {
    const remoteCache = createMock<RemoteCacheService>();
    const module = await Test.createTestingModule({
      providers: [
        RemoteCacheCommand,
        { provide: RemoteCacheService, useValue: remoteCache },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    const subject = await module.resolve(RemoteCacheCommand);

    await subject.run();

    expect(remoteCache.setUpRemoteCache).toHaveBeenCalledWith();
  });
});

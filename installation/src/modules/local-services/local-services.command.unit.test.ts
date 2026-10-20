import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { LoggerService } from "@codebase/observability";

import { LocalServicesCommand } from "./local-services.command";
import { LocalServicesService } from "./local-services.service";

describe(LocalServicesCommand, () => {
  let command: LocalServicesCommand;
  let service: LocalServicesService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        LocalServicesCommand,
        {
          provide: LocalServicesService,
          useValue: createMock<LocalServicesService>(),
        },
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
      ],
    }).compile();

    command = await module.resolve(LocalServicesCommand);
    service = await module.resolve(LocalServicesService);
  });

  it("is defined", () => {
    expect(command).toBeDefined();
  });

  it("sets logger context", async () => {
    const module = await Test.createTestingModule({
      providers: [
        LocalServicesCommand,
        {
          provide: LocalServicesService,
          useValue: createMock<LocalServicesService>(),
        },
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
      ],
    }).compile();

    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("LocalServicesCommand");
  });

  it("starts the local services", async () => {
    expect.hasAssertions();

    await command.run();

    expect(service.startLocalServices).toHaveBeenCalledWith();
  });
});

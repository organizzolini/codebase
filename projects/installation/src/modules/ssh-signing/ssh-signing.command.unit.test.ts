import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { LoggerService } from "@codebase/logging";

import { SshSigningCommand } from "./ssh-signing.command";
import { SshSigningService } from "./ssh-signing.service";

describe(SshSigningCommand, () => {
  let command: SshSigningCommand;
  let service: SshSigningService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SshSigningCommand,
        {
          provide: SshSigningService,
          useValue: createMock<SshSigningService>(),
        },
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
      ],
    }).compile();

    command = await module.resolve(SshSigningCommand);
    service = await module.resolve(SshSigningService);
  });

  it("is defined", () => {
    expect(command).toBeDefined();
  });

  it("sets logger context", async () => {
    const module = await Test.createTestingModule({
      providers: [
        SshSigningCommand,
        {
          provide: SshSigningService,
          useValue: createMock<SshSigningService>(),
        },
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
      ],
    }).compile();

    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("SshSigningCommand");
  });

  it("makes SSH signatures verifiable", async () => {
    expect.hasAssertions();

    await command.run();

    expect(service.configureSshSigning).toHaveBeenCalledWith();
  });
});

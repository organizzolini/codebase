import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { LoggerService } from "@codebase/observability";

import { EphemerisDownloadCommand } from "./ephemeris-download.command";
import { EphemerisDownloadService } from "./ephemeris-download.service";

describe(EphemerisDownloadCommand, () => {
  let command: EphemerisDownloadCommand;
  let service: EphemerisDownloadService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EphemerisDownloadCommand,
        {
          provide: EphemerisDownloadService,
          useValue: createMock<EphemerisDownloadService>(),
        },
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
      ],
    }).compile();

    command = await module.resolve(EphemerisDownloadCommand);
    service = await module.resolve(EphemerisDownloadService);
  });

  it("is defined", () => {
    expect(command).toBeDefined();
  });

  it("sets logger context", async () => {
    const module = await Test.createTestingModule({
      providers: [
        EphemerisDownloadCommand,
        {
          provide: EphemerisDownloadService,
          useValue: createMock<EphemerisDownloadService>(),
        },
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
      ],
    }).compile();

    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("EphemerisDownloadCommand");
  });

  it("downloads the ephemeris files", async () => {
    await command.run();

    expect(service.download).toHaveBeenCalledWith();
  });
});

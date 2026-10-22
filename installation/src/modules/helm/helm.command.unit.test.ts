import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { LoggerService } from "@codebase/observability";

import { HelmCommand } from "./helm.command";
import { HelmService } from "./helm.service";

describe(HelmCommand, () => {
  let command: HelmCommand;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        HelmCommand,
        { provide: HelmService, useValue: createMock<HelmService>() },
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
      ],
    }).compile();

    command = await module.resolve(HelmCommand);
  });

  it("is defined", () => {
    expect(command).toBeDefined();
  });

  it("installs helm", async () => {
    const service = createMock<HelmService>();
    const module = await Test.createTestingModule({
      providers: [
        HelmCommand,
        { provide: HelmService, useValue: service },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    const installer = await module.resolve(HelmCommand);

    await installer.run();

    expect(service.installHelm).toHaveBeenCalledTimes(1);
  });

  it("sets logger context", async () => {
    const module = await Test.createTestingModule({
      providers: [
        HelmCommand,
        { provide: HelmService, useValue: createMock<HelmService>() },
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
      ],
    }).compile();

    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("HelmCommand");
  });
});

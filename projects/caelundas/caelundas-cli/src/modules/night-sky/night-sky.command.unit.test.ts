import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { LoggerService } from "@codebase/observability";

import { NightSkyCommand } from "./night-sky.command";
import { NightSkySourceError } from "./night-sky.constants";
import { NightSkyService } from "./night-sky.service";

describe(NightSkyCommand, () => {
  let command: NightSkyCommand;
  let nightSkyService: NightSkyService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        NightSkyCommand,
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
        {
          provide: NightSkyService,
          useValue: createMock<NightSkyService>(),
        },
      ],
    }).compile();

    command = await module.resolve(NightSkyCommand);
    nightSkyService = await module.resolve(NightSkyService);
  });

  it("is defined", () => {
    expect(command).toBeDefined();
  });

  it("sets logger context", async () => {
    const module = await Test.createTestingModule({
      providers: [
        NightSkyCommand,
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
        {
          provide: NightSkyService,
          useValue: createMock<NightSkyService>(),
        },
      ],
    }).compile();

    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("NightSkyCommand");
  });

  it("passes each option through as it was given", () => {
    expect(command.parseConstellations("c.json")).toBe("c.json");
    expect(command.parseLines("l.json")).toBe("l.json");
    expect(command.parseStars("hyg.csv")).toBe("hyg.csv");
  });

  it("ingests the three files", async () => {
    await command.run([], {
      constellations: "c.json",
      lines: "l.json",
      stars: "hyg.csv",
    });

    expect(nightSkyService.ingest).toHaveBeenCalledWith({
      constellations: "c.json",
      lines: "l.json",
      stars: "hyg.csv",
    });
  });

  it("refuses to run without a file", async () => {
    await expect(command.run([], { stars: "hyg.csv" })).rejects.toThrow(
      NightSkySourceError,
    );
  });
});

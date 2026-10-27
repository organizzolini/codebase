import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { LoggerService } from "@codebase/observability";

import { EventsDatabaseCommand } from "./events-database.command";
import { EventsDatabaseService } from "./events-database.service";

describe(EventsDatabaseCommand, () => {
  let command: EventsDatabaseCommand;
  const service = createMock<EventsDatabaseService>();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EventsDatabaseCommand,
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
        { provide: EventsDatabaseService, useValue: service },
      ],
    }).compile();

    command = await module.resolve(EventsDatabaseCommand);
  });

  it("is defined", () => {
    expect(command).toBeDefined();
  });

  it("sets logger context", async () => {
    const module = await Test.createTestingModule({
      providers: [
        EventsDatabaseCommand,
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
        { provide: EventsDatabaseService, useValue: service },
      ],
    }).compile();

    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("EventsDatabaseCommand");
  });

  it("builds with the options it was given", async () => {
    await command.run([], { output: "events.sqlite", seed: true });

    expect(service.build).toHaveBeenCalledWith({
      output: "events.sqlite",
      seed: true,
    });
  });

  it("builds with no options when none were given", async () => {
    await command.run([]);

    expect(service.build).toHaveBeenCalledWith({});
  });

  it("parses each flag to its value", () => {
    expect(command.parseOutput("a.sqlite")).toBe("a.sqlite");
    expect(command.parseSource("b.sqlite")).toBe("b.sqlite");
    expect(command.parseSeed()).toBe(true);
  });
});

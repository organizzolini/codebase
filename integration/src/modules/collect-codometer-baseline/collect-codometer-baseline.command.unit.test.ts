import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { LoggerService } from "@codebase/observability";

import { CollectCodometerBaselineCommand } from "./collect-codometer-baseline.command";
import { CollectCodometerBaselineService } from "./collect-codometer-baseline.service";

describe(CollectCodometerBaselineCommand, () => {
  const collect = vi.fn<CollectCodometerBaselineService["collect"]>();
  let command: CollectCodometerBaselineCommand;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CollectCodometerBaselineCommand,
        { provide: CollectCodometerBaselineService, useValue: { collect } },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    command = await module.resolve(CollectCodometerBaselineCommand);
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(command).toBeDefined();
  });

  it("sets logger context", async () => {
    expect.hasAssertions();

    const module = await Test.createTestingModule({
      providers: [
        CollectCodometerBaselineCommand,
        { provide: CollectCodometerBaselineService, useValue: { collect } },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();
    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith(
      "CollectCodometerBaselineCommand",
    );
  });

  it("prints what the service reports", async () => {
    expect.hasAssertions();

    const printed: string[] = [];

    vi.spyOn(console, "info").mockImplementation((line: string) => {
      printed.push(line);
    });
    collect.mockReturnValue({ lines: ["one", "two"] });

    await command.run();

    expect(printed).toStrictEqual(["one", "two"]);
  });
});

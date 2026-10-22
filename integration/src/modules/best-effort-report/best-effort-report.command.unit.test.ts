import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { LoggerService } from "@codebase/observability";

import { BestEffortReportCommand } from "./best-effort-report.command";
import { BestEffortReportService } from "./best-effort-report.service";

import type { BestEffortReport } from "./best-effort-report.types";

describe(BestEffortReportCommand, () => {
  let command: BestEffortReportCommand;
  let service: BestEffortReportService;
  let printed: string[];

  /** Has the service write up this report, then runs the command. */
  const runWith = async (report: BestEffortReport): Promise<void> => {
    vi.mocked(service.render).mockReturnValue(report);
    await command.run();
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        BestEffortReportCommand,
        {
          provide: BestEffortReportService,
          useValue: createMock<BestEffortReportService>(),
        },
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
      ],
    }).compile();

    command = await module.resolve(BestEffortReportCommand);
    service = await module.resolve(BestEffortReportService);
  });

  beforeEach(() => {
    printed = [];
    vi.spyOn(console, "info").mockImplementation((line: string) => {
      printed.push(line);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("is defined", () => {
    expect(command).toBeDefined();
  });

  it("sets logger context", async () => {
    const module = await Test.createTestingModule({
      providers: [
        BestEffortReportCommand,
        {
          provide: BestEffortReportService,
          useValue: createMock<BestEffortReportService>(),
        },
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
      ],
    }).compile();

    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("BestEffortReportCommand");
  });

  it("says so when no step was skipped", async () => {
    expect.hasAssertions();

    await runWith({ count: 0, details: "", section: "" });

    expect(printed).toStrictEqual(["No best-effort step was skipped."]);
  });

  it("publishes and prints the write-up when steps were skipped", async () => {
    expect.hasAssertions();

    const report = { count: 1, details: "- bullet", section: "## Section" };

    await runWith(report);

    expect(service.publish).toHaveBeenCalledWith(report);
    expect(printed[0]).toContain("1 best-effort step(s) skipped.");
    expect(printed[0]).toContain("## Section");
  });
});

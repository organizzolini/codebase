import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { LoggerService } from "@codebase/observability";

import { ReportCodometerChangesCommand } from "./report-codometer-changes.command";
import { ReportCodometerChangesService } from "./report-codometer-changes.service";

describe(ReportCodometerChangesCommand, () => {
  const originalExitCode = process.exitCode;
  const report = vi.fn<ReportCodometerChangesService["report"]>();
  let command: ReportCodometerChangesCommand;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ReportCodometerChangesCommand,
        { provide: ReportCodometerChangesService, useValue: { report } },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    command = await module.resolve(ReportCodometerChangesCommand);
  });

  afterEach(() => {
    process.exitCode = originalExitCode;
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(command).toBeDefined();
  });

  it("sets logger context", async () => {
    expect.hasAssertions();

    const module = await Test.createTestingModule({
      providers: [
        ReportCodometerChangesCommand,
        { provide: ReportCodometerChangesService, useValue: { report } },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();
    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith(
      "ReportCodometerChangesCommand",
    );
  });

  it("prints the lines and ends cleanly on success", async () => {
    expect.hasAssertions();

    const printed: string[] = [];

    vi.spyOn(console, "info").mockImplementation((line: string) => {
      printed.push(line);
    });
    report.mockReturnValue({ exitCode: 0, lines: ["one"] });

    await command.run();

    expect(printed).toStrictEqual(["one"]);
    expect(process.exitCode).toBe(0);
  });

  it("prints the lines as errors and takes the exit code on failure", async () => {
    expect.hasAssertions();

    const printed: string[] = [];

    vi.spyOn(console, "error").mockImplementation((line: string) => {
      printed.push(line);
    });
    report.mockReturnValue({ exitCode: 4, lines: ["bad"] });

    await command.run();

    expect(printed).toStrictEqual(["bad"]);
    expect(process.exitCode).toBe(4);
  });
});

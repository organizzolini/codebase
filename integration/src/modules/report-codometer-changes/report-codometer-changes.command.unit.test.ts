import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { expectLoggerContext } from "@codebase/observability/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { ReportCodometerChangesCommand } from "./report-codometer-changes.command";
import { ReportCodometerChangesService } from "./report-codometer-changes.service";

describe(ReportCodometerChangesCommand, () => {
  const originalExitCode = process.exitCode;
  const report = vi.fn<ReportCodometerChangesService["report"]>();
  let command: ReportCodometerChangesCommand;

  beforeAll(async () => {
    const { module } = await buildTestingModule(ReportCodometerChangesCommand, {
      providers: [
        { provide: ReportCodometerChangesService, useValue: { report } },
      ],
    });

    command = await module.resolve(ReportCodometerChangesCommand);
  });

  afterEach(() => {
    process.exitCode = originalExitCode;
  });

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      ReportCodometerChangesCommand,
      {
        providers: [
          { provide: ReportCodometerChangesService, useValue: { report } },
        ],
      },
    );

    expect(instance).toBeInstanceOf(ReportCodometerChangesCommand);
  });

  it("sets logger context", async () => {
    expect.hasAssertions();

    await expectLoggerContext(ReportCodometerChangesCommand, {
      providers: [
        { provide: ReportCodometerChangesService, useValue: { report } },
      ],
    });
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

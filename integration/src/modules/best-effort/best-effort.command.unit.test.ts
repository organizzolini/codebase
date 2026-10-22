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

import { BestEffortCommand } from "./best-effort.command";
import { BestEffortService } from "./best-effort.service";

import type { BestEffortOutcome } from "./best-effort.types";

describe(BestEffortCommand, () => {
  let command: BestEffortCommand;
  let service: BestEffortService;
  let printed: string[];
  let failed: string[];

  /** Has the service report this outcome, then runs the command. */
  const runWith = async (outcome: BestEffortOutcome): Promise<void> => {
    vi.mocked(service.attempt).mockReturnValue(outcome);
    await command.run();
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        BestEffortCommand,
        {
          provide: BestEffortService,
          useValue: createMock<BestEffortService>(),
        },
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
      ],
    }).compile();

    command = await module.resolve(BestEffortCommand);
    service = await module.resolve(BestEffortService);
  });

  beforeEach(() => {
    printed = [];
    failed = [];
    process.exitCode = undefined;
    vi.spyOn(console, "info").mockImplementation((line: string) => {
      printed.push(line);
    });
    vi.spyOn(console, "error").mockImplementation((line: string) => {
      failed.push(line);
    });
  });

  afterEach(() => {
    process.exitCode = undefined;
    vi.restoreAllMocks();
  });

  it("is defined", () => {
    expect(command).toBeDefined();
  });

  it("sets logger context", async () => {
    const module = await Test.createTestingModule({
      providers: [
        BestEffortCommand,
        {
          provide: BestEffortService,
          useValue: createMock<BestEffortService>(),
        },
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
      ],
    }).compile();

    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("BestEffortCommand");
  });

  it("prints what a successful step printed and exits 0", async () => {
    expect.hasAssertions();

    await runWith({ kind: "succeeded", output: "all good" });

    expect(printed).toStrictEqual(["all good"]);
    expect(process.exitCode).toBeUndefined();
  });

  it("annotates a skipped step and still exits 0", async () => {
    expect.hasAssertions();

    await runWith({
      failure: { exitCode: 2, label: "Upgrade Skills", tail: "boom" },
      kind: "skipped",
      output: "partial output",
    });

    expect(printed[1]).toContain("::warning title=Upgrade Skills skipped::");
    expect(process.exitCode).toBeUndefined();
  });

  it("fails the run when a step could not be restored", async () => {
    expect.hasAssertions();

    await runWith({ kind: "unrestored", message: "stuck", output: "" });

    expect(failed).toStrictEqual(["stuck"]);
    expect(process.exitCode).toBe(1);
  });

  it("fails the run when the step is not set up", async () => {
    expect.hasAssertions();

    await runWith({ kind: "misconfigured", message: "no label" });

    expect(failed).toStrictEqual(["no label"]);
    expect(process.exitCode).toBe(1);
  });
});

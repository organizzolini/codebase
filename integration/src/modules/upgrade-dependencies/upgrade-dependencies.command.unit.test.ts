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

import { UpgradeDependenciesCommand } from "./upgrade-dependencies.command";
import { UPGRADE_STEPS } from "./upgrade-dependencies.constants";
import { UpgradeDependenciesService } from "./upgrade-dependencies.service";

describe(UpgradeDependenciesCommand, () => {
  let command: UpgradeDependenciesCommand;
  let service: UpgradeDependenciesService;
  let printed: string[];
  let failed: string[];
  const done = { changes: "", label: "Step", warnings: [] };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UpgradeDependenciesCommand,
        {
          provide: UpgradeDependenciesService,
          useValue: createMock<UpgradeDependenciesService>(),
        },
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
      ],
    }).compile();

    command = await module.resolve(UpgradeDependenciesCommand);
    service = await module.resolve(UpgradeDependenciesService);
  });

  beforeEach(() => {
    printed = [];
    failed = [];
    process.exitCode = undefined;
    vi.mocked(service.attempt).mockReset();
    vi.mocked(service.finish).mockReset();
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
        UpgradeDependenciesCommand,
        {
          provide: UpgradeDependenciesService,
          useValue: createMock<UpgradeDependenciesService>(),
        },
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
      ],
    }).compile();

    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith(
      "UpgradeDependenciesCommand",
    );
  });

  it("runs every step, in a log group each, and exits 0 when all succeed", async () => {
    expect.hasAssertions();

    vi.mocked(service.attempt).mockResolvedValue({
      kind: "succeeded",
      output: "ok",
      report: done,
    });
    vi.mocked(service.finish).mockReturnValue(true);

    await command.run();

    expect(service.attempt).toHaveBeenCalledTimes(UPGRADE_STEPS.length);
    expect(printed.filter((line) => line.startsWith("::group::"))).toHaveLength(
      UPGRADE_STEPS.length,
    );
    expect(process.exitCode).toBeUndefined();
  });

  it("carries on past a skipped step, annotating it, and reports it", async () => {
    expect.hasAssertions();

    const report = {
      changes: "",
      label: "Upgrade pnpm",
      skipped: { exitCode: 2, tail: "boom" },
      warnings: [],
    };

    vi.mocked(service.attempt)
      .mockResolvedValueOnce({ kind: "skipped", output: "", report })
      .mockResolvedValue({ kind: "succeeded", output: "ok", report: done });
    vi.mocked(service.finish).mockReturnValue(true);

    await command.run();

    expect(service.attempt).toHaveBeenCalledTimes(UPGRADE_STEPS.length);
    expect(service.finish).toHaveBeenCalledWith([
      report,
      ...Array.from({ length: UPGRADE_STEPS.length - 1 }, () => done),
    ]);
    expect(
      printed.some((line) =>
        line.includes("::warning title=Upgrade pnpm skipped::"),
      ),
    ).toBe(true);
    expect(process.exitCode).toBeUndefined();
  });

  it("stops at a step that could not be undone", async () => {
    expect.hasAssertions();

    vi.mocked(service.attempt).mockResolvedValue({
      kind: "unrestored",
      message: "stuck",
      output: "",
    });

    await command.run();

    expect(service.attempt).toHaveBeenCalledTimes(1);
    expect(service.finish).not.toHaveBeenCalled();
    expect(failed).toStrictEqual(["stuck"]);
    expect(process.exitCode).toBe(1);
  });

  it("fails when skipped steps are all there is to report", async () => {
    expect.hasAssertions();

    vi.mocked(service.attempt).mockResolvedValue({
      kind: "skipped",
      output: "",
      report: { ...done, skipped: { exitCode: 1, tail: "x" } },
    });
    vi.mocked(service.finish).mockReturnValue(false);

    await command.run();

    expect(failed[0]).toContain("::error::");
    expect(process.exitCode).toBe(1);
  });

  it("exits 0 when nothing changed and nothing was skipped", async () => {
    expect.hasAssertions();

    vi.mocked(service.attempt).mockResolvedValue({
      kind: "succeeded",
      output: "",
      report: done,
    });
    vi.mocked(service.finish).mockReturnValue(false);

    await command.run();

    expect(process.exitCode).toBeUndefined();
  });
});

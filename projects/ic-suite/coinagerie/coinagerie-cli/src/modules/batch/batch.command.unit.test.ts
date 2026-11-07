import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { LoggerService } from "@codebase/observability";

import { CheckService } from "../check/check.service";

import { BatchCommand } from "./batch.command";

import type { CheckVerdict, RunCheckArguments } from "../check/check.types";
import type { MockInstance } from "vitest";

const run = vi.fn<(args: RunCheckArguments) => Promise<CheckVerdict>>();

describe(BatchCommand, () => {
  let command: BatchCommand;
  let write: MockInstance<typeof process.stdout.write>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        BatchCommand,
        { provide: CheckService, useValue: { run } },
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
      ],
    }).compile();

    command = await module.resolve(BatchCommand);
  });

  beforeEach(() => {
    run.mockReset();
    process.exitCode = 0;
    write = vi.spyOn(process.stdout, "write").mockReturnValue(true);
    write.mockClear();
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(command).toBeDefined();
  });

  it("sets logger context", async () => {
    const module = await Test.createTestingModule({
      providers: [
        BatchCommand,
        { provide: CheckService, useValue: { run } },
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
      ],
    }).compile();

    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("BatchCommand");
  });

  it("prints one verdict per directory, in the order given", async () => {
    expect.hasAssertions();

    run
      .mockResolvedValueOnce({ ok: true, report: "" })
      .mockResolvedValueOnce({ ok: false, report: "missing: argv" });

    await command.run(["packages/a", "packages/b"]);

    expect(run).toHaveBeenCalledTimes(2);
    expect(run.mock.calls.at(0)?.at(0)).toMatchObject({ mode: "check" });
    expect(JSON.parse(String(write.mock.calls.at(0)?.at(0)))).toStrictEqual([
      { directory: "packages/a", ok: true, report: "" },
      { directory: "packages/b", ok: false, report: "missing: argv" },
    ]);
  });

  it("fails the run when any project failed, and passes it otherwise", async () => {
    expect.hasAssertions();

    run.mockResolvedValue({ ok: false, report: "x" });
    await command.run(["packages/a"]);

    expect(process.exitCode).toBe(1);

    run.mockResolvedValue({ ok: true, report: "" });
    await command.run(["packages/a"]);

    expect(process.exitCode).toBe(0);
  });

  it("writes when told to", async () => {
    expect.hasAssertions();

    run.mockResolvedValue({ ok: true, report: "" });

    await command.run(["packages/a"], { write: command.parseWrite() });

    expect(run.mock.calls.at(0)?.at(0)).toMatchObject({ mode: "write" });
  });
});

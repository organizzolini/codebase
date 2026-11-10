import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { expectLoggerContext } from "@codebase/observability/testing";
import { captureExitCode, captureOutput } from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { CheckService } from "../check/check.service";

import { BatchCommand } from "./batch.command";

import type { CheckVerdict, RunCheckArguments } from "../check/check.types";
import type { CapturedOutput } from "@codebase/testing";
import type { TestingModuleOptions } from "@codebase/testing/nestjs";

const run = vi.fn<(args: RunCheckArguments) => Promise<CheckVerdict>>();

/** What the BatchCommand is built with. */
const DEPENDENCIES = {
  providers: [{ provide: CheckService, useValue: { run } }],
} satisfies TestingModuleOptions;

describe(BatchCommand, () => {
  let command: BatchCommand;
  let output: CapturedOutput;
  let readExitCode: () => typeof process.exitCode;

  beforeAll(async () => {
    ({ instance: command } = await buildTestingModule(
      BatchCommand,
      DEPENDENCIES,
    ));
  });

  beforeEach(() => {
    run.mockReset();
    readExitCode = captureExitCode();
    output = captureOutput();
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(BatchCommand, DEPENDENCIES);

    expect(instance).toBeInstanceOf(BatchCommand);
  });

  it("sets logger context", async () => {
    await expectLoggerContext(BatchCommand, DEPENDENCIES);
  });

  it("prints one verdict per directory, in the order given", async () => {
    expect.hasAssertions();

    run
      .mockResolvedValueOnce({ ok: true, report: "" })
      .mockResolvedValueOnce({ ok: false, report: "missing: argv" });

    await command.run(["packages/a", "packages/b"]);

    expect(run).toHaveBeenCalledTimes(2);
    expect(run.mock.calls.at(0)?.at(0)).toMatchObject({ mode: "check" });
    expect(JSON.parse(output.stdout())).toStrictEqual([
      { directory: "packages/a", ok: true, report: "" },
      { directory: "packages/b", ok: false, report: "missing: argv" },
    ]);
  });

  it("fails the run when any project failed, and passes it otherwise", async () => {
    expect.hasAssertions();

    run.mockResolvedValue({ ok: false, report: "x" });
    await command.run(["packages/a"]);

    expect(readExitCode()).toBe(1);

    run.mockResolvedValue({ ok: true, report: "" });
    await command.run(["packages/a"]);

    expect(readExitCode()).toBe(0);
  });

  it("writes when told to", async () => {
    expect.hasAssertions();

    run.mockResolvedValue({ ok: true, report: "" });

    await command.run(["packages/a"], { write: command.parseWrite() });

    expect(run.mock.calls.at(0)?.at(0)).toMatchObject({ mode: "write" });
  });
});

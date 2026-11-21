import path from "node:path";

import { createMock } from "@golevelup/ts-vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { expectLoggerContext } from "@codebase/observability/testing";
import { captureExitCode, captureOutput } from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { MeasureCommand } from "../measure/measure.command";

import { BatchCommand } from "./batch.command";

import type { MeasureOutcome } from "../measure/measure.types";
import type { LoggerService } from "@codebase/observability";
import type { CapturedOutput } from "@codebase/testing";
import type { TestingModuleOptions } from "@codebase/testing/nestjs";
import type { MeasureCommandOptions } from "@codometer/configuration";

/** What the BatchCommand is built with. */
const DEPENDENCIES = {
  providers: [
    { provide: MeasureCommand, useValue: createMock<MeasureCommand>() },
  ],
} satisfies TestingModuleOptions;

describe(BatchCommand, () => {
  let measureCommand: MeasureCommand;
  let output: CapturedOutput;
  let readExitCode: () => typeof process.exitCode;

  /** Builds a command over the mocked measurement. */
  function buildCommand(): BatchCommand {
    return new BatchCommand(measureCommand, createMock<LoggerService>());
  }

  /** The verdicts the command printed. */
  function printed(): unknown {
    return JSON.parse(output.stdout().trim());
  }

  beforeEach(() => {
    readExitCode = captureExitCode();
    process.exitCode = 0;
    output = captureOutput();
    measureCommand = createMock<MeasureCommand>();
    vi.mocked(measureCommand.measureDirectory).mockResolvedValue({
      failed: false,
      report: "",
    });
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(BatchCommand, DEPENDENCIES);

    expect(instance).toBeInstanceOf(BatchCommand);
  });

  it("sets logger context", async () => {
    await expectLoggerContext(BatchCommand, DEPENDENCIES);
  });

  it("measures each directory with the configuration read there, and prints a verdict for each", async () => {
    expect.hasAssertions();

    await buildCommand().run(["/a", "/b"], { config: "codometer.config.ts" });

    expect(measureCommand.measureDirectory).toHaveBeenNthCalledWith(
      1,
      { config: path.resolve("/a", "codometer.config.ts") },
      "/a",
    );
    expect(measureCommand.measureDirectory).toHaveBeenNthCalledWith(
      2,
      { config: path.resolve("/b", "codometer.config.ts") },
      "/b",
    );
    expect(printed()).toStrictEqual([
      { directory: "/a", ok: true, report: "" },
      { directory: "/b", ok: true, report: "" },
    ]);
    expect(readExitCode()).toBe(0);
  });

  it("passes the options along unchanged when no configuration is named", async () => {
    expect.hasAssertions();

    const options: MeasureCommandOptions = { check: "limits" };

    await buildCommand().run(["/a"], options);

    expect(measureCommand.measureDirectory).toHaveBeenCalledWith(options, "/a");
  });

  it("names what failed a directory, and fails the run, while measuring the rest", async () => {
    expect.hasAssertions();

    const failure: MeasureOutcome = {
      failed: true,
      report: "Breached custom.X: measured 3, limit 1",
    };

    vi.mocked(measureCommand.measureDirectory).mockResolvedValueOnce(failure);

    await buildCommand().run(["/a", "/b"], { config: "c.ts" });

    expect(printed()).toStrictEqual([
      { directory: "/a", ok: false, report: failure.report },
      { directory: "/b", ok: true, report: "" },
    ]);
    expect(readExitCode()).toBe(1);
  });

  it.each([
    ["an Error", new Error("it threw"), "it threw"],
    ["a plain value", "not an Error", "not an Error"],
  ])(
    "fails a directory whose measurement threw %s",
    async (_name, thrown, report) => {
      expect.hasAssertions();

      vi.mocked(measureCommand.measureDirectory).mockRejectedValueOnce(thrown);

      await buildCommand().run(["/a"], { config: "c.ts" });

      expect(printed()).toStrictEqual([{ directory: "/a", ok: false, report }]);
      expect(readExitCode()).toBe(1);
    },
  );

  it("reads each option it is given", () => {
    expect.hasAssertions();

    const command = buildCommand();

    expect(command.parseCheck("limits")).toBe("limits");
    expect(command.parseConfig("c.ts")).toBe("c.ts");
    expect(command.parseOnlyInputs("b", ["a"])).toStrictEqual(["a", "b"]);
    expect(command.parseOnlyInputs("a")).toStrictEqual(["a"]);
    expect(command.parseOutputJson("r.json")).toBe("r.json");
    expect(command.parseOutputMarkdown(true)).toBe(true);
  });
});

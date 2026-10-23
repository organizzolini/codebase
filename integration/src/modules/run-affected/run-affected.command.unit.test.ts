import { createMock } from "@golevelup/ts-vitest";
import { ConfigService } from "@nestjs/config";
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

import { failed, FakeProcessRunner, succeeded } from "../../../testing/mocks";
import { ProcessRunnerService } from "../process-runner/process-runner.service";

import { RunAffectedCommand } from "./run-affected.command";
import { RunAffectedService } from "./run-affected.service";

import type { CapturedProcess } from "../process-runner/process-runner.types";

/** The arguments of every streamed call, one line each. */
const streamedLines = (runner: FakeProcessRunner): string[] =>
  runner.streamed.map((call) => call.args.join(" "));

const MERGE_BASE = "git merge-base base head";
const DIFF = "git diff --name-only --no-renames --relative abc1234 head";
const AFFECTED = "exec nx affected --base=base --head=head --target=";
const TEMPLATE = "configuration/conformetry-templates/service/src/main.ts";

/** A script whose diff lists these files, one per line. */
const changing = (...files: string[]): Record<string, CapturedProcess> => ({
  [DIFF]: succeeded(files.map((file) => `${file}\n`).join("")),
  [MERGE_BASE]: succeeded("abc1234\n"),
});

describe(RunAffectedCommand, () => {
  const originalExitCode = process.exitCode;
  let command: RunAffectedCommand;
  let reportLines: string[];

  /** Runs the command over the real service and a scripted process runner. */
  const runCommand = async (
    runner: FakeProcessRunner,
    environment: Record<string, string>,
  ): Promise<void> => {
    vi.unstubAllEnvs();
    for (const name of [
      "ARGUMENTS",
      "INCLUDE_TEMPLATES",
      "NX_BASE",
      "NX_HEAD",
      "TARGET",
    ]) {
      vi.stubEnv(name, undefined);
    }
    for (const [name, value] of Object.entries(environment)) {
      vi.stubEnv(name, value);
    }

    const module = await Test.createTestingModule({
      providers: [
        RunAffectedCommand,
        RunAffectedService,
        { provide: ConfigService, useValue: new ConfigService() },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
        { provide: ProcessRunnerService, useValue: runner },
      ],
    }).compile();

    const subject = await module.resolve(RunAffectedCommand);

    await subject.run();
  };

  const base = { NX_BASE: "base", NX_HEAD: "head", TARGET: "test-code" };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RunAffectedCommand,
        {
          provide: RunAffectedService,
          useValue: createMock<RunAffectedService>(),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    command = await module.resolve(RunAffectedCommand);
  });

  beforeEach(() => {
    process.exitCode = undefined;
    reportLines = [];
    vi.spyOn(console, "info").mockImplementation((line: unknown): void => {
      reportLines.push(String(line));
    });
    vi.spyOn(console, "error").mockImplementation((line: unknown): void => {
      reportLines.push(String(line));
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
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
        RunAffectedCommand,
        {
          provide: RunAffectedService,
          useValue: createMock<RunAffectedService>(),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();
    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("RunAffectedCommand");
  });

  describe("missing inputs", () => {
    it.each([
      [{ NX_BASE: "base", NX_HEAD: "head" }, "TARGET is unset"],
      [{ ...base, TARGET: "" }, "TARGET is unset"],
      [{ ...base, NX_BASE: "" }, "NX_BASE and NX_HEAD are unset"],
      [{ TARGET: "test-code" }, "NX_BASE and NX_HEAD are unset"],
    ])("fails for %j", async (environment, message) => {
      expect.hasAssertions();

      const runner = new FakeProcessRunner({});

      await runCommand(runner, environment);

      expect(process.exitCode).toBe(1);
      expect(reportLines.join("\n")).toContain(message);
      expect(runner.streamed).toHaveLength(0);
    });
  });

  describe("without templates", () => {
    it("hands Nx the revisions and the extra flags, and lists no change set", async () => {
      expect.hasAssertions();

      const runner = new FakeProcessRunner({});

      await runCommand(runner, {
        ...base,
        ARGUMENTS: "--configuration=check  --parallel=4",
      });

      expect(streamedLines(runner)).toStrictEqual([
        `${AFFECTED}test-code --configuration=check --parallel=4`,
      ]);
      expect(process.exitCode).toBe(0);
    });

    it("leaves a changed template alone without INCLUDE_TEMPLATES", async () => {
      expect.hasAssertions();

      const runner = new FakeProcessRunner(changing(TEMPLATE));

      await runCommand(runner, base);

      expect(streamedLines(runner)).toStrictEqual([`${AFFECTED}test-code`]);
    });

    it("exits with the code Nx ends with", async () => {
      expect.hasAssertions();

      const runner = new FakeProcessRunner({}, 3);

      await runCommand(runner, base);

      expect(process.exitCode).toBe(3);
    });
  });

  describe("with INCLUDE_TEMPLATES", () => {
    const withTemplates = { ...base, INCLUDE_TEMPLATES: "true" };

    it("runs once more over the conformetry config when a template changed", async () => {
      expect.hasAssertions();

      const runner = new FakeProcessRunner(
        changing("projects/a/a.ts", TEMPLATE),
      );

      await runCommand(runner, withTemplates);

      expect(streamedLines(runner)).toStrictEqual([
        `${AFFECTED}test-code`,
        "exec nx affected --files=configuration/conformetry.config.ts --target=test-code",
      ]);
      expect(reportLines.join("\n")).toContain(TEMPLATE);
    });

    it("runs once when no template changed", async () => {
      expect.hasAssertions();

      const runner = new FakeProcessRunner(changing("projects/a/a.ts"));

      await runCommand(runner, withTemplates);

      expect(streamedLines(runner)).toStrictEqual([`${AFFECTED}test-code`]);
      expect(reportLines).toStrictEqual([]);
    });

    it("uses the base itself when there is no merge base", async () => {
      expect.hasAssertions();

      const runner = new FakeProcessRunner({
        "git diff --name-only --no-renames --relative base head":
          succeeded("projects/a/a.ts\n"),
        [MERGE_BASE]: failed("fatal: no merge base"),
      });

      await runCommand(runner, withTemplates);

      expect(streamedLines(runner)).toStrictEqual([`${AFFECTED}test-code`]);
    });

    it("skips the second run when the first fails", async () => {
      expect.hasAssertions();

      const runner = new FakeProcessRunner(changing(TEMPLATE), 2);

      await runCommand(runner, withTemplates);

      expect(streamedLines(runner)).toStrictEqual([`${AFFECTED}test-code`]);
      expect(process.exitCode).toBe(2);
    });

    it("fails with git's exit code when the diff cannot be listed", async () => {
      expect.hasAssertions();

      const runner = new FakeProcessRunner({
        [DIFF]: failed("fatal: bad revision", 128),
        [MERGE_BASE]: succeeded("abc1234\n"),
      });

      await runCommand(runner, withTemplates);

      expect(process.exitCode).toBe(128);
      expect(reportLines.join("\n")).toContain("fatal: bad revision");
      expect(runner.streamed).toHaveLength(0);
    });
  });
});

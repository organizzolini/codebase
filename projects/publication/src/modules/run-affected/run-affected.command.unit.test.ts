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

import { LoggerService } from "@codebase/logging";

import { FakeProcessRunner } from "../../../testing/mocks";
import { ProcessRunnerService } from "../process-runner/process-runner.service";

import { RunAffectedCommand } from "./run-affected.command";
import { RunAffectedService } from "./run-affected.service";

import type { CapturedProcess } from "../process-runner/process-runner.types";

const succeeded = (stdout: string): CapturedProcess => ({
  status: 0,
  stderr: "",
  stdout,
});

const MERGE_BASE = "git merge-base base head";
const DIFF = "git diff --name-only --no-renames --relative abc1234 head";

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
      "INCLUDE_SPELLING",
      "NX_BASE",
      "NX_HEAD",
    ]) {
      vi.stubEnv(name, undefined);
    }
    vi.stubEnv("SPELLING_PATHS", undefined);
    vi.stubEnv("TARGET", undefined);
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
    it("fails when TARGET is unset", async () => {
      expect.hasAssertions();

      const runner = new FakeProcessRunner({});
      await runCommand(runner, { NX_BASE: "base", NX_HEAD: "head" });

      expect(reportLines).toStrictEqual([
        "❌ TARGET is unset; name the Nx target to run",
      ]);
      expect(process.exitCode).toBe(1);
      expect(runner.streamed).toHaveLength(0);
    });

    it("treats an empty TARGET as unset", async () => {
      expect.hasAssertions();

      await runCommand(new FakeProcessRunner({}), { ...base, TARGET: "" });

      expect(process.exitCode).toBe(1);
    });

    it("treats empty revisions as unset", async () => {
      expect.hasAssertions();

      await runCommand(new FakeProcessRunner({}), {
        ...base,
        NX_BASE: "",
        NX_HEAD: "",
      });

      expect(process.exitCode).toBe(1);
    });

    it("fails when NX_BASE or NX_HEAD is unset", async () => {
      expect.hasAssertions();

      const runner = new FakeProcessRunner({});
      await runCommand(runner, { NX_HEAD: "head", TARGET: "test-code" });

      expect(reportLines).toStrictEqual([
        "❌ NX_BASE and NX_HEAD are unset; run setup-codebase first",
      ]);
      expect(process.exitCode).toBe(1);
      expect(runner.streamed).toHaveLength(0);
    });
  });

  describe("a change set with no spelling files", () => {
    it("hands Nx the revisions rather than the file list", async () => {
      expect.hasAssertions();

      const runner = new FakeProcessRunner(
        changing("projects/validation/src/main.ts"),
      );
      await runCommand(runner, {
        ...base,
        ARGUMENTS: "--configuration=check  --parallel=4",
      });

      expect(runner.streamed).toStrictEqual([
        {
          args: [
            "exec",
            "nx",
            "affected",
            "--base=base",
            "--head=head",
            "--target=test-code",
            "--configuration=check",
            "--parallel=4",
          ],
          executable: "pnpm",
        },
      ]);
      expect(reportLines).toStrictEqual([]);
      expect(process.exitCode ?? 0).toBe(0);
    });

    it("uses the base itself when there is no merge base", async () => {
      expect.hasAssertions();

      const runner = new FakeProcessRunner({
        "git diff --name-only --no-renames --relative base head":
          succeeded("README.md\n"),
        [MERGE_BASE]: { status: 1, stderr: "", stdout: "" },
      });
      await runCommand(runner, base);

      expect(runner.streamed).toHaveLength(1);
    });

    it("exits with the code Nx ends with", async () => {
      expect.hasAssertions();

      const runner = new FakeProcessRunner(changing("README.md"), 3);
      await runCommand(runner, base);

      expect(process.exitCode).toBe(3);
    });

    it("affects nothing, and cleanly, when nothing changed", async () => {
      expect.hasAssertions();

      const runner = new FakeProcessRunner(changing());
      await runCommand(runner, base);

      expect(runner.streamed[0]?.args).toContain("--base=base");
      expect(process.exitCode ?? 0).toBe(0);
    });
  });

  describe("a change set with spelling files", () => {
    it("drops them and pipes the rest to Nx", async () => {
      expect.hasAssertions();

      const runner = new FakeProcessRunner(
        changing(
          "configuration/.cspell/words.txt",
          "projects/validation/src/main.ts",
          "projects/lexico/lexico-web/cspell.config.yaml",
          "projects/validation/package.json",
        ),
      );
      await runCommand(runner, { ...base, ARGUMENTS: "--parallel=4" });

      expect(reportLines).toStrictEqual([
        "✂️ Not affecting test-code with spelling files:",
        "  configuration/.cspell/words.txt",
        "  projects/lexico/lexico-web/cspell.config.yaml",
      ]);
      expect(runner.streamed).toStrictEqual([
        {
          args: [
            "exec",
            "nx",
            "affected",
            "--stdin",
            "--target=test-code",
            "--parallel=4",
          ],
          executable: "pnpm",
          input:
            "projects/validation/src/main.ts\nprojects/validation/package.json\n",
        },
      ]);
    });

    it("pipes an empty list when only spelling files changed", async () => {
      expect.hasAssertions();

      const runner = new FakeProcessRunner(
        changing("configuration/.cspell/words.txt"),
      );
      await runCommand(runner, base);

      expect(runner.streamed[0]?.input).toBe("\n");
    });

    it("keeps them when INCLUDE_SPELLING is true", async () => {
      expect.hasAssertions();

      const runner = new FakeProcessRunner({});
      await runCommand(runner, { ...base, INCLUDE_SPELLING: "true" });

      expect(runner.captured).toHaveLength(0);
      expect(runner.streamed[0]?.args).toContain("--base=base");
    });

    it("falls back to the default paths when SPELLING_PATHS is empty", async () => {
      expect.hasAssertions();

      const runner = new FakeProcessRunner(
        changing("configuration/.cspell/words.txt", "main.ts"),
      );
      await runCommand(runner, { ...base, SPELLING_PATHS: "" });

      expect(runner.streamed[0]?.input).toBe("main.ts\n");
    });

    it("honours SPELLING_PATHS", async () => {
      expect.hasAssertions();

      const runner = new FakeProcessRunner(changing("words.txt", "main.ts"));
      await runCommand(runner, {
        ...base,
        SPELLING_PATHS: String.raw`^words\.txt$`,
      });

      expect(runner.streamed[0]?.input).toBe("main.ts\n");
    });
  });

  it("fails with git's exit code when the diff cannot be listed", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner({
      [DIFF]: { status: 128, stderr: "fatal: bad revision\n", stdout: "" },
      [MERGE_BASE]: succeeded("abc1234\n"),
    });
    await runCommand(runner, base);

    expect(reportLines).toStrictEqual(["fatal: bad revision"]);
    expect(process.exitCode).toBe(128);
    expect(runner.streamed).toHaveLength(0);
  });
});

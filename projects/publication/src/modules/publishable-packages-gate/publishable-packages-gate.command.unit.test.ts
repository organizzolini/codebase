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

import { PublishablePackagesGateCommand } from "./publishable-packages-gate.command";
import { PublishablePackagesGateService } from "./publishable-packages-gate.service";

import type { CapturedProcess } from "../process-runner/process-runner.types";

const SHOW_PROJECTS =
  "pnpm exec nx show projects --affected --json --base=base --head=head --projects=projects/ic-suite/**,validation";

const shown = (stdout: string): Record<string, CapturedProcess> => ({
  [SHOW_PROJECTS]: { status: 0, stderr: "", stdout },
});

describe(PublishablePackagesGateCommand, () => {
  const originalExitCode = process.exitCode;
  let command: PublishablePackagesGateCommand;
  let reportLines: string[];

  /** Runs the command over the real service and a scripted process runner. */
  const runCommand = async (
    runner: FakeProcessRunner,
    environment: Record<string, string>,
  ): Promise<void> => {
    vi.unstubAllEnvs();
    vi.stubEnv("NX_BASE", undefined);
    vi.stubEnv("NX_HEAD", undefined);
    for (const [name, value] of Object.entries(environment)) {
      vi.stubEnv(name, value);
    }

    const module = await Test.createTestingModule({
      providers: [
        PublishablePackagesGateCommand,
        PublishablePackagesGateService,
        { provide: ConfigService, useValue: new ConfigService() },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
        { provide: ProcessRunnerService, useValue: runner },
      ],
    }).compile();

    const subject = await module.resolve(PublishablePackagesGateCommand);

    await subject.run();
  };

  const revisions = { NX_BASE: "base", NX_HEAD: "head" };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PublishablePackagesGateCommand,
        {
          provide: PublishablePackagesGateService,
          useValue: createMock<PublishablePackagesGateService>(),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    command = await module.resolve(PublishablePackagesGateCommand);
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
        PublishablePackagesGateCommand,
        {
          provide: PublishablePackagesGateService,
          useValue: createMock<PublishablePackagesGateService>(),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();
    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith(
      "PublishablePackagesGateCommand",
    );
  });

  it("fails when a revision is unset", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner({});
    await runCommand(runner, { NX_BASE: "base" });

    expect(reportLines).toStrictEqual([
      "❌ NX_BASE and NX_HEAD are unset; run setup-codebase first",
    ]);
    expect(process.exitCode).toBe(1);
    expect(runner.captured).toHaveLength(0);
  });

  it("treats empty revisions as unset", async () => {
    expect.hasAssertions();

    await runCommand(new FakeProcessRunner({}), {
      NX_BASE: "",
      NX_HEAD: "",
    });

    expect(process.exitCode).toBe(1);
  });

  it("skips the check when nothing it covers is affected", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner(shown("[]\n"));
    await runCommand(runner, revisions);

    expect(reportLines).toStrictEqual([
      "⏭️ No ic-suite package or the check itself is affected.",
    ]);
    expect(runner.streamed).toHaveLength(0);
    expect(process.exitCode ?? 0).toBe(0);
  });

  it("runs the whole check when a covered project is affected", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner(shown('["codometer-cli"]\n'), 4);
    await runCommand(runner, revisions);

    expect(reportLines).toStrictEqual(['📦 Affected: ["codometer-cli"]']);
    expect(runner.streamed).toStrictEqual([
      {
        args: ["exec", "nx", "run", "validation:verify-publishable-packages"],
        executable: "pnpm",
      },
    ]);
    expect(process.exitCode).toBe(4);
  });

  it("fails with Nx's exit code when it cannot say what is affected", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner({
      [SHOW_PROJECTS]: { status: 2, stderr: "NX failed\n", stdout: "" },
    });
    await runCommand(runner, revisions);

    expect(reportLines).toStrictEqual(["NX failed"]);
    expect(process.exitCode).toBe(2);
    expect(runner.streamed).toHaveLength(0);
  });
});

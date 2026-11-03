import { ConfigService } from "@nestjs/config";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildTestingModule,
  expectLoggerContext,
} from "@codebase/testing/nestjs";

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
  const moduleOptions = { mocks: [PublishablePackagesGateService] };
  const originalExitCode = process.exitCode;
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

    const { module } = await buildTestingModule(
      PublishablePackagesGateCommand,
      {
        providers: [
          PublishablePackagesGateService,
          { provide: ConfigService, useValue: new ConfigService() },
          { provide: ProcessRunnerService, useValue: runner },
        ],
      },
    );

    const subject = await module.resolve(PublishablePackagesGateCommand);

    await subject.run();
  };

  const revisions = { NX_BASE: "base", NX_HEAD: "head" };

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

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      PublishablePackagesGateCommand,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(PublishablePackagesGateCommand);
  });

  it("sets logger context", async () => {
    expect.hasAssertions();

    await expectLoggerContext(PublishablePackagesGateCommand, moduleOptions);
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

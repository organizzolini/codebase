import fs from "node:fs";
import path from "node:path";

import { ConfigService } from "@nestjs/config";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { expectLoggerContext } from "@codebase/observability/testing";
import {
  createTemporaryDirectory,
  failed,
  FakeProcessRunner,
  succeeded,
} from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { TEMPORARY_ROOT } from "../../../testing/mocks";
import { MainTipService } from "../main-tip/main-tip.service";
import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { SemanticReleaseService } from "../semantic-release/semantic-release.service";

import { TagCodebaseCommand } from "./tag-codebase.command";
import { TagCodebaseService } from "./tag-codebase.service";

import type { CapturedProcess } from "../process-runner/process-runner.types";
import type { ScriptedAnswer } from "@codebase/testing";

/** Answers every git call a step-aside check and its report make. */
const gitScript = (
  tips: readonly string[],
): Record<string, ScriptedAnswer<CapturedProcess>> => ({
  "git fetch --quiet origin main": succeeded(),
  "git rev-parse --short base": succeeded("base\n"),
  "git rev-parse --short FETCH_HEAD": succeeded("newer\n"),
  "git rev-parse FETCH_HEAD": tips.map((tip) => succeeded(`${tip}\n`)),
  "git rev-parse HEAD": succeeded("base\n"),
});

describe(TagCodebaseCommand, () => {
  const moduleOptions = { mocks: [TagCodebaseService] };
  const originalExitCode = process.exitCode;
  let environmentFile: string;
  let reportLines: string[];

  const release = vi.fn<SemanticReleaseService["release"]>();

  /** Runs the command over a scripted runner and a fake release. */
  const runCommand = async (
    runner: FakeProcessRunner,
    options?: { dryRun?: boolean },
  ): Promise<void> => {
    const { module } = await buildTestingModule(TagCodebaseCommand, {
      providers: [
        MainTipService,
        TagCodebaseService,
        { provide: ConfigService, useValue: new ConfigService() },
        { provide: ProcessRunnerService, useValue: runner },
        { provide: SemanticReleaseService, useValue: { release } },
      ],
    });

    const subject = await module.resolve(TagCodebaseCommand);

    await subject.run([], options);
  };

  beforeEach(() => {
    process.exitCode = undefined;
    release.mockReset();
    release.mockResolvedValue(true);
    reportLines = [];
    environmentFile = path.join(
      createTemporaryDirectory("workspace", TEMPORARY_ROOT),
      "github-env",
    );
    fs.writeFileSync(environmentFile, "");
    vi.stubEnv("GITHUB_ENV", environmentFile);
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
      TagCodebaseCommand,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(TagCodebaseCommand);
  });

  it("sets logger context", async () => {
    expect.hasAssertions();

    await expectLoggerContext(TagCodebaseCommand, moduleOptions);
  });

  it("runs semantic-release while main has not moved", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner(gitScript(["base"]));
    await runCommand(runner);

    expect(release).toHaveBeenCalledExactlyOnceWith();
    expect(fs.readFileSync(environmentFile, "utf8")).toBe("");
    expect(process.exitCode).toBe(0);
  });

  it("steps aside before semantic-release when main has moved", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner(gitScript(["newer"]));
    await runCommand(runner);

    expect(release).not.toHaveBeenCalled();
    expect(fs.readFileSync(environmentFile, "utf8")).toBe(
      "RELEASE_SUPERSEDED=true\n",
    );
    expect(reportLines).toStrictEqual([
      "⏭️ main moved from base to newer during this run, whose release the newer run makes instead",
    ]);
    expect(process.exitCode).toBe(0);
  });

  it("steps aside after a failed release when main moved meanwhile", async () => {
    expect.hasAssertions();

    release.mockResolvedValue(false);

    const runner = new FakeProcessRunner(gitScript(["base", "newer"]));
    await runCommand(runner);

    expect(release).toHaveBeenCalledExactlyOnceWith();
    expect(fs.readFileSync(environmentFile, "utf8")).toBe(
      "RELEASE_SUPERSEDED=true\n",
    );
    expect(process.exitCode).toBe(0);
  });

  it("fails when semantic-release fails and main has not moved", async () => {
    expect.hasAssertions();

    release.mockResolvedValue(false);

    const runner = new FakeProcessRunner(gitScript(["base"]));
    await runCommand(runner);

    expect(fs.readFileSync(environmentFile, "utf8")).toBe("");
    expect(process.exitCode).toBe(1);
  });

  it("previews the release on --dry-run without looking at main", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner({});
    await runCommand(runner, { dryRun: true });

    expect(release).toHaveBeenCalledExactlyOnceWith({ dryRun: true });
    expect(fs.readFileSync(environmentFile, "utf8")).toBe("");
    expect(process.exitCode).toBe(0);
  });

  it("fails a --dry-run preview that does not finish", async () => {
    expect.hasAssertions();

    release.mockResolvedValue(false);

    const runner = new FakeProcessRunner({});
    await runCommand(runner, { dryRun: true });

    expect(process.exitCode).toBe(1);
  });

  it("fails and says why when the checkout has no HEAD", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner({
      "git rev-parse HEAD": failed("bad revision", 128),
    });
    await runCommand(runner);

    expect(reportLines).toStrictEqual([
      "❌ git rev-parse HEAD exited 128: bad revision",
    ]);
    expect(process.exitCode).toBe(1);
  });
});

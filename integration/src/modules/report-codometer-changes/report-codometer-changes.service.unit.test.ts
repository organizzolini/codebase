import fs from "node:fs";
import path from "node:path";

import { createMock } from "@golevelup/ts-vitest";
import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import {
  failed,
  FakeProcessRunner,
  succeeded,
  useTemporaryDirectories,
} from "../../../testing/mocks";
import { ProcessRunnerService } from "../process-runner/process-runner.service";

import { ReportCodometerChangesService } from "./report-codometer-changes.service";

import type { CapturedProcess } from "../process-runner/process-runner.types";
import type { ReportCodometerChangesOutcome } from "./report-codometer-changes.types";

const LIST =
  "gh run list --workflow=continuous-integration.yml --branch=main --status=success --limit=1 --json=databaseId --jq=.[0].databaseId";
const DOWNLOAD =
  "gh run download 4242 --name=codometer-reports-main --dir=codometer-baseline";
const VIEW = "gh pr view 7 --json=body --jq=.body";

describe(ReportCodometerChangesService, () => {
  const makeDirectory = useTemporaryDirectories();
  let service: ReportCodometerChangesService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ReportCodometerChangesService,
        { provide: ConfigService, useValue: createMock<ConfigService>() },
        {
          provide: ProcessRunnerService,
          useValue: createMock<ProcessRunnerService>(),
        },
      ],
    }).compile();

    service = await module.resolve(ReportCodometerChangesService);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(service).toBeDefined();
  });

  /** Reports over a scripted process runner, with the environment of a pull request run. */
  const report = async (
    script: Record<string, CapturedProcess>,
    streamStatus = 0,
    environment: Record<string, string | undefined> = {},
  ): Promise<{
    bodyFile: string;
    outcome: ReportCodometerChangesOutcome;
    runner: FakeProcessRunner;
  }> => {
    const temporary = makeDirectory();
    const environmentWithDefaults: Record<string, string | undefined> = {
      GITHUB_REPOSITORY: "owner/repository",
      GITHUB_SERVER_URL: "https://github.test",
      PULL_REQUEST: "7",
      RUNNER_TEMP: temporary,
      ...environment,
    };

    for (const [name, value] of Object.entries(environmentWithDefaults)) {
      vi.stubEnv(name, value);
    }

    const runner = new FakeProcessRunner(script, streamStatus);
    const module = await Test.createTestingModule({
      providers: [
        ReportCodometerChangesService,
        { provide: ConfigService, useValue: new ConfigService() },
        { provide: ProcessRunnerService, useValue: runner },
      ],
    }).compile();
    const subject = await module.resolve(ReportCodometerChangesService);

    return {
      bodyFile: path.join(temporary, ".pull-request-body.md"),
      outcome: subject.report(),
      runner,
    };
  };

  it("fails when the pull request is not named", async () => {
    expect.hasAssertions();

    const { outcome, runner } = await report({}, 0, { PULL_REQUEST: "" });

    expect(outcome).toStrictEqual({
      exitCode: 1,
      lines: ["❌ PULL_REQUEST is unset; name the pull request to report on"],
    });
    expect(runner.lines).toStrictEqual([]);
  });

  it("compares against the baseline and writes the body back", async () => {
    expect.hasAssertions();

    const { bodyFile, outcome, runner } = await report({
      [DOWNLOAD]: succeeded(),
      "gh pr edit *": succeeded(),
      [LIST]: succeeded("4242\n"),
      [VIEW]: succeeded("## Body\n"),
    });

    expect(outcome).toStrictEqual({
      exitCode: 0,
      lines: [
        "📥 Comparing against the codometer baseline of https://github.test/owner/repository/actions/runs/4242",
      ],
    });
    expect(runner.streamed[0]?.args).toStrictEqual([
      "exec",
      "nx",
      "run",
      "codometer-cli:start",
      "--",
      "changes",
      "--baseline=codometer-baseline",
      "--baseline-url=https://github.test/owner/repository/actions/runs/4242",
      `--markdown=${bodyFile}`,
    ]);
    expect(fs.readFileSync(bodyFile, "utf8")).toBe("## Body\n");
    expect(runner.lines.at(-1)).toBe(`gh pr edit 7 --body-file=${bodyFile}`);
  });

  it("reports without a baseline when no run on main succeeded yet", async () => {
    expect.hasAssertions();

    const { outcome, runner } = await report({
      "gh pr edit *": succeeded(),
      [LIST]: succeeded("\n"),
      [VIEW]: succeeded("body"),
    });

    expect(outcome.exitCode).toBe(0);
    expect(outcome.lines).toStrictEqual([
      "ℹ️ No successful main run to compare against yet.",
    ]);
    expect(runner.streamed[0]?.args).not.toContain(
      "--baseline=codometer-baseline",
    );
  });

  it.each([
    ["listing runs fails", { [LIST]: failed("api down") }],
    [
      "the download fails",
      { [DOWNLOAD]: failed("no artifact"), [LIST]: succeeded("4242") },
    ],
  ])("goes on without a baseline when %s", async (_name, script) => {
    expect.hasAssertions();

    const { outcome, runner } = await report({
      ...script,
      "gh pr edit *": succeeded(),
      [VIEW]: succeeded("body"),
    });

    expect(outcome.exitCode).toBe(0);
    expect(outcome.lines[0]).toContain(
      "::warning::Reporting without a codometer baseline",
    );
    expect(runner.streamed).toHaveLength(1);
  });

  it("defaults the server to github.com", async () => {
    expect.hasAssertions();

    const { outcome } = await report(
      {
        [DOWNLOAD]: succeeded(),
        "gh pr edit *": succeeded(),
        [LIST]: succeeded("4242"),
        [VIEW]: succeeded("body"),
      },
      0,
      { GITHUB_SERVER_URL: undefined },
    );

    expect(outcome.lines[0]).toContain(
      "https://github.com/owner/repository/actions/runs/4242",
    );
  });

  it.each([
    [
      "reading the pull request",
      { [LIST]: succeeded(""), [VIEW]: failed("not found", 4) },
      0,
      4,
    ],
    [
      "measuring the changes",
      { [LIST]: succeeded(""), [VIEW]: succeeded("body") },
      3,
      3,
    ],
    [
      "editing the pull request",
      {
        "gh pr edit *": failed("forbidden", 5),
        [LIST]: succeeded(""),
        [VIEW]: succeeded("body"),
      },
      0,
      5,
    ],
  ])(
    "fails with the code of the step that failed: %s",
    async (_name, script, streamStatus, exitCode) => {
      expect.hasAssertions();

      const { outcome } = await report(script, streamStatus);

      expect(outcome.exitCode).toBe(exitCode);
    },
  );
});

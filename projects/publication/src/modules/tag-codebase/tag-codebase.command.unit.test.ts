import fs from "node:fs";
import path from "node:path";

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

import {
  failed,
  FakeProcessRunner,
  succeeded,
  useTemporaryDirectories,
} from "../../../testing/mocks";
import { MainTipService } from "../main-tip/main-tip.service";
import { ProcessRunnerService } from "../process-runner/process-runner.service";

import { TagCodebaseCommand } from "./tag-codebase.command";
import { TagCodebaseService } from "./tag-codebase.service";

import type { ScriptedAnswer } from "../../../testing/mocks";
import type { CapturedProcess } from "../process-runner/process-runner.types";

const SEMANTIC_RELEASE = "env HUSKY=0 pnpm semantic-release";

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
  const originalExitCode = process.exitCode;
  let command: TagCodebaseCommand;
  const makeDirectory = useTemporaryDirectories();
  let environmentFile: string;
  let reportLines: string[];

  /** Runs the command over the real services and a scripted process runner. */
  const runCommand = async (runner: FakeProcessRunner): Promise<void> => {
    const module = await Test.createTestingModule({
      providers: [
        MainTipService,
        TagCodebaseCommand,
        TagCodebaseService,
        { provide: ConfigService, useValue: new ConfigService() },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
        { provide: ProcessRunnerService, useValue: runner },
      ],
    }).compile();

    const subject = await module.resolve(TagCodebaseCommand);

    await subject.run();
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TagCodebaseCommand,
        {
          provide: TagCodebaseService,
          useValue: createMock<TagCodebaseService>(),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    command = await module.resolve(TagCodebaseCommand);
  });

  beforeEach(() => {
    process.exitCode = undefined;
    reportLines = [];
    environmentFile = path.join(makeDirectory(), "github-env");
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

  it("is defined", () => {
    expect.hasAssertions();
    expect(command).toBeDefined();
  });

  it("sets logger context", async () => {
    expect.hasAssertions();

    const module = await Test.createTestingModule({
      providers: [
        TagCodebaseCommand,
        {
          provide: TagCodebaseService,
          useValue: createMock<TagCodebaseService>(),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();
    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("TagCodebaseCommand");
  });

  it("runs semantic-release while main has not moved", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner(gitScript(["base"]));
    await runCommand(runner);

    expect(runner.streamed).toStrictEqual([
      { args: ["HUSKY=0", "pnpm", "semantic-release"], executable: "env" },
    ]);
    expect(fs.readFileSync(environmentFile, "utf8")).toBe("");
    expect(process.exitCode).toBe(0);
  });

  it("steps aside before semantic-release when main has moved", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner(gitScript(["newer"]));
    await runCommand(runner);

    expect(runner.streamed).toHaveLength(0);
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

    const runner = new FakeProcessRunner(gitScript(["base", "newer"]), 0, {
      [SEMANTIC_RELEASE]: 1,
    });
    await runCommand(runner);

    expect(runner.streamed).toHaveLength(1);
    expect(fs.readFileSync(environmentFile, "utf8")).toBe(
      "RELEASE_SUPERSEDED=true\n",
    );
    expect(process.exitCode).toBe(0);
  });

  it("fails when semantic-release fails and main has not moved", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner(gitScript(["base"]), 0, {
      [SEMANTIC_RELEASE]: 1,
    });
    await runCommand(runner);

    expect(fs.readFileSync(environmentFile, "utf8")).toBe("");
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

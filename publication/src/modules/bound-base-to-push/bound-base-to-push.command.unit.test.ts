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

import { LoggerService } from "@codebase/observability";

import {
  failed,
  FakeProcessRunner,
  succeeded,
  useTemporaryDirectories,
} from "../../../testing/mocks";
import { ProcessRunnerService } from "../process-runner/process-runner.service";

import { BoundBaseToPushCommand } from "./bound-base-to-push.command";
import { BoundBaseToPushService } from "./bound-base-to-push.service";

const IS_ANCESTOR = "git merge-base --is-ancestor before1 head1";

describe(BoundBaseToPushCommand, () => {
  const originalExitCode = process.exitCode;
  const makeDirectory = useTemporaryDirectories();
  let command: BoundBaseToPushCommand;
  let printed: string[];
  let githubEnvironment: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        BoundBaseToPushCommand,
        {
          provide: BoundBaseToPushService,
          useValue: createMock<BoundBaseToPushService>(),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    command = await module.resolve(BoundBaseToPushCommand);
  });

  /** Runs the command over the real service and a scripted process runner. */
  const runCommand = async (
    runner: FakeProcessRunner,
    environment: Record<string, string | undefined>,
  ): Promise<void> => {
    for (const [name, value] of Object.entries({
      BEFORE: undefined,
      GITHUB_ENV: githubEnvironment,
      NX_BASE: "base1",
      NX_HEAD: "head1",
      ...environment,
    })) {
      vi.stubEnv(name, value);
    }

    const module = await Test.createTestingModule({
      providers: [
        BoundBaseToPushCommand,
        BoundBaseToPushService,
        { provide: ConfigService, useValue: new ConfigService() },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
        { provide: ProcessRunnerService, useValue: runner },
      ],
    }).compile();

    const subject = await module.resolve(BoundBaseToPushCommand);

    await subject.run();
  };

  /** What the step wrote for later steps, or nothing. */
  const written = (): string =>
    fs.existsSync(githubEnvironment)
      ? fs.readFileSync(githubEnvironment, "utf8")
      : "";

  beforeEach(() => {
    githubEnvironment = path.join(makeDirectory(), "github-env");
    printed = [];
    vi.spyOn(console, "info").mockImplementation((line: string) => {
      printed.push(line);
    });
    vi.spyOn(console, "error").mockImplementation((line: string) => {
      printed.push(line);
    });
  });

  afterEach(() => {
    process.exitCode = originalExitCode;
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(command).toBeDefined();
  });

  it("sets logger context", async () => {
    expect.hasAssertions();

    const module = await Test.createTestingModule({
      providers: [
        BoundBaseToPushCommand,
        {
          provide: BoundBaseToPushService,
          useValue: createMock<BoundBaseToPushService>(),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();
    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("BoundBaseToPushCommand");
  });

  it("moves NX_BASE to the previous tip when it is an ancestor of the head", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner({ [IS_ANCESTOR]: succeeded() });

    await runCommand(runner, { BEFORE: "before1" });

    expect(written()).toBe("NX_BASE=before1\n");
    expect(printed).toStrictEqual([
      "🎯 Bounding NX_BASE to the push: base1 → before1",
    ]);
    expect(process.exitCode).toBe(originalExitCode);
  });

  it("appends to what earlier steps wrote rather than replacing it", async () => {
    expect.hasAssertions();

    fs.writeFileSync(githubEnvironment, "NX_HEAD=head1\n");
    const runner = new FakeProcessRunner({ [IS_ANCESTOR]: succeeded() });

    await runCommand(runner, { BEFORE: "before1" });

    expect(written()).toBe("NX_HEAD=head1\nNX_BASE=before1\n");
  });

  it("keeps NX_BASE when the previous tip is not an ancestor of the head", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner({ [IS_ANCESTOR]: failed("", 1) });

    await runCommand(runner, { BEFORE: "before1" });

    expect(written()).toBe("");
    expect(printed).toStrictEqual([
      "🎯 before1 is not an ancestor of head1; keeping NX_BASE=base1",
    ]);
  });

  it.each([
    ["missing", undefined],
    ["empty", ""],
    ["all zeros", "0000000000000000000000000000000000000000"],
  ])(
    "keeps NX_BASE without asking git when the previous tip is %s",
    async (_case, before) => {
      expect.hasAssertions();

      const runner = new FakeProcessRunner({});

      await runCommand(runner, { BEFORE: before });

      expect(runner.lines).toStrictEqual([]);
      expect(written()).toBe("");
      expect(printed).toStrictEqual([
        "🎯 No previous tip for this push; keeping NX_BASE=base1",
      ]);
    },
  );

  it.each(["NX_BASE", "NX_HEAD"])(
    "fails without touching anything when %s is unset",
    async (name) => {
      expect.hasAssertions();

      const runner = new FakeProcessRunner({});

      await runCommand(runner, { BEFORE: "before1", [name]: "" });

      expect(runner.lines).toStrictEqual([]);
      expect(written()).toBe("");
      expect(printed).toStrictEqual([
        "❌ NX_BASE and NX_HEAD are unset; run nx-set-shas first",
      ]);
      expect(process.exitCode).toBe(1);
    },
  );

  it("fails when there is no GITHUB_ENV to write the new base to", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner({ [IS_ANCESTOR]: succeeded() });

    await runCommand(runner, { BEFORE: "before1", GITHUB_ENV: "" });

    expect(printed).toStrictEqual([
      "🎯 Bounding NX_BASE to the push: base1 → before1",
      "❌ GITHUB_ENV is unset; cannot move NX_BASE",
    ]);
    expect(process.exitCode).toBe(1);
  });
});

import fs from "node:fs";
import path from "node:path";

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

import {
  failed,
  FakeProcessRunner,
  succeeded,
  useTemporaryDirectories,
} from "../../../testing/mocks";
import { ProcessRunnerService } from "../process-runner/process-runner.service";

import { MainTipService } from "./main-tip.service";

import type { ScriptedAnswer } from "../../../testing/mocks";
import type { CapturedProcess } from "../process-runner/process-runner.types";

const FETCH = "git fetch --quiet origin main";
const TIP = "git rev-parse FETCH_HEAD";

describe(MainTipService, () => {
  const makeDirectory = useTemporaryDirectories();
  let reportLines: string[];
  let service: MainTipService;

  /** Builds the service over a scripted process runner. */
  const createService = async (
    script: Record<string, ScriptedAnswer<CapturedProcess>>,
  ): Promise<{ runner: FakeProcessRunner; service: MainTipService }> => {
    const runner = new FakeProcessRunner(script);
    const module = await Test.createTestingModule({
      providers: [
        MainTipService,
        { provide: ConfigService, useValue: new ConfigService() },
        { provide: ProcessRunnerService, useValue: runner },
      ],
    }).compile();

    return { runner, service: await module.resolve(MainTipService) };
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MainTipService,
        { provide: ConfigService, useValue: new ConfigService() },
        { provide: ProcessRunnerService, useValue: new FakeProcessRunner({}) },
      ],
    }).compile();

    service = await module.resolve(MainTipService);
  });

  beforeEach(() => {
    reportLines = [];
    vi.spyOn(console, "info").mockImplementation((line: unknown): void => {
      reportLines.push(String(line));
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is defined", () => {
    expect.hasAssertions();

    expect(service).toBeDefined();
  });

  describe("hasMovedFrom", () => {
    it("reports main unmoved while the fetched tip is the base", async () => {
      expect.hasAssertions();

      const { runner, service: subject } = await createService({
        [FETCH]: succeeded(),
        [TIP]: succeeded("base\n"),
      });

      expect(subject.hasMovedFrom("base")).toBe(false);
      expect(runner.lines).toStrictEqual([FETCH, TIP]);
    });

    it("reports main moved once the fetched tip differs", async () => {
      expect.hasAssertions();

      const { service: subject } = await createService({
        [FETCH]: succeeded(),
        [TIP]: succeeded("newer\n"),
      });

      expect(subject.hasMovedFrom("base")).toBe(true);
    });

    it("lets the comparison decide when the fetch fails", async () => {
      expect.hasAssertions();

      const { service: subject } = await createService({
        [FETCH]: failed("offline"),
        [TIP]: succeeded("base\n"),
      });

      expect(subject.hasMovedFrom("base")).toBe(false);
    });
  });

  describe("head", () => {
    it("prints the checked-out commit", async () => {
      expect.hasAssertions();

      const { service: subject } = await createService({
        "git rev-parse HEAD": succeeded("abc123\n"),
      });

      expect(subject.head()).toBe("abc123");
    });

    it("fails when git cannot name it", async () => {
      expect.hasAssertions();

      const { service: subject } = await createService({
        "git rev-parse HEAD": failed("not a repository", 128),
      });

      expect(() => subject.head()).toThrow(
        "❌ git rev-parse HEAD exited 128: not a repository",
      );
    });
  });

  describe("stepAsideFrom", () => {
    it("sets RELEASE_SUPERSEDED for later steps and says why", async () => {
      expect.hasAssertions();

      const environmentFile = path.join(makeDirectory(), "github-env");
      fs.writeFileSync(environmentFile, "EARLIER=1\n");
      vi.stubEnv("GITHUB_ENV", environmentFile);
      const { service: subject } = await createService({
        "git rev-parse --short base": succeeded("abc123\n"),
        "git rev-parse --short FETCH_HEAD": succeeded("def456\n"),
      });

      subject.stepAsideFrom("base");

      expect(fs.readFileSync(environmentFile, "utf8")).toBe(
        "EARLIER=1\nRELEASE_SUPERSEDED=true\n",
      );
      expect(reportLines).toStrictEqual([
        "⏭️ main moved from abc123 to def456 during this run, whose release the newer run makes instead",
      ]);
    });

    it("fails when GITHUB_ENV is unset", async () => {
      expect.hasAssertions();

      vi.stubEnv("GITHUB_ENV", undefined);
      const { service: subject } = await createService({});

      expect(() => {
        subject.stepAsideFrom("base");
      }).toThrow("❌ GITHUB_ENV is unset");
    });
  });
});

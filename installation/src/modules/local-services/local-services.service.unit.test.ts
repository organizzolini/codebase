import fs from "node:fs";
import path from "node:path";

import { createMock } from "@golevelup/ts-vitest";
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

import { enterWorkspace } from "../../../testing/environment";
import { createFakeProcessRunner } from "../../../testing/fake-process-runner";
import { captureReport } from "../../../testing/report";
import { createTemporaryWorkspace } from "../../../testing/temporary-workspace";
import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import { LocalServicesService } from "./local-services.service";

import type {
  FakeMachine,
  FakeProcessRunner,
} from "../../../testing/fake-process-runner";
import type { TemporaryWorkspace } from "../../../testing/temporary-workspace";

const DOCKER_INFO = "docker info";
const POSTGRES_UP = "pnpm exec nx run infrastructure:postgres:up";

describe(LocalServicesService, () => {
  let service: LocalServicesService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        LocalServicesService,
        {
          provide: ProcessRunnerService,
          useValue: createMock<ProcessRunnerService>(),
        },
        { provide: ReporterService, useValue: createMock<ReporterService>() },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    service = await module.resolve(LocalServicesService);
  });

  let workspace: TemporaryWorkspace;
  let report: string[];

  /** Builds the service over a fake machine. */
  const createService = async (
    machine: FakeMachine = {},
  ): Promise<{ fake: FakeProcessRunner; subject: LocalServicesService }> => {
    const fake = createFakeProcessRunner(machine);
    const module = await Test.createTestingModule({
      providers: [
        LocalServicesService,
        ReporterService,
        { provide: ProcessRunnerService, useValue: fake.runner },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    return { fake, subject: await module.resolve(LocalServicesService) };
  };

  beforeEach(() => {
    workspace = createTemporaryWorkspace();
    report = captureReport();
    enterWorkspace(workspace);
    vi.spyOn(process, "getuid").mockReturnValue(0);
  });

  afterEach(() => {
    workspace.remove();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(service).toBeDefined();
  });

  it("leaves a daemon that already answers alone and starts Postgres", async () => {
    expect.hasAssertions();

    const { fake, subject } = await createService({ installed: ["dockerd"] });

    await subject.startLocalServices();

    expect(fake.detached).toStrictEqual([]);
    expect(fake.commands).toStrictEqual([DOCKER_INFO, POSTGRES_UP]);
    expect(report).toStrictEqual([
      "👍 A Docker daemon is already running.",
      "🐘 Starting Postgres...",
    ]);
  });

  it("starts a daemon when none answers and this is root", async () => {
    expect.hasAssertions();

    const logPath = path.join(workspace.home, ".local/state/dockerd.log");
    const { fake, subject } = await createService({
      installed: ["dockerd"],
      sequences: { [DOCKER_INFO]: [{ status: 1 }, { status: 1 }, {}] },
    });

    await subject.startLocalServices();

    expect(fake.detached).toStrictEqual([
      `sh -c exec dockerd > "${logPath}" 2>&1`,
    ]);
    expect(fs.existsSync(path.dirname(logPath))).toBe(true);
    expect(fake.commands).toStrictEqual([
      DOCKER_INFO,
      DOCKER_INFO,
      "sleep 1",
      DOCKER_INFO,
      POSTGRES_UP,
    ]);
    expect(report).toContain("✅ The Docker daemon is running.");
  });

  it("gives up on a daemon that never answers and skips Postgres", async () => {
    expect.hasAssertions();

    const { fake, subject } = await createService({
      installed: ["dockerd"],
      responses: { [DOCKER_INFO]: { status: 1 } },
    });

    await subject.startLocalServices();

    expect(fake.commands).not.toContain(POSTGRES_UP);
    expect(report).toContain(
      "⚠️  The Docker daemon did not start, so Postgres was not started.",
    );
  });

  it("does not start a daemon without root", async () => {
    expect.hasAssertions();

    vi.spyOn(process, "getuid").mockReturnValue(1000);

    const { fake, subject } = await createService({
      installed: ["dockerd"],
      responses: { [DOCKER_INFO]: { status: 1 } },
    });

    await subject.startLocalServices();

    expect(fake.detached).toStrictEqual([]);
    expect(report).toStrictEqual([
      "⚠️  No Docker daemon is reachable, so Postgres was not started.",
    ]);
  });

  it("does not start a daemon that is not installed", async () => {
    expect.hasAssertions();

    const { fake, subject } = await createService({
      responses: { [DOCKER_INFO]: { status: 1 } },
    });

    await subject.startLocalServices();

    expect(fake.detached).toStrictEqual([]);
    expect(report).toStrictEqual([
      "⚠️  No Docker daemon is reachable, so Postgres was not started.",
    ]);
  });

  it("warns, and does not fail, when Postgres does not start", async () => {
    expect.hasAssertions();

    const { subject } = await createService({
      responses: { [POSTGRES_UP]: { status: 1 } },
    });

    await expect(subject.startLocalServices()).resolves.toBeUndefined();
    expect(report).toContain(
      `⚠️  Postgres did not start. Retry with: ${POSTGRES_UP}`,
    );
  });
});

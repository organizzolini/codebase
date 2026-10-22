import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { LoggerService } from "@codebase/observability";

import { createFakeProcessRunner } from "../../../testing/fake-process-runner";
import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { RELEASE_ARCHIVE_TOOLS } from "../release-archives/release-archives.constants";
import { ReleaseArchivesService } from "../release-archives/release-archives.service";
import { ReporterService } from "../reporter/reporter.service";

import { SoftwareDatabaseService } from "./software-database.service";
import { SoftwareLinuxService } from "./software-linux.service";
import { SoftwarePythonService } from "./software-python.service";

import type { DeepMocked } from "@golevelup/ts-vitest";

/** The steps Linux runs, as mocks, with the service built over them. */
interface Steps {
  commands: string[];
  database: DeepMocked<SoftwareDatabaseService>;
  python: DeepMocked<SoftwarePythonService>;
  releases: DeepMocked<ReleaseArchivesService>;
  reporter: DeepMocked<ReporterService>;
  service: SoftwareLinuxService;
}

/** Builds the service over a Linux machine, with the given command lines failing. */
async function createSteps(failing: string[] = []): Promise<Steps> {
  const database = createMock<SoftwareDatabaseService>();
  const python = createMock<SoftwarePythonService>();
  const releases = createMock<ReleaseArchivesService>();
  const reporter = createMock<ReporterService>();
  const { commands, runner } = createFakeProcessRunner({
    platform: "linux",
    responses: Object.fromEntries(failing.map((line) => [line, { status: 1 }])),
  });
  const module = await Test.createTestingModule({
    providers: [
      SoftwareLinuxService,
      { provide: ReleaseArchivesService, useValue: releases },
      { provide: SoftwarePythonService, useValue: python },
      { provide: SoftwareDatabaseService, useValue: database },
      { provide: ProcessRunnerService, useValue: runner },
      { provide: ReporterService, useValue: reporter },
      { provide: LoggerService, useValue: createMock<LoggerService>() },
    ],
  }).compile();

  return {
    commands,
    database,
    python,
    releases,
    reporter,
    service: await module.resolve(SoftwareLinuxService),
  };
}

describe(SoftwareLinuxService, () => {
  let service: SoftwareLinuxService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SoftwareLinuxService,
        {
          provide: ReleaseArchivesService,
          useValue: createMock<ReleaseArchivesService>(),
        },
        {
          provide: SoftwarePythonService,
          useValue: createMock<SoftwarePythonService>(),
        },
        {
          provide: SoftwareDatabaseService,
          useValue: createMock<SoftwareDatabaseService>(),
        },
        {
          provide: ProcessRunnerService,
          useValue: createMock<ProcessRunnerService>(),
        },
        { provide: ReporterService, useValue: createMock<ReporterService>() },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    service = await module.resolve(SoftwareLinuxService);
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it("installs every release tool, then Python, its environment, and the database tools", async () => {
    const steps = await createSteps();

    steps.service.installLinuxTools();

    for (const tool of RELEASE_ARCHIVE_TOOLS) {
      expect(steps.releases.install).toHaveBeenCalledWith(tool);
    }

    expect(steps.python.installPythonThroughUv).toHaveBeenCalledWith();
    expect(steps.commands).toStrictEqual(["uv sync --project configuration"]);
    expect(steps.database.installSquawk).toHaveBeenCalledWith();
    expect(steps.database.installPostgres).toHaveBeenCalledWith();
    expect(steps.reporter.print).not.toHaveBeenCalled();
  });

  it("warns about a failed tool and carries on with the rest", async () => {
    const steps = await createSteps();

    steps.releases.install.mockImplementation((tool) => {
      if (tool.name === "trivy") {
        throw new Error("offline");
      }
    });

    steps.service.installLinuxTools();

    expect(steps.reporter.print).toHaveBeenCalledWith(
      expect.stringContaining("trivy was not installed (Error: offline)"),
    );
    expect(steps.releases.install).toHaveBeenCalledTimes(
      RELEASE_ARCHIVE_TOOLS.length,
    );
    expect(steps.database.installPostgres).toHaveBeenCalledWith();
  });

  it("warns when the Python environment cannot be synced", async () => {
    const steps = await createSteps(["uv sync --project configuration"]);

    steps.service.installLinuxTools();

    expect(steps.reporter.print).toHaveBeenCalledWith(
      expect.stringContaining("The Python environment was not installed"),
    );
    expect(steps.database.installPostgres).toHaveBeenCalledWith();
  });

  it("installs PostgreSQL even when squawk fails, and warns about each failure", async () => {
    const steps = await createSteps();

    steps.python.installPythonThroughUv.mockImplementation(() => {
      throw new Error("no network");
    });
    steps.database.installSquawk.mockImplementation(() => {
      throw new Error("pnpm failed");
    });
    steps.database.installPostgres.mockImplementation(() => {
      throw new Error("apt-get is not usable here");
    });

    steps.service.installLinuxTools();

    expect(steps.reporter.print).toHaveBeenCalledWith(
      expect.stringContaining("Python was not installed (Error: no network)"),
    );
    expect(steps.reporter.print).toHaveBeenCalledWith(
      expect.stringContaining("squawk was not installed (Error: pnpm failed)"),
    );
    expect(steps.reporter.print).toHaveBeenCalledWith(
      expect.stringContaining("PostgreSQL 18 was not installed"),
    );
  });
});

import fs from "node:fs";
import os from "node:os";
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

import { createFakeProcessRunner } from "../../../testing/fake-process-runner";
import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReleaseArchivesService } from "../release-archives/release-archives.service";
import { SoftwareDatabaseService } from "../software/software-database.service";

import { ToolsService } from "./tools.service";

import type { FakeMachine } from "../../../testing/fake-process-runner";
import type { ReleaseArchiveTool } from "../release-archives/release-archives.types";

const BINARY_DIRECTORY = path.join(os.homedir(), ".local", "bin");

describe(ToolsService, () => {
  const originalPath = process.env["PATH"];
  const install = vi.fn<ReleaseArchivesService["install"]>();
  const installPostgres = vi.fn<SoftwareDatabaseService["installPostgres"]>();
  let service: ToolsService;

  /** Builds the service over a fake machine, with only the path file variable set. */
  const build = async (
    environment: Record<string, string> = {},
    machine: FakeMachine = {},
  ): Promise<ToolsService> => {
    vi.unstubAllEnvs();
    vi.stubEnv("GITHUB_PATH", undefined);
    for (const [name, value] of Object.entries(environment)) {
      vi.stubEnv(name, value);
    }

    const { runner } = createFakeProcessRunner(machine);
    const module = await Test.createTestingModule({
      providers: [
        ToolsService,
        { provide: ConfigService, useValue: new ConfigService() },
        { provide: ReleaseArchivesService, useValue: { install } },
        { provide: SoftwareDatabaseService, useValue: { installPostgres } },
        { provide: ProcessRunnerService, useValue: runner },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    return module.resolve(ToolsService);
  };

  /** The names of the archive tools `install` was asked for, in order. */
  const installedNames = (): string[] =>
    install.mock.calls.map(([tool]: [ReleaseArchiveTool]) => tool.name);

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ToolsService,
        { provide: ConfigService, useValue: createMock<ConfigService>() },
        {
          provide: ReleaseArchivesService,
          useValue: createMock<ReleaseArchivesService>(),
        },
        {
          provide: SoftwareDatabaseService,
          useValue: createMock<SoftwareDatabaseService>(),
        },
        {
          provide: ProcessRunnerService,
          useValue: createMock<ProcessRunnerService>(),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    service = await module.resolve(ToolsService);
  });

  beforeEach(() => {
    install.mockReset();
    installPostgres.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    process.env["PATH"] = originalPath;
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(service).toBeDefined();
  });

  it("fails, touching nothing, when no tool is named", async () => {
    expect.hasAssertions();

    const subject = await build();

    expect(() => {
      subject.install([]);
    }).toThrow("Name at least one tool");
    expect(process.env["PATH"]).toBe(originalPath);
  });

  it("fails on a name that is not a tool, before installing any", async () => {
    expect.hasAssertions();

    const subject = await build();

    expect(() => {
      subject.install(["gitleaks", "helm"]);
    }).toThrow("Unknown tool helm");
    expect(install).not.toHaveBeenCalled();
  });

  it("installs gitleaks and Trivy from their release archives, in the order named", async () => {
    expect.hasAssertions();

    const subject = await build();

    subject.install(["trivy", "gitleaks"]);

    expect(installedNames()).toStrictEqual(["trivy", "gitleaks"]);
    expect(installPostgres).not.toHaveBeenCalled();
  });

  it("installs a tool named twice once", async () => {
    expect.hasAssertions();

    const subject = await build();

    subject.install(["gitleaks", "gitleaks"]);

    expect(installedNames()).toStrictEqual(["gitleaks"]);
  });

  it("installs PostgreSQL 18 and checks that 18's pg_dump is the one found", async () => {
    expect.hasAssertions();

    const subject = await build(
      {},
      {
        responses: {
          "pg_dump --version": { stdout: "pg_dump (PostgreSQL) 18.6\n" },
        },
      },
    );

    subject.install(["postgres-client"]);

    expect(installPostgres).toHaveBeenCalledTimes(1);
    expect(install).not.toHaveBeenCalled();
  });

  it("fails when the pg_dump found first is not 18", async () => {
    expect.hasAssertions();

    const subject = await build(
      {},
      {
        responses: {
          "pg_dump --version": { stdout: "pg_dump (PostgreSQL) 16.4\n" },
        },
      },
    );

    expect(() => {
      subject.install(["postgres-client"]);
    }).toThrow("pg_dump is not PostgreSQL 18");
  });

  it("puts the install directory first on PATH, and in the file Actions reads", async () => {
    expect.hasAssertions();

    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "tools-"));
    const pathFile = path.join(directory, "github-path");
    const subject = await build({ GITHUB_PATH: pathFile });

    subject.install(["gitleaks"]);

    expect(
      process.env["PATH"]?.startsWith(`${BINARY_DIRECTORY}${path.delimiter}`),
    ).toBe(true);
    expect(fs.readFileSync(pathFile, "utf8")).toBe(`${BINARY_DIRECTORY}\n`);

    fs.rmSync(directory, { force: true, recursive: true });
  });

  it("writes no path file when none is named", async () => {
    expect.hasAssertions();

    const subject = await build();

    expect(() => {
      subject.install(["gitleaks"]);
    }).not.toThrow();
  });

  it("lets a failed install fail the run", async () => {
    expect.hasAssertions();

    install.mockImplementationOnce(() => {
      throw new Error("gitleaks does not match its published checksum");
    });

    const subject = await build();

    expect(() => {
      subject.install(["gitleaks"]);
    }).toThrow("published checksum");
  });
});
